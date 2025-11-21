import {
  PACKAGE_ID,
  WALRUS_AGGREGATOR_URL,
  SEAL_KEY_SERVERS,
  SESSION_KEY_TTL_MIN,
} from "@/clients/shared/config";
import { SealClient, SessionKey, NoAccessError } from "@mysten/seal";
import type { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex } from "@mysten/sui/utils";

export interface PdfDownloadProgress {
  step: number;
  message: string;
}

export interface PdfDownloadResult {
  success: boolean;
  blob?: Blob;
  error?: string;
}

// Walrus에서 암호화된 blob 가져오기
async function fetchEncryptedBlob(blobId: string): Promise<Uint8Array> {
  const response = await fetch(`${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return new Uint8Array(arrayBuffer);
}

// access_policy::seal_approve 호출을 위한 Move call constructor
function constructMoveCall(policyId: string) {
  return (tx: Transaction, id: string) => {
    tx.moveCall({
      target: `${PACKAGE_ID}::access_policy::seal_approve`,
      arguments: [
        tx.pure.vector("u8", fromHex(id)),
        tx.object(policyId),
      ],
    });
  };
}

// PDF 다운로드 및 복호화
export async function downloadAndDecryptPdf(
  blobId: string,
  sealPolicyId: string,
  suiClient: SuiClient,
  userAddress: string,
  signPersonalMessage: (params: { message: Uint8Array }) => Promise<{ signature: string }>,
  onProgress?: (progress: PdfDownloadProgress) => void
): Promise<PdfDownloadResult> {
  try {
    onProgress?.({
      step: 1,
      message: "Walrus에서 암호화된 PDF 가져오는 중...",
    });

    const encryptedData = await fetchEncryptedBlob(blobId);

    onProgress?.({
      step: 2,
      message: "Seal 복호화 준비 중...",
    });

    const sealClient = new SealClient({
      suiClient,
      serverConfigs: SEAL_KEY_SERVERS.map((id) => ({
        objectId: id,
        weight: 1,
      })),
      verifyKeyServers: false,
    });

    onProgress?.({
      step: 3,
      message: "세션 키 생성 중...",
    });

    const sessionKey = await SessionKey.create({
      address: userAddress,
      packageId: PACKAGE_ID,
      ttlMin: SESSION_KEY_TTL_MIN,
      suiClient,
    });

    onProgress?.({
      step: 4,
      message: "지갑 서명 요청 중...",
    });

    const personalMessage = sessionKey.getPersonalMessage();
    const { signature } = await signPersonalMessage({ message: personalMessage });
    sessionKey.setPersonalMessageSignature(signature);

    onProgress?.({
      step: 5,
      message: "PDF 복호화 중...",
    });

    const moveCallConstructor = constructMoveCall(sealPolicyId);
    const tx = new Transaction();
    moveCallConstructor(tx, blobId);
    const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });

    const decryptedData = await sealClient.decrypt({
      data: encryptedData,
      sessionKey,
      txBytes,
    });

    onProgress?.({
      step: 6,
      message: "다운로드 완료!",
    });

    const pdfBlob = new Blob([new Uint8Array(decryptedData)], { type: "application/pdf" });

    return {
      success: true,
      blob: pdfBlob,
    };
  } catch (error) {
    console.error("PDF download error:", error);

    if (error instanceof NoAccessError) {
      return {
        success: false,
        error: "권한이 없습니다. 이력서 소유자의 승인이 필요합니다.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "PDF 다운로드에 실패했습니다.",
    };
  }
}

// Blob을 파일로 다운로드
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
