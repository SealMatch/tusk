import { downloadAndDecryptPdf, downloadBlob } from "@/clients/shared/utils";
import { useSuiClient, useSignPersonalMessage } from "@mysten/dapp-kit";
import { useState } from "react";

interface UsePdfDownloadParams {
  blobId: string;
  sealPolicyId: string | undefined;
  currentAccountAddress: string;
}

export function usePdfDownload({
  blobId,
  sealPolicyId,
  currentAccountAddress,
}: UsePdfDownloadParams) {
  const suiClient = useSuiClient();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const [downloadStatus, setDownloadStatus] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!sealPolicyId) {
      setDownloadStatus("sealPolicyId가 없습니다");
      return;
    }

    setIsDownloading(true);
    setDownloadStatus("");

    try {
      const result = await downloadAndDecryptPdf(
        blobId,
        sealPolicyId,
        suiClient,
        currentAccountAddress,
        signPersonalMessage,
        (progress) => setDownloadStatus(progress.message)
      );

      if (result.success && result.blob) {
        downloadBlob(result.blob, `resume_${blobId.slice(0, 8)}.pdf`);
        setDownloadStatus("다운로드 완료!");
        setTimeout(() => {
          setDownloadStatus("");
          setIsDownloading(false);
        }, 2000);
      } else {
        setDownloadStatus(result.error || "다운로드 실패");
        setIsDownloading(false);
      }
    } catch (error) {
      console.error("PDF download error:", error);
      setDownloadStatus("다운로드 실패");
      setIsDownloading(false);
    }
  };

  return {
    downloadStatus,
    isDownloading,
    handleDownload,
  };
}
