import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { WalrusClient } from "@mysten/walrus";
import { createSealClient } from "../libs/seal.lib";
import { useMemo, useState, ChangeEvent } from "react";
import { fromHex, toHex } from "@mysten/sui/utils";
import { walrusClient } from "../libs/walrus.lib";
import useExecOnChain from "./useExecOnChain";
import { createAccessPolicyTx, extractAccessPolicyObjectIds } from "../libs/contracts.libs";
import { PACKAGE_ID, PLATFORM_WALLET_ADDRESS } from "../config/contract.config";
import { readFileAsArrayBuffer } from "../utils/file.utils";

export type UploadResult = {
    policyObjectId: string;
    capId: string;
    encryptionId: string;
    blobId: string;
};

export type UploadState =
    | 'empty'
    | 'encrypting'
    | 'encoding'
    | 'encoded'
    | 'registering'
    | 'uploading'
    | 'uploaded'
    | 'certifying'
    | 'done';

export const useFileUpload = () => {
    const currentAccount = useCurrentAccount();
    const { exec } = useExecOnChain();
    const suiClient = useSuiClient() as SuiClient & { walrus: WalrusClient };
    const sealClient = useMemo(() => createSealClient(suiClient), [suiClient]);

    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [state, setState] = useState<UploadState>('empty');


    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || event.target.files.length === 0) {
            return;
        }
        const selectedFile = event.target.files[0];
        // Max 10 MiB size
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10 MiB');
            return;
        }
        // TODO: file mimetype check (only pdf)
        setError(null);
        setFile(selectedFile);
    };

    const handleSubmit = async () => {
        if (!file) {
            setError('No file selected');
            return;
        }

        setError(null);
        setState('encrypting');

        try {
            const result = await readFileAsArrayBuffer(file);

            // Create access policy and get the IDs
            const { policyObjectId, capId } = await createAccessPolicyObject();

            // Encrypt the file
            const { encryptedBytes, encryptionId } = await encrypt(policyObjectId, result);

            // Store the blob
            const blobId = await storeBlob(encryptedBytes);

            const newUploadResult: UploadResult = {
                policyObjectId,
                capId,
                encryptionId,
                blobId
            };

            setUploadResult(newUploadResult);
        } catch (err) {
            console.error('Upload failed:', err);
            setError(err instanceof Error ? err.message : 'Upload failed');
            setState('empty');
        }
    };

    const createAccessPolicyObject = async (): Promise<{ policyObjectId: string; capId: string }> => {
        const tx = createAccessPolicyTx(PLATFORM_WALLET_ADDRESS);

        const result = await exec(tx);
        const { policyObjectId, capId } = extractAccessPolicyObjectIds(result);

        return { policyObjectId, capId };
    }

    const encrypt = async (policyObjectId: string, fileData: ArrayBuffer) => {
        setState('encrypting');

        const nonce = crypto.getRandomValues(new Uint8Array(5));
        const policyObjectBytes = fromHex(policyObjectId);
        const encryptionId = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));

        const { encryptedObject: encryptedBytes } = await sealClient.encrypt({
            threshold: 2,
            packageId: PACKAGE_ID,
            id: encryptionId,
            data: new Uint8Array(fileData),
        });

        return { encryptedBytes, encryptionId };
    }

    const storeBlob = async (encryptedBytes: Uint8Array) => {
        if (!currentAccount) {
            throw Error("No Account connected!");
        }

        // Encode the blob
        setState('encoding');
        const flow = walrusClient.writeBlobFlow({
            blob: encryptedBytes
        });

        await flow.encode();
        setState('encoded');

        // Register the blob
        setState('registering');
        const registerTx = flow.register({
            epochs: 1,
            owner: currentAccount.address,
            deletable: true,
        });

        // Upload the blob
        setState('uploading');
        const { digest } = await exec(registerTx);
        await flow.upload({ digest });
        setState('uploaded');

        // Certify the blob
        setState('certifying');
        const certifyTx = flow.certify();
        await exec(certifyTx);

        // Get the blob ID
        const { blobId } = await flow.getBlob();
        setState('done');

        return blobId
    }

    return {
        file,
        error,
        uploadResult,
        state,
        handleFileChange,
        handleSubmit
    }
}