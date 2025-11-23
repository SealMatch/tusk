import { useCurrentAccount, useSuiClient } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";
import { fromHex, toHex } from "@mysten/sui/utils";
import { WalrusClient } from "@mysten/walrus";
import { ChangeEvent, useMemo, useState } from "react";
import { PACKAGE_ID, PLATFORM_WALLET_ADDRESS } from "../config/contract.config";
import {
  createAccessPolicyTx,
  extractAccessPolicyObjectIds,
} from "../libs/contracts.libs";
import { createSealClient } from "../libs/seal.lib";
import { walrusClient } from "../libs/walrus.lib";
import { readFileAsArrayBuffer } from "../utils/file.utils";
import useExecOnChain from "./useExecOnChain";

export type UploadResult = {
  policyObjectId: string;
  capId: string;
  encryptionId: string;
  blobId: string;
};

export type UploadState =
  | "empty"
  | "creating_policy"
  | "encrypting"
  | "encoding"
  | "encoded"
  | "registering"
  | "uploading"
  | "uploaded"
  | "certifying"
  | "done";

export const useFileUpload = () => {
  const currentAccount = useCurrentAccount();
  const { exec } = useExecOnChain();
  const suiClient = useSuiClient() as SuiClient & { walrus: WalrusClient };
  const sealClient = useMemo(() => createSealClient(suiClient), [suiClient]);

  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [state, setState] = useState<UploadState>("empty");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    const selectedFile = event.target.files[0];
    // Max 10 MiB size
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MiB");
      return;
    }
    // TODO: file mimetype check (only pdf)
    setError(null);
    setFile(selectedFile);
  };

  const handleSubmit = async (fileToUpload?: File) => {
    const targetFile = fileToUpload || file;

    if (!targetFile) {
      setError("No file selected");
      return;
    }

    setError(null);

    try {
      // Read file
      console.log("[Upload] 파일 읽기 시작:", targetFile.name);
      const result = await readFileAsArrayBuffer(targetFile);
      console.log("[Upload] 파일 읽기 완료:", result.byteLength, "bytes");

      // Create access policy and get the IDs
      console.log("[Upload] 1. AccessPolicy 생성 시작");
      setState("creating_policy");
      let policyObjectId: string;
      let capId: string;
      try {
        const policy = await createAccessPolicyObject();
        policyObjectId = policy.policyObjectId;
        capId = policy.capId;
        console.log("[Upload] 1. AccessPolicy 생성 완료:", {
          policyObjectId,
          capId,
        });
      } catch (err) {
        throw new Error(
          "접근 정책 생성 실패: " +
            (err instanceof Error ? err.message : "알 수 없는 오류")
        );
      }

      // Encrypt the file
      console.log("[Upload] 2. Seal 암호화 시작");
      let encryptedBytes: Uint8Array;
      let encryptionId: string;
      try {
        const encrypted = await encrypt(policyObjectId, result);
        encryptedBytes = encrypted.encryptedBytes;
        encryptionId = encrypted.encryptionId;
        console.log("[Upload] 2. Seal 암호화 완료:", {
          encryptionId,
          encryptedSize: encryptedBytes.length,
        });
      } catch (err) {
        throw new Error(
          "파일 암호화 실패: " +
            (err instanceof Error ? err.message : "알 수 없는 오류")
        );
      }

      // Store the blob
      console.log("[Upload] 3. Walrus 업로드 시작");
      let blobId: string;
      try {
        blobId = await storeBlob(encryptedBytes);
        console.log("[Upload] 3. Walrus 업로드 완료:", { blobId });
      } catch (err) {
        // 디버깅: 원본 에러 전체 출력
        console.error("[Upload] Walrus 업로드 원본 에러:", err);
        const errorMessage = err instanceof Error ? err.message : "알 수 없는 오류";

        // WAL 토큰 부족 에러 감지
        if (errorMessage.includes("Not enough coins") && errorMessage.includes("WAL")) {
          console.error("[Upload] WAL 토큰 부족 - 원본 메시지:", errorMessage);
          throw new Error("WAL 토큰이 부족합니다");
        }

        throw new Error("Walrus 업로드 실패: " + errorMessage);
      }

      const newUploadResult: UploadResult = {
        policyObjectId,
        capId,
        encryptionId,
        blobId,
      };

      console.log("[Upload] ✅ 전체 업로드 완료:", newUploadResult);
      setUploadResult(newUploadResult);
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
      setState("empty");
    }
  };

  const createAccessPolicyObject = async (): Promise<{
    policyObjectId: string;
    capId: string;
  }> => {
    const tx = createAccessPolicyTx(PLATFORM_WALLET_ADDRESS);

    const result = await exec(tx);
    const { policyObjectId, capId } = extractAccessPolicyObjectIds(result);

    return { policyObjectId, capId };
  };

  const encrypt = async (policyObjectId: string, fileData: ArrayBuffer) => {
    setState("encrypting");

    const nonce = crypto.getRandomValues(new Uint8Array(5));
    const policyObjectBytes = fromHex(policyObjectId);
    const encryptionId = toHex(
      new Uint8Array([...policyObjectBytes, ...nonce])
    );

    const { encryptedObject: encryptedBytes } = await sealClient.encrypt({
      threshold: 2,
      packageId: PACKAGE_ID,
      id: encryptionId,
      data: new Uint8Array(fileData),
    });

    return { encryptedBytes, encryptionId };
  };

  const storeBlob = async (encryptedBytes: Uint8Array) => {
    if (!currentAccount) {
      throw Error("No Account connected!");
    }

    // 디버깅: 현재 연결된 지갑 주소와 체인 정보 출력
    console.log("=== Walrus 업로드 지갑 정보 ===");
    console.log("연결된 지갑 주소:", currentAccount.address);
    console.log("지갑 체인:", currentAccount.chains);
    console.log("===========================");

    // WAL 코인 잔액 확인
    try {
      const walType = "0x8270feb7375eee355e64fdb69c50abb6b5f9393a722883c1cf45f8e26048810a::wal::WAL";
      const coins = await suiClient.getCoins({
        owner: currentAccount.address,
        coinType: walType,
      });

      console.log("=== WAL 토큰 상세 정보 ===");
      console.log("총 WAL 코인 객체 수:", coins.data.length);
      console.log("코인 객체 상세:");
      coins.data.forEach((coin, idx) => {
        console.log(`  [${idx + 1}] balance: ${coin.balance}, coinObjectId: ${coin.coinObjectId}`);
      });
      const totalBalance = coins.data.reduce((sum, coin) => sum + BigInt(coin.balance), BigInt(0));
      console.log("총 WAL 잔액:", totalBalance.toString());
      console.log("===========================");
    } catch (err) {
      console.error("WAL 잔액 조회 실패:", err);
    }

    // Encode the blob
    setState("encoding");
    const flow = (walrusClient as WalrusClient).writeBlobFlow({
      blob: encryptedBytes,
    });

    await flow.encode();
    setState("encoded");

    // Register the blob
    setState("registering");
    const registerTx = flow.register({
      epochs: 1,
      owner: currentAccount.address,
      deletable: true,
    });

    // Upload the blob
    setState("uploading");
    const { digest } = await exec(registerTx);
    await flow.upload({ digest });
    setState("uploaded");

    // Certify the blob
    setState("certifying");
    const certifyTx = flow.certify();
    await exec(certifyTx);

    // Get the blob ID
    const { blobId } = await flow.getBlob();
    setState("done");

    return blobId;
  };

  return {
    file,
    error,
    uploadResult,
    state,
    handleFileChange,
    handleSubmit,
  };
};
