import { useCurrentAccount, useSignPersonalMessage, useSuiClient } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { WalrusClient } from "@mysten/walrus";
import { useMemo, useState } from "react";
import { createSealClient, createSessionKey, sealDecryptFile } from "../libs/seal.lib";
import { walrusClient } from "../libs/walrus.lib";
import { SessionKey } from "@mysten/seal";
import { sealApproveTx } from "../libs/contracts.libs";

const PACKAGE_ID = "0x9c82c149aadc4db9e9b1efb0c16cb6e75978713dc10e669d40a01570d75d6270";

type FileDownloadParam = {
    blobId: string,
    policyObjectId: string,
    encryptionId: string,
}

export const useFileDownload = ({blobId, policyObjectId, encryptionId}: FileDownloadParam) => {
    const currentAccount = useCurrentAccount();
	const suiClient = useSuiClient() as SuiClient & { walrus: WalrusClient };
    const sealClient = useMemo(() => createSealClient(suiClient), [suiClient]);
    const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

    const [error, setError] = useState<string | null>(null);
	const [state, setState] = useState<
		| 'empty'
		| 'downloading'
		| 'creating_session'
		| 'signing'
		| 'decrypting'
		| 'done'
	>('empty');


	const downloadBlobFromWalrus = async (blobId: string): Promise<Uint8Array> => {
		setState('downloading');
		const walrusBlob = await walrusClient.getBlob({ blobId });
		if (!walrusBlob) {
			throw new Error("Blob not found in Walrus");
		}
		const blobBytes = await walrusBlob.asFile().bytes();
		console.log("Downloaded encrypted blob, size:", blobBytes.length);
		return blobBytes;
	}

	const createAndSignSessionKey = async (address: string): Promise<SessionKey> => {
		setState('creating_session');
		const sessionKey = await createSessionKey(
			suiClient,
			address,
			PACKAGE_ID,
			10 // 10 minute TTL
		);

		setState('signing');
		const personalMessage = sessionKey.getPersonalMessage();
		const { signature } = await signPersonalMessage({
			message: personalMessage
		});
		sessionKey.setPersonalMessageSignature(signature);

		return sessionKey;
	}

	const decryptBlob = async (
		encryptedData: Uint8Array,
		sessionKey: SessionKey,
		policyObjectId: string,
		encryptionId: string
	): Promise<Uint8Array> => {
		// Build seal_approve transaction
		const tx = sealApproveTx(policyObjectId, encryptionId);

		const txBytes = await tx.build({
			client: suiClient,
			onlyTransactionKind: true
		});

		// Decrypt the data
		setState('decrypting');
		const decryptedData = await sealDecryptFile(
			sealClient,
			encryptedData,
			sessionKey,
			txBytes
		);

		return decryptedData;
	}

    const handleDownload = async () => {
		if (!currentAccount) {
			setError("No account connected");
			return;
		}

		if (!blobId || !policyObjectId || !encryptionId) {
			setError("Blob ID, Policy Object ID, and ID are all required");
			return;
		}

		try {
			setError(null);

			// Download encrypted blob from Walrus
			const encryptedData = await downloadBlobFromWalrus(blobId);

			// Create and sign session key
			const sessionKey = await createAndSignSessionKey(currentAccount.address);

			// Decrypt the blob
			const decryptedData = await decryptBlob(encryptedData, sessionKey, policyObjectId, encryptionId);

			setState('done');

			// Download the decrypted file
			downloadFile(decryptedData);

		} catch (err) {
			console.error('Download/decrypt failed:', err);
			setError(err instanceof Error ? err.message : String(err));
			setState('empty');
		}
	}

	const downloadFile = (data: Uint8Array) => {
		const blob = new Blob([data as BlobPart]);
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'decrypted-file';
		a.click();
		URL.revokeObjectURL(url);
	}

    return {
        error,
        state,
        handleDownload
    }
}