"use client";

import useExecOnChain from "@/clients/shared/hooks/useExecOnChain";
import { createAccessPolicyTx } from "@/clients/shared/libs/contracts.libs";
import { createSealClient, sealEncryptFile, type SealEncryptResult } from "@/clients/shared/libs/seal.lib";
import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { EncryptedObject } from "@mysten/seal";
import { getFullnodeUrl, SuiClient, SuiTransactionBlockResponse } from "@mysten/sui/client";
import { fromHex, toHex } from "@mysten/sui/utils";
import { walrus, WalrusBlob, WalrusClient, WalrusFile, WriteFilesFlow } from "@mysten/walrus";
import { useRef, useState, useMemo } from "react";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";


export const PACKAGE_ID = "0x9c82c149aadc4db9e9b1efb0c16cb6e75978713dc10e669d40a01570d75d6270";

export type Data = {
	status: string;
	blobId: string;
	endEpoch: string;
	suiRefType: string;
	suiRef: string;
	suiBaseUrl: string;
	blobUrl: string;
	suiUrl: string;
	isImage: string;
  };
  
  interface WalrusUploadProps {
	policyObject: string;
	cap_id: string;
	moduleName: string;
  }

export function WalrusUpload() {
    const {exec, status} = useExecOnChain();
	const currentAccount = useCurrentAccount();
	const [file, setFile] = useState<File | null>(null);
  	const [info, setInfo] = useState<Data | null>(null);
	const [blobId, setBlobId] = useState<string>('');
	const [id, setId] = useState('');
	const [policyObjectId, setPolicyObjectId] = useState<string>('');
	const [capId, setCapId] = useState<string>('');
	const [error, setError] = useState<string | null>(null);

	const suiClient = useSuiClient() as SuiClient & { walrus: WalrusClient };

	const client = new SuiJsonRpcClient({
		url: getFullnodeUrl('testnet'),
		// Setting network on your client is required for walrus to work correctly
		network: 'testnet',
	}).$extend(walrus({
		wasmUrl: 'https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm'
	}));

	// Seal Client 초기화
	const sealClient = useMemo(() => createSealClient(suiClient), [suiClient]);

	const flowRef = useRef<WriteFilesFlow | null>(null);
	const [sealResult, setSealResult] = useState<SealEncryptResult | null>(null);
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

	if (!currentAccount) {
		return <div>No account connected</div>;
	}

	const handleFileChange = (event: any) => {
		const file = event.target.files[0];
		// Max 10 MiB size
		if (file.size > 10 * 1024 * 1024) {
		  alert('File size must be less than 10 MiB');
		  return;
		}
		// Check if file is an image
		// if (!file.type.startsWith('application/pdf')) {
		//   alert('Only image files are allowed');
		//   return;
		// }
		setFile(file);
		setInfo(null);
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
				const { policyObjectId: newPolicyId, capId: newCapId } = await createAccessPolicyObject();

				// Encrypt the file
				const encryptedBytes = await encrypt(newPolicyId, result);

				// Store the blob
				await storeBlob(encryptedBytes);
			} catch (err) {
				console.error('Upload failed:', err);
				setError(err instanceof Error ? err.message : 'Upload failed');
				setState('empty');
			}
		};
		reader.readAsArrayBuffer(file);
	};

	async function createAccessPolicyObject(): Promise<{ policyObjectId: string; capId: string }> {
		const tx = createAccessPolicyTx('0xd9c6a152a14be1045cfa2548da7fb2db3d6215d13ed1c172d8b325620d440680'); // TODO: platform wallet address

		const result = await exec(tx);
		const createdIds = extractCreatedIds(result);
		const newPolicyId = createdIds[0] ?? '';
		const newCapId = createdIds[1] ?? '';

		if (!newPolicyId || !newCapId) {
			throw new Error('Failed to create access policy object');
		}

		setPolicyObjectId(newPolicyId);
		setCapId(newCapId);

		return { policyObjectId: newPolicyId, capId: newCapId };
	}

	const extractCreatedIds = (result: SuiTransactionBlockResponse | undefined) => {
		const created = result?.effects?.created ?? [];
		return created
		  .map((obj) => ('reference' in obj ? obj.reference?.objectId : undefined))
		  .filter(Boolean);
	  };

	async function encrypt(policyObjectId: string, fileData: ArrayBuffer): Promise<Uint8Array> {
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

		setId(encryptionId);
		setSealResult({
			id: encryptionId,
			encryptedData: encryptedBytes,
			backupKey
		});

		return encryptedBytes;
	}

	async function storeBlob(encryptedBytes: Uint8Array): Promise<void> {
		if (!currentAccount?.address) {
			throw new Error('No account connected');
		}

		// Encode the blob
		setState('encoding');
		const flow = client.walrus.writeBlobFlow({
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
		console.log("Upload digest:", digest);
		setState('uploaded');

		// Certify the blob
		setState('certifying');
		const certifyTx = flow.certify();
		await exec(certifyTx);
		console.log("Certification complete");

		// Get the blob ID
		const { blobId: newBlobId } = await flow.getBlob();
		setBlobId(newBlobId);
		setState('done');
	}

	return (
		<div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
			<h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
				Walrus Upload with Seal Encryption
			</h2>

			<div className="space-y-6">
				{/* File Input Section */}
				<div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
					<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
						Select File (Max 10 MiB)
					</label>
					<input
						className="block w-full text-sm text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 focus:outline-none p-2"
						type="file"
						onChange={handleFileChange}
						disabled={state !== 'empty'}
					/>
					{file && (
						<div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
							<p>Selected: <span className="font-semibold">{file.name}</span></p>
							<p>Size: {(file.size / 1024).toFixed(2)} KB</p>
						</div>
					)}
				</div>

				{/* Upload Button */}
				<button
					onClick={handleSubmit}
					disabled={!file || state !== 'empty'}
					className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
				>
					{state !== 'empty' ? 'Processing...' : 'Encrypt & Upload to Walrus'}
				</button>

				{/* Status Section */}
				{state !== 'empty' && (
					<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
						<h3 className="font-semibold text-gray-900 dark:text-white mb-2">Upload Status</h3>
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<div className={`w-3 h-3 rounded-full ${state === 'encrypting' ? 'bg-yellow-500 animate-pulse' : state === 'done' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
								<span className="text-sm text-gray-700 dark:text-gray-300">
									Current State: <span className="font-semibold capitalize">{state}</span>
								</span>
							</div>

							{/* Progress Steps */}
							<div className="mt-4 space-y-1">
								{['encrypting', 'encoding', 'encoded', 'registering', 'uploading', 'uploaded', 'certifying', 'done'].map((step) => {
									const stepIndex = ['encrypting', 'encoding', 'encoded', 'registering', 'uploading', 'uploaded', 'certifying', 'done'].indexOf(step);
									const currentIndex = ['encrypting', 'encoding', 'encoded', 'registering', 'uploading', 'uploaded', 'certifying', 'done'].indexOf(state);
									const isComplete = stepIndex < currentIndex;
									const isCurrent = step === state;

									return (
										<div key={step} className="flex items-center space-x-2">
											<span className={`text-xs ${isComplete ? 'text-green-600 dark:text-green-400' : isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
												{isComplete ? '✓' : isCurrent ? '→' : '○'} {step}
											</span>
										</div>
									);
								})}
							</div>
						</div>
					</div>
				)}

				{/* Seal Result Section */}
				{sealResult && (
					<div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
						<h3 className="font-semibold text-gray-900 dark:text-white mb-2">Encryption Details</h3>
						<div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
							<p>Encrypted data size: <span className="font-mono">{sealResult.encryptedData.length}</span> bytes</p>
							<p>Encryption ID: <span className="font-mono text-xs">{sealResult.id}</span></p>
						</div>
					</div>
				)}

				{/* Policy IDs Section */}
				{(policyObjectId || capId) && (
					<div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
						<h3 className="font-semibold text-gray-900 dark:text-white mb-2">Access Policy</h3>
						<div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
							{policyObjectId && <p>Policy Object: <span className="font-mono text-xs break-all">{policyObjectId}</span></p>}
							{capId && <p>Capability ID: <span className="font-mono text-xs break-all">{capId}</span></p>}
						</div>
					</div>
				)}

				{/* Blob IDs Section */}
				{blobId && (
					<div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
						<h3 className="font-semibold text-gray-900 dark:text-white mb-2">Access Policy</h3>
						<div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
							{blobId && <p>BlobID: <span className="font-mono text-xs break-all">{blobId}</span></p>}
						</div>
					</div>
				)}

				{/* IDs Section */}
				{id && (
					<div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
						<h3 className="font-semibold text-gray-900 dark:text-white mb-2">Access Policy</h3>
						<div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
							{id && <p>ID: <span className="font-mono text-xs break-all">{id}</span></p>}
						</div>
					</div>
				)}

				{/* Error Section */}
				{error && (
					<div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
						<h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">Error</h3>
						<p className="text-sm text-red-700 dark:text-red-400">{error}</p>
					</div>
				)}

				{/* Success Message */}
				{state === 'done' && !error && (
					<div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-lg p-4 text-center">
						<p className="text-green-800 dark:text-green-300 font-semibold text-lg">
							✓ Upload Complete!
						</p>
					</div>
				)}
			</div>
		</div>
	);
}