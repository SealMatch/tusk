"use client";

import { useApproveAccessProfilePage } from "@/clients/shared/hooks/useApproveAccessProfilePage";
import { useProfilePageData } from "@/clients/shared/hooks/useProfilePageData";
import { useRejectAccessProfilePage } from "@/clients/shared/hooks/useRejectAccessProfilePage";
import { cn } from "@/clients/shared/libs";
import { Badge, Button } from "@/clients/shared/ui";
import { formatAddress } from "@/clients/shared/utils";
import { getStatusColor } from "@/clients/shared/utils/profile-page.utils";
import { RequestedItem, ReceivedItem } from "@/server/domains/match/match.type";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  Copy,
  Inbox,
  Send,
  User,
  Wallet,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

export default function ProfilePage() {
  const currentAccount = useCurrentAccount();
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"submitted" | "received">(
    "submitted"
  );
  const { handleApproveAccess } = useApproveAccessProfilePage();
  const { handleRejectAccess } = useRejectAccessProfilePage();

  const { data, isLoading, error } = useProfilePageData(
    currentAccount?.address ?? ""
  );

  const requestedList: RequestedItem[] = useMemo(() => {
    return data?.requestedList ?? [];
  }, [data]);

  const receivedList: ReceivedItem[] = useMemo(() => {
    return data?.receivedList ?? [];
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
      } catch { }
    }
  };

  const onApprove = async (request: ReceivedItem) => {
    // Use currentApplicant from profile data
    const currentApplicant = data?.currentApplicant;

    if (
      !request.match.viewRequestId ||
      !request.match.id ||
      !request.match.recruiterWalletAddress ||
      !currentApplicant?.sealPolicyId ||
      !currentApplicant?.capId ||
      !currentApplicant?.id
    ) {
      console.error("Missing required IDs for approval");
      return;
    }

    try {
      await handleApproveAccess({
        viewRequestId: request.match.viewRequestId,
        policyObjectId: currentApplicant.sealPolicyId,
        adminCapId: currentApplicant.capId,
        matchId: request.match.id,
        recruiterWalletAddress: request.match.recruiterWalletAddress,
        applicantId: currentApplicant.id,
      });

      // 캐시 무효화 → 자동 refetch
      await queryClient.invalidateQueries({
        queryKey: ["profile-page-data", currentAccount?.address],
      });
    } catch (error) {
      console.error("Failed to approve access:", error);
    }
  };

  const onReject = async (request: ReceivedItem) => {
    // Use currentApplicant from profile data
    const currentApplicant = data?.currentApplicant;

    if (
      !request.match.viewRequestId ||
      !request.match.id ||
      !request.match.recruiterWalletAddress ||
      !currentApplicant?.sealPolicyId ||
      !currentApplicant?.id
    ) {
      console.error("Missing required IDs for rejection");
      return;
    }

    try {
      await handleRejectAccess({
        viewRequestId: request.match.viewRequestId,
        policyObjectId: currentApplicant.sealPolicyId,
        matchId: request.match.id,
        recruiterWalletAddress: request.match.recruiterWalletAddress,
        applicantId: currentApplicant.id,
      });

      // 캐시 무효화 → 자동 refetch
      await queryClient.invalidateQueries({
        queryKey: ["profile-page-data", currentAccount?.address],
      });
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
            ) : activeTab === "submitted" ? (
              requestedList.map(
                (request: RequestedItem) => (
                  <div key={request.match.id}>
                    <div className="group overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-black/40 via-black/30 to-black/20 backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:shadow-lg hover:shadow-purple-500/10">
                      <div className="p-6">
                        {/* Direction Indicator with Arrow */}
                        <div className="mb-4 flex items-center gap-3">
                          {/* You → Applicant */}
                          <div className="flex items-center gap-2 text-purple-400">
                            <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-1.5 border border-purple-500/30">
                              <User className="w-4 h-4" />
                              <span className="text-sm font-medium">You</span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-purple-400" />
                            <div className="flex items-center gap-2 rounded-lg bg-cyan-500/10 px-3 py-1.5 border border-cyan-500/30">
                              <User className="w-4 h-4 text-cyan-400" />
                              <span className="text-sm font-medium text-cyan-400">
                                {request.applicant.handle}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Applicant Info Section */}
                        <div className="mb-4 space-y-3">
                          {/* Position */}
                          {request.applicant.position && (
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10">
                                <User className="h-4 w-4 text-purple-400" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-400">Position</p>
                                <p className="text-sm font-semibold text-white">
                                  {request.applicant.position}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Tech Stack */}
                          {request.applicant.techStack && request.applicant.techStack.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10">
                                  <Code2 className="h-4 w-4 text-cyan-400" />
                                </div>
                                <p className="text-xs text-gray-400">Tech Stack</p>
                              </div>
                              <div className="flex flex-wrap gap-2 ml-10">
                                {request.applicant.techStack.map((tech: string, idx: number) => (
                                  <Badge
                                    key={idx}
                                    className="rounded-md border border-white/20 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 px-2.5 py-1 text-xs font-medium text-white hover:from-purple-500/20 hover:to-cyan-500/20 transition-colors"
                                  >
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI Summary Preview */}
                          {request.applicant.aiSummary && (
                            <div className="rounded-lg bg-white/5 p-3 border border-white/10">
                              <p className="text-xs text-gray-400 mb-1">AI Summary</p>
                              <p className="text-sm text-gray-300 line-clamp-2">
                                {request.applicant.aiSummary}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Status and Actions */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-gray-500" />
                            <p className="text-xs text-gray-500">
                              {new Date(request.match.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge
                              className={cn(
                                "rounded-full border px-3 py-1 text-xs font-medium capitalize",
                                getStatusColor(request.match.status)
                              )}
                            >
                              {request.match.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )
            ) : (
              receivedList.map(
                (request: ReceivedItem) => (
                  <div key={request.match.id}>
                    <div className="group overflow-hidden rounded-xl border border-white/20 bg-gradient-to-br from-black/40 via-black/30 to-black/20 backdrop-blur-xl transition-all duration-300 hover:border-white/40 hover:shadow-lg hover:shadow-purple-500/10">
                      <div className="p-6">
                        {/* Direction Indicator with Arrow */}
                        <div className="mb-4 flex items-center gap-3">
                          {/* Recruiter → You */}
                          <div className="flex items-center gap-2 text-cyan-400">
                            <div className="flex items-center gap-2 rounded-lg bg-cyan-500/10 px-3 py-1.5 border border-cyan-500/30">
                              <Wallet className="w-4 h-4" />
                              <span className="text-sm font-medium text-gray-300">
                                {formatAddress(request.recruiterWalletAddress)}
                              </span>
                            </div>
                            <ArrowRight className="w-5 h-5 text-cyan-400" />
                            <div className="flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-1.5 border border-purple-500/30">
                              <User className="w-4 h-4 text-purple-400" />
                              <span className="text-sm font-medium text-purple-400">You</span>
                            </div>
                          </div>
                        </div>

                        {/* Status and Actions */}
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-4 border-t border-white/10">
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-gray-500" />
                            <p className="text-xs text-gray-500">
                              {new Date(request.match.createdAt).toLocaleString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            {!(request.match.status === "pending") && (
                              <Badge
                                className={cn(
                                  "rounded-full border px-3 py-1 text-xs font-medium capitalize",
                                  getStatusColor(request.match.status)
                                )}
                              >
                                {request.match.status}
                              </Badge>
                            )}
                            {request.match.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/20"
                                  onClick={() => onApprove(request)}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  승인
                                </Button>
                                <Button
                                  size="sm"
                                  className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-all hover:shadow-lg hover:shadow-red-500/20"
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
