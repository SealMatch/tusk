"use client";

import { useApproveAccess } from "@/clients/shared/hooks/useApproveAccess";
import { useProfilePageData } from "@/clients/shared/hooks/useProfilePageData";
import { useRejectAccess } from "@/clients/shared/hooks/useRejectAccess";
import { cn } from "@/clients/shared/libs";
import { Badge, Button } from "@/clients/shared/ui";
import { formatAddress } from "@/clients/shared/utils";
import { getStatusColor } from "@/clients/shared/utils/profile-page.utils";
import { useCurrentAccount } from "@mysten/dapp-kit";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Inbox,
  Send,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

interface AccessRequest {
  id: string;
  name: string;
  timestamp: string;
  status: "pending" | "approved" | "rejected";
  type: "submitted" | "received";
  viewRequestId: string | null;
  policyObjectId: string | null;
  adminCapId: string | null;
}

export default function ProfilePage() {
  const currentAccount = useCurrentAccount();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"submitted" | "received">(
    "submitted"
  );
  const { handleApproveAccess } = useApproveAccess();
  const { handleRejectAccess } = useRejectAccess();

  const { data, isLoading, error } = useProfilePageData(
    currentAccount?.address ?? ""
  );

  const requestedList: AccessRequest[] = useMemo(() => {
    if (!data?.requestedList) return [];
    return data.requestedList.map((item) => ({
      id: item.match.id,
      name: item.applicant.handle,
      timestamp: new Date(item.match.createdAt).toLocaleString(),
      status: item.match.status as "pending" | "approved" | "rejected",
      type: "submitted" as const,
      viewRequestId: item.match.viewRequestId,
      policyObjectId: item.applicant.sealPolicyId,
      adminCapId: item.applicant.capId,
    }));
  }, [data]);

  const receivedList: AccessRequest[] = useMemo(() => {
    if (!data?.receivedList) return [];
    return data.receivedList.map((item) => ({
      id: item.match.id,
      name: item.applicant.handle,
      timestamp: new Date(item.match.createdAt).toLocaleString(),
      status: item.match.status as "pending" | "approved" | "rejected",
      type: "received" as const,
      viewRequestId: item.match.viewRequestId,
      policyObjectId: item.applicant.sealPolicyId,
      adminCapId: item.applicant.capId,
    }));
  }, [data]);

  const timeText = useMemo(() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, "0");
    const hour12 = ((h + 11) % 12) + 1;
    const ampm = h >= 12 ? "PM" : "AM";
    return `${hour12}:${m} ${ampm}`;
  }, []);

  const handleCopyWallet = async () => {
    if (currentAccount) {
      try {
        await navigator.clipboard.writeText(currentAccount.address);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  const onApprove = async (request: AccessRequest) => {
    if (
      !request.viewRequestId ||
      !request.policyObjectId ||
      !request.adminCapId
    ) {
      console.error("Missing required IDs for approval");
      return;
    }
    try {
      await handleApproveAccess({
        viewRequestId: request.viewRequestId,
        policyObjectId: request.policyObjectId,
        adminCapId: request.adminCapId,
      });
      // Optionally refetch data or update UI
    } catch (error) {
      console.error("Failed to approve access:", error);
    }
  };

  const onReject = async (request: AccessRequest) => {
    if (!request.viewRequestId || !request.policyObjectId) {
      console.error("Missing required IDs for rejection");
      return;
    }
    try {
      await handleRejectAccess({
        viewRequestId: request.viewRequestId,
        policyObjectId: request.policyObjectId,
      });
      // Optionally refetch data or update UI
    } catch (error) {
      console.error("Failed to reject access:", error);
    }
  };

  if (!currentAccount) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <Wallet className="w-16 h-16 text-gray-400 mx-auto" />
          <h2 className="text-2xl font-semibold text-white">
            Connect Your Wallet
          </h2>
          <p className="text-gray-400">
            Please connect your wallet to access your profile.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
          <h2 className="text-2xl font-semibold text-white">Loading...</h2>
          <p className="text-gray-400">Fetching your profile data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="w-16 h-16 text-red-400 mx-auto" />
          <h2 className="text-2xl font-semibold text-white">Error</h2>
          <p className="text-gray-400">Failed to load profile data</p>
          <p className="text-sm text-red-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-4 sm:p-8">
      <div className="mx-auto max-w-6xl">
        <div>
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">
            Profile Page
          </h1>
          <div className="mb-8 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

          {/* Profile Card */}
          <div className="mb-8 overflow-hidden rounded-xl border border-white/20 bg-black/30 backdrop-blur-xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-transparent to-blue-600/10" />
            <div className="relative p-6 sm:p-8">
              <div className="mb-6 flex items-center justify-between text-sm">
                <div className="flex items-center gap-2"></div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{timeText}</span>
                </div>
              </div>

              <div className="mb-6 flex flex-col items-center gap-6 sm:flex-row">
                <div className="relative">
                  <div className="h-24 w-24 border-2 border-white/20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                    <User className="w-12 h-12 text-white" />
                  </div>
                </div>

                <div className="flex-1 text-center sm:text-left">
                  <h2 className="mb-2 text-3xl font-bold">
                    {data?.userHandle ?? "Connected User"}
                  </h2>
                  <p className="mb-4 text-lg text-purple-400">
                    Blockchain Identity
                  </p>

                  <div className="flex flex-col items-center gap-2 sm:flex-row">
                    <div className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-4 py-2 backdrop-blur-sm">
                      <span className="font-mono text-sm text-gray-300">
                        {formatAddress(currentAccount.address)}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopyWallet}
                        className="h-6 w-6 p-0 hover:bg-white/10 text-gray-300"
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Buttons */}
          <div className="mb-6 flex gap-4">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("submitted")}
              className={cn(
                "flex-1 rounded-xl transition-all duration-200",
                activeTab === "submitted"
                  ? "border-2 border-purple-500/50 bg-purple-500/10 text-white shadow-md shadow-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/70 hover:text-white"
                  : "border border-white/10 bg-black/20 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/30"
              )}
            >
              <Send className="w-4 h-4 mr-2" />
              열람 신청한 리스트
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("received")}
              className={cn(
                "flex-1 rounded-xl transition-all duration-200",
                activeTab === "received"
                  ? "border-2 border-cyan-500/50 bg-cyan-500/10 text-white shadow-md shadow-cyan-500/20 hover:bg-cyan-500/20 hover:border-cyan-500/70 hover:text-white"
                  : "border border-white/10 bg-black/20 text-gray-300 hover:bg-white/10 hover:text-white hover:border-white/30"
              )}
            >
              <Inbox className="w-4 h-4 mr-2" />
              열람 신청을 받은 리스트
            </Button>
          </div>

          {/* Request List */}
          <div className="grid gap-4">
            {(activeTab === "submitted" ? requestedList : receivedList)
              .length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4">
                <div className="rounded-full bg-white/5 p-6 mb-4">
                  {activeTab === "submitted" ? (
                    <Send className="w-12 h-12 text-gray-400" />
                  ) : (
                    <Inbox className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Results Found
                </h3>
                <p className="text-gray-400 text-center max-w-md">
                  {activeTab === "submitted"
                    ? "You haven't submitted any access requests yet."
                    : "You haven't received any access requests yet."}
                </p>
              </div>
            ) : (
              (activeTab === "submitted" ? requestedList : receivedList).map(
                (request) => (
                  <div key={request.id}>
                    <div className="overflow-hidden rounded-xl border border-white/20 bg-black/30 backdrop-blur-xl transition-all hover:border-white/30">
                      <div className="p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1">
                            <h3 className="mb-1 text-lg font-semibold text-white">
                              {request.name}
                            </h3>

                            <p className="text-xs text-gray-500">
                              {request.timestamp}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {!(
                              activeTab === "received" &&
                              request.status === "pending"
                            ) && (
                              <Badge
                                className={cn(
                                  "rounded-full border px-3 py-1 text-xs font-medium capitalize",
                                  getStatusColor(request.status)
                                )}
                              >
                                {request.status}
                              </Badge>
                            )}
                            {activeTab === "received" &&
                              request.status === "pending" && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30"
                                    onClick={() => onApprove(request)}
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-1" />
                                    승인
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30"
                                    onClick={() => onReject(request)}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    거절
                                  </Button>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
