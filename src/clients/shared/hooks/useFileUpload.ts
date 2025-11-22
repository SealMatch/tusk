import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { WalrusClient } from "@mysten/walrus";
import { createSealClient } from "../libs/seal.lib";
import { useMemo, useState } from "react";
import { fromHex, toHex } from "@mysten/sui/utils";
import { walrusClient } from "../libs/walrus.lib";
import useExecOnChain from "./useExecOnChain";
import { createAccessPolicyTx } from "../libs/contracts.libs";

const PACKAGE_ID = "0x9c82c149aadc4db9e9b1efb0c16cb6e75978713dc10e669d40a01570d75d6270";
const ADMIN_CAP_TYPE = `${PACKAGE_ID}::access_policy::AdminCap`;
const ACCESS_POLICY_TYPE = `${PACKAGE_ID}::access_policy::AccessPolicy`;

export type UploadResult = {
    policyObjectId: string;
    capId: string;
    encryptionId: string;
    blobId: string;
};

export const useFileUpload = () => {
	const currentAccount = useCurrentAccount();
    const {exec, status} = useExecOnChain();
	const suiClient = useSuiClient() as SuiClient & { walrus: WalrusClient };
    const sealClient = useMemo(() => createSealClient(suiClient), [suiClient]);

    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
    const [state, setState] = useState<
		| 'empty'
		| 'encrypting'
		| 'encoding'
		| 'encoded'
		| 'registering'
		| 'uploading'
		| 'uploaded'
		| 'certifying'
		| 'done'
	>('empty');


    const handleFileChange = (event: any) => {
		const file = event.target.files[0];
		// Max 10 MiB size
		if (file.size > 10 * 1024 * 1024) {
		  alert('File size must be less than 10 MiB');
		  return;
		}
        // TODO: file mimetype check (only pdf)
		setFile(file);
	};

    const handleSubmit = () => {
        if (!file) {
            setError('No file selected');
            return;
        }

        setError(null);
        setState('encrypting');

        const reader = new FileReader();
        reader.onload = async function (event) {
            try {
                if (!event.target?.result) {
                    throw new Error('Failed to read file');
                }

                const result = event.target.result;
                if (!(result instanceof ArrayBuffer)) {
                    throw new Error('Unexpected file result type');
                }

                // Create access policy and get the IDs
                const { policyObjectId, capId } = await createAccessPolicyObject();

                // Encrypt the file
                const { encryptedBytes, encryptionId } = await encrypt(policyObjectId, result);

                // Store the blob
                const blobId = await storeBlob(encryptedBytes);

                const uploadResult: UploadResult = {
                    policyObjectId,
                    capId,
                    encryptionId,
                    blobId
                };

                setUploadResult(uploadResult);
            } catch (err) {
                console.error('Upload failed:', err);
                setError(err instanceof Error ? err.message : 'Upload failed');
                setState('empty');
                throw(err);
            }
        };
        reader.readAsArrayBuffer(file);
	};



	const createAccessPolicyObject = async (): Promise<{ policyObjectId: string; capId: string }> => {
		const tx = createAccessPolicyTx('0xd9c6a152a14be1045cfa2548da7fb2db3d6215d13ed1c172d8b325620d440680'); // TODO: platform wallet address

		const result = await exec(tx);
		const { policyObjectId, capId } = extractObjectIds(result);

		if (!policyObjectId || !capId) {
			throw new Error('Failed to create access policy object');
		}

		return { policyObjectId, capId };
	}

    const extractObjectIds = (result: any) => {
        const changes = result.objectChanges;
      
        let capId: string | null = null;
        let policyObjectId: string | null = null;
      
        if (!changes) {
            console.error("No object changes found. Did you set showObjectChanges: true?");
            throw Error("AccessPolicy and AdminCap did not created successfully..");
        }
      
        for (const change of changes) {
          // 새로 생성된 객체만 필터링 ('created')
          if (change.type === 'created') {
            // 타입 비교 (정확히 일치하거나, 혹은 endsWith 등을 사용)
            if (change.objectType === ADMIN_CAP_TYPE) {
              capId = change.objectId;
            } 
            else if (change.objectType === ACCESS_POLICY_TYPE) {
              policyObjectId = change.objectId;
            }
          }
        }

        if ( !policyObjectId || !capId ) {
            throw Error("AccessPolicy and AdminCap did not created successfully..");
        }
      
        return { policyObjectId, capId };
    }

	const encrypt = async (policyObjectId: string, fileData: ArrayBuffer) => {
		setState('encrypting');

		const nonce = crypto.getRandomValues(new Uint8Array(5));
		const policyObjectBytes = fromHex(policyObjectId);
		const encryptionId = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));

		const { encryptedObject: encryptedBytes, key: backupKey } = await sealClient.encrypt({
			threshold: 2,
			packageId: PACKAGE_ID,
			id: encryptionId,
			data: new Uint8Array(fileData),
		});

		return { encryptedBytes, encryptionId } ;
	}

	const storeBlob = async (encryptedBytes: Uint8Array) => {
        if ( !currentAccount ) {
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