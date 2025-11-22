"use client";

import { useState } from "react";
import { useRequestAccess } from "@/clients/shared/hooks/useRequestAccess";
import { useApproveAccess } from "@/clients/shared/hooks/useApproveAccess";
import { useRejectAccess } from "@/clients/shared/hooks/useRejectAccess";

type AccessControlPanelProps = {
    policyObjectId: string;
    adminCapId: string;
};

export function AccessControlPanel({ policyObjectId, adminCapId }: AccessControlPanelProps) {
    const [accessPrice, setAccessPrice] = useState("1000000"); // 0.001 SUI in MIST
    const [viewRequestId, setViewRequestId] = useState("");
    const [isRequesting, setIsRequesting] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isRejecting, setIsRejecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { handleRequestAccess } = useRequestAccess({
        policyObjectId,
        accessPrice,
    });

    const { handleApproveAccess } = useApproveAccess({
        viewRequestId,
        policyObjectId,
        adminCapId,
    });

    const { handleRejectAccess } = useRejectAccess({
        viewRequestId,
        policyObjectId,
        adminCapId,
    });

    const onRequestAccess = async () => {
        setIsRequesting(true);
        setError(null);
        try {
            const requestId = await handleRequestAccess();
            if (requestId) {
                setViewRequestId(requestId);
                console.log("View Request ID:", requestId);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Request failed");
            console.error("Request access error:", err);
        } finally {
            setIsRequesting(false);
        }
    };

    const onApproveAccess = async () => {
        if (!viewRequestId) {
            setError("View Request ID is required");
            return;
        }
        setIsApproving(true);
        setError(null);
        try {
            await handleApproveAccess();
            console.log("Access approved for:", viewRequestId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Approval failed");
            console.error("Approve access error:", err);
        } finally {
            setIsApproving(false);
        }
    };

    const onRejectAccess = async () => {
        if (!viewRequestId) {
            setError("View Request ID is required");
            return;
        }
        setIsRejecting(true);
        setError(null);
        try {
            await handleRejectAccess();
            console.log("Access rejected for:", viewRequestId);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Rejection failed");
            console.error("Reject access error:", err);
        } finally {
            setIsRejecting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Access Control Panel
            </h2>

            <div className="space-y-6">
                {/* Policy Info Display */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Policy Information</h3>
                    <div className="space-y-2 text-sm">
                        <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Policy Object ID:</p>
                            <p className="font-mono text-xs break-all bg-white dark:bg-gray-800 p-2 rounded">
                                {policyObjectId || "Not available"}
                            </p>
                        </div>
                        <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Cap ID:</p>
                            <p className="font-mono text-xs break-all bg-white dark:bg-gray-800 p-2 rounded">
                                {adminCapId || "Not available"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Step 1: Request Access */}
                <div className="border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Step 1: Request Access
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                Access Price (MIST)
                            </label>
                            <input
                                type="text"
                                value={accessPrice}
                                onChange={(e) => setAccessPrice(e.target.value)}
                                disabled={isRequesting}
                                placeholder="1000000"
                                className="block w-full text-sm text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3"
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                1 SUI = 1,000,000,000 MIST
                            </p>
                        </div>
                        <button
                            onClick={onRequestAccess}
                            disabled={isRequesting || !policyObjectId}
                            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
                        >
                            {isRequesting ? "Requesting..." : "Request Access"}
                        </button>
                    </div>
                </div>

                {/* View Request ID Display */}
                {viewRequestId && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">View Request Created</h3>
                        <div>
                            <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">View Request ID:</p>
                            <p className="font-mono text-xs break-all bg-white dark:bg-gray-700 p-2 rounded">
                                {viewRequestId}
                            </p>
                        </div>
                    </div>
                )}

                {/* Step 2: Approve or Reject */}
                <div className="border-2 border-green-300 dark:border-green-700 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                        Step 2: Approve or Reject Access
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                                View Request ID
                            </label>
                            <input
                                type="text"
                                value={viewRequestId}
                                onChange={(e) => setViewRequestId(e.target.value)}
                                disabled={isApproving || isRejecting}
                                placeholder="0x..."
                                className="block w-full text-sm text-gray-900 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 p-3"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={onApproveAccess}
                                disabled={isApproving || isRejecting || !viewRequestId || !adminCapId}
                                className="py-2 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
                            >
                                {isApproving ? "Approving..." : "Approve"}
                            </button>
                            <button
                                onClick={onRejectAccess}
                                disabled={isApproving || isRejecting || !viewRequestId || !adminCapId}
                                className="py-2 px-4 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors duration-200"
                            >
                                {isRejecting ? "Rejecting..." : "Reject"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Section */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <h3 className="font-semibold text-red-900 dark:text-red-300 mb-2">Error</h3>
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
