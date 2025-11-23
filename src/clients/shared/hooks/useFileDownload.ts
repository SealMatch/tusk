import { useCurrentAccount, useSignPersonalMessage, useSuiClient } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { WalrusClient } from "@mysten/walrus";
import { useMemo, useState } from "react";
import { createSealClient, createSessionKey, sealDecryptFile } from "../libs/seal.lib";
import { walrusClient } from "../libs/walrus.lib";
import { SessionKey } from "@mysten/seal";
import { sealApproveTx } from "../libs/contracts.libs";
import { PACKAGE_ID, SESSION_KEY_TTL_MIN } from "../config/contract.config";

type FileDownloadParam = {
	blobId: string,
	policyObjectId: string,
	encryptionId: string,
}

export type DownloadState =
	| 'empty'
	| 'downloading'
	| 'creating_session'
	| 'signing'
	| 'decrypting'
	| 'done';

export const useFileDownload = () => {
	const currentAccount = useCurrentAccount();
	const suiClient = useSuiClient() as SuiClient & { walrus: WalrusClient };
	const sealClient = useMemo(() => createSealClient(suiClient), [suiClient]);
	const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();

	const [error, setError] = useState<string | null>(null);
	const [state, setState] = useState<DownloadState>('empty');
	const [isDownloading, setIsDownloading] = useState(false);


	const handleDownload = async ({ blobId, policyObjectId, encryptionId }: FileDownloadParam) => {
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

			setIsDownloading(true);

			const encryptedData = await downloadBlobFromWalrus(blobId);
			const sessionKey = await createAndSignSessionKey(currentAccount.address);
			const decryptedData = await decryptBlob(encryptedData, sessionKey, policyObjectId, encryptionId);

			setState('done');

			downloadFile(decryptedData, blobId);

			// Reset state after download completes
			setTimeout(() => {
				setState('empty');
				setIsDownloading(false);
			}, 1000);

		} catch (err) {
			console.error('Download/decrypt failed:', err);
			setError(err instanceof Error ? err.message : String(err));
			setState('empty');
			setIsDownloading(false);
		}
	}


	const downloadBlobFromWalrus = async (blobId: string): Promise<Uint8Array> => {
		setState('downloading');

		const walrusBlob = await walrusClient.getBlob({ blobId });

		if (!walrusBlob) {
			throw new Error("Blob not found in Walrus");
		}

		const blobBytes = await walrusBlob.asFile().bytes();

		return blobBytes;
	}

	const createAndSignSessionKey = async (address: string): Promise<SessionKey> => {
		setState('creating_session');
		const sessionKey = await createSessionKey(
			suiClient,
			address,
			PACKAGE_ID,
			SESSION_KEY_TTL_MIN
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
		const tx = sealApproveTx(policyObjectId, encryptionId);

		const txBytes = await tx.build({
			client: suiClient,
			onlyTransactionKind: true
		});

		setState('decrypting');

		const decryptedData = await sealDecryptFile(
			sealClient,
			encryptedData,
			sessionKey,
			txBytes
		);

		return decryptedData;
	}

	const downloadFile = (data: Uint8Array, blobId: string) => {
		const blob = new Blob([data as BlobPart]);
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `resume-${blobId}.pdf`;
		a.click();
		URL.revokeObjectURL(url);
	}

	return {
		error,
		state,
		handleDownload,
		isDownloading
	}
}