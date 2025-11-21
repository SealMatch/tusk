"use client";

import { Button } from "@/clients/shared/ui";
import type { PermissionStatus } from "@/clients/shared/types";
import { ConnectModal } from "@mysten/dapp-kit";
import { Download, Clock, CheckCircle, XCircle, Wallet, Loader2 } from "lucide-react";

interface ResumeActionButtonProps {
  isConnected: boolean;
  myPermissionStatus: PermissionStatus | null;
  isDownloading: boolean;
  downloadStatus: string;
  isPending: boolean;
  onDownload: () => void;
  onRequestPermission: () => void;
}

export function ResumeActionButton({
  isConnected,
  myPermissionStatus,
  isDownloading,
  downloadStatus,
  isPending,
  onDownload,
  onRequestPermission,
}: ResumeActionButtonProps) {
  if (!isConnected) {
    return (
      <ConnectModal
        trigger={
          <Button
            variant="default"
            className="w-full h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Wallet className="h-5 w-5" />
            지갑 연결하고 권한 요청
          </Button>
        }
      />
    );
  }

  if (myPermissionStatus === "approved") {
    return (
      <div className="space-y-2">
        <Button
          variant="default"
          className="w-full h-12 gap-2 bg-green-600 hover:bg-green-700 text-white border-none disabled:bg-green-800 disabled:opacity-100"
          onClick={onDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              다운로드 중...
            </>
          ) : (
            <>
              <Download className="h-5 w-5" />
              PDF 다운로드
            </>
          )}
        </Button>
        {downloadStatus && (
          <p className="text-sm text-center text-gray-400">{downloadStatus}</p>
        )}
      </div>
    );
  }

  if (myPermissionStatus === "pending" || isPending) {
    return (
      <Button
        variant="default"
        className="w-full h-12 gap-2 bg-amber-600 text-white border-none disabled:opacity-100 cursor-not-allowed"
        disabled
      >
        <Clock className="h-5 w-5" />
        권한 요청 중 (승인 대기)
      </Button>
    );
  }

  if (myPermissionStatus === "rejected") {
    return (
      <Button
        variant="default"
        className="w-full h-12 gap-2 bg-red-600 text-white border-none disabled:opacity-100 cursor-not-allowed"
        disabled
      >
        <XCircle className="h-5 w-5" />
        거절됨
      </Button>
    );
  }

  return (
    <Button
      variant="default"
      className="w-full h-12 gap-2 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-800"
      onClick={onRequestPermission}
      disabled={isPending}
    >
      {isPending ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          요청 중...
        </>
      ) : (
        <>
          <CheckCircle className="h-5 w-5" />
          권한 요청
        </>
      )}
    </Button>
  );
}
