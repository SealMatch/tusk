"use client";

import { useFileUpload } from "@/clients/shared/hooks/useFileUpload";

export function WalrusUpload() {
	const {
		file,
		error,
		uploadResult,
		state,
		handleFileChange,
		handleSubmit
	} = useFileUpload();

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

				{/* Upload Result Section */}
				{uploadResult && (
					<div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
						<h3 className="font-semibold text-gray-900 dark:text-white mb-3">Upload Result</h3>
						<div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
							<div>
								<p className="font-medium mb-1">Blob ID:</p>
								<p className="font-mono text-xs break-all bg-white dark:bg-gray-700 p-2 rounded">{uploadResult.blobId}</p>
							</div>
							<div>
								<p className="font-medium mb-1">Policy Object ID:</p>
								<p className="font-mono text-xs break-all bg-white dark:bg-gray-700 p-2 rounded">{uploadResult.policyObjectId}</p>
							</div>
							<div>
								<p className="font-medium mb-1">Capability ID:</p>
								<p className="font-mono text-xs break-all bg-white dark:bg-gray-700 p-2 rounded">{uploadResult.capId}</p>
							</div>
							<div>
								<p className="font-medium mb-1">Encryption ID:</p>
								<p className="font-mono text-xs break-all bg-white dark:bg-gray-700 p-2 rounded">{uploadResult.encryptionId}</p>
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
							✓ Upload Complete!
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
