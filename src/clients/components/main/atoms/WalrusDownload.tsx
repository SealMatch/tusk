"use client";

import { useFileDownload } from "@/clients/shared/hooks/useFileDownload";
import { useState } from "react";

export function WalrusDownload() {
	const [blobId, setBlobId] = useState("");
	const [policyObjectId, setPolicyObjectId] = useState("");
	const [encryptionId, setEncryptionId] = useState("");

	const { error, state, handleDownload } = useFileDownload();

	return (
		<div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
			<h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
				Download and Decrypt File from Walrus
			</h2>

			<div className="space-y-6">
				{/* Blob ID Input Section */}
				<div>
					<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
						Blob ID
					</label>
					<input
						type="text"
						value={blobId}
						onChange={(e) => setBlobId(e.target.value)}
						disabled={state !== 'empty'}
						placeholder="0x..."
						className="block w-full text-sm text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3"
					/>
				</div>

				{/* Policy Object ID Input Section */}
				<div>
					<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
						Policy Object ID
					</label>
					<input
						type="text"
						value={policyObjectId}
						onChange={(e) => setPolicyObjectId(e.target.value)}
						disabled={state !== 'empty'}
						placeholder="0x..."
						className="block w-full text-sm text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3"
					/>
				</div>

				{/* Encryption ID Input Section */}
				<div>
					<label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
						Encryption ID
					</label>
					<input
						type="text"
						value={encryptionId}
						onChange={(e) => setEncryptionId(e.target.value)}
						disabled={state !== 'empty'}
						placeholder="0x..."
						className="block w-full text-sm text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3"
					/>
				</div>

				{/* Download Button */}
				<button
					onClick={() => handleDownload({ blobId, policyObjectId, encryptionId })}
					disabled={state !== 'empty' || !blobId || !policyObjectId || !encryptionId}
					className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
				>
					{state === 'empty' ? 'Download & Decrypt' : 'Processing...'}
				</button>

				{/* Status Section */}
				{state !== 'empty' && (
					<div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
						<h3 className="font-semibold text-gray-900 dark:text-white mb-2">Download Status</h3>
						<div className="space-y-2">
							<div className="flex items-center space-x-2">
								<div className={`w-3 h-3 rounded-full ${state === 'downloading' || state === 'creating_session' || state === 'signing' || state === 'decrypting' ? 'bg-yellow-500 animate-pulse' : state === 'done' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
								<span className="text-sm text-gray-700 dark:text-gray-300">
									Current State: <span className="font-semibold capitalize">{state}</span>
								</span>
							</div>

							{/* Progress Steps */}
							<div className="mt-4 space-y-1">
								{['downloading', 'creating_session', 'signing', 'decrypting', 'done'].map((step) => {
									const stepIndex = ['downloading', 'creating_session', 'signing', 'decrypting', 'done'].indexOf(step);
									const currentIndex = ['downloading', 'creating_session', 'signing', 'decrypting', 'done'].indexOf(state);
									const isComplete = stepIndex < currentIndex;
									const isCurrent = step === state;

									return (
										<div key={step} className="flex items-center space-x-2">
											<span className={`text-xs ${isComplete ? 'text-green-600 dark:text-green-400' : isCurrent ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
												{isComplete ? '✓' : isCurrent ? '→' : '○'} {step.replace('_', ' ')}
											</span>
										</div>
									);
								})}
							</div>
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
							✓ Download Complete!
						</p>
						<p className="text-sm text-green-700 dark:text-green-400 mt-2">
							File has been decrypted and downloaded successfully.
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
