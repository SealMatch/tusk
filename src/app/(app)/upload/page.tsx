"use client";

import { WalrusDownload } from "@/clients/components/main/atoms/WalrusDownload";
import { WalrusUpload } from "@/clients/components/main/atoms/WalrusUpload";
import { AccessControlPanel } from "@/clients/components/main/molecules/AccessControlPanel";
import { useState } from "react";

type UploadResult = {
    blobId: string;
    policyObjectId: string;
    capId: string;
    encryptionId: string;
};

export default function UploadTest() {
    const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Access Control Test Suite
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Complete workflow: Upload → Request Access → Approve/Reject → Download
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Step 1: Upload */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
                        <div className="flex items-center mb-4">
                            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold mr-3">
                                1
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Upload File
                            </h2>
                        </div>
                        <WalrusUpload onUploadComplete={setUploadResult} />
                    </div>

                    {/* Step 2: Request & Approve/Reject Access */}
                    {uploadResult && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-green-500">
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold mr-3">
                                    2
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Access Control
                                </h2>
                            </div>
                            <AccessControlPanel
                                policyObjectId={uploadResult.policyObjectId}
                                adminCapId={uploadResult.capId}
                            />
                        </div>
                    )}

                    {/* Step 3: Download */}
                    {uploadResult && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold mr-3">
                                    3
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Download & Verify Access
                                </h2>
                            </div>
                            <WalrusDownload />
                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                    <span className="font-semibold">Quick Fill:</span> Use these values from upload result
                                </p>
                                <div className="space-y-2 text-xs">
                                    <div>
                                        <span className="font-medium">Blob ID:</span>
                                        <code className="ml-2 bg-white dark:bg-gray-800 px-2 py-1 rounded">{uploadResult.blobId}</code>
                                    </div>
                                    <div>
                                        <span className="font-medium">Policy Object ID:</span>
                                        <code className="ml-2 bg-white dark:bg-gray-800 px-2 py-1 rounded">{uploadResult.policyObjectId}</code>
                                    </div>
                                    <div>
                                        <span className="font-medium">Encryption ID:</span>
                                        <code className="ml-2 bg-white dark:bg-gray-800 px-2 py-1 rounded">{uploadResult.encryptionId}</code>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}