import { SealClient, SessionKey } from "@mysten/seal";
import { SuiClient } from "@mysten/sui/client";
import { fromHex, toHex } from "@mysten/sui/utils";

// Testnet Seal Server Object IDs
const SERVER_OBJECT_IDS = [
  "0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75",
  "0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8"
];

/**
 * SealClient 인스턴스를 생성합니다.
 * @param suiClient - Sui Client 인스턴스
 */
export function createSealClient(suiClient: SuiClient): SealClient {
  return new SealClient({
    suiClient,
    serverConfigs: SERVER_OBJECT_IDS.map((id) => ({
      objectId: id,
      weight: 1,
    })),
    verifyKeyServers: false, // testnet에서는 false
  });
}

/**
 * Policy Object ID와 nonce를 결합하여 고유한 ID를 생성합니다.
 * 공식 예제 패턴: policyObjectBytes + nonce(5 bytes)
 * @param policyObjectId - Policy Object ID (hex string)
 * @returns 고유한 ID (hex string)
 */
export function createEncryptionId(policyObjectId: string): string {
  const nonce = crypto.getRandomValues(new Uint8Array(5));
  const policyObjectBytes = fromHex(policyObjectId);
  const id = toHex(new Uint8Array([...policyObjectBytes, ...nonce]));
  return id;
}

export interface SealEncryptResult {
  /** Seal로 암호화된 파일 데이터 (Walrus에 업로드할 데이터) */
  encryptedData: Uint8Array;
  /** 암호화에 사용된 ID (policyObject + nonce) */
  id: string;
  /** 백업용 키 (선택적) */
  backupKey: Uint8Array;
}

/**
 * 파일을 Seal로 암호화합니다.
 * 공식 예제 패턴 참고: https://github.com/MystenLabs/seal/blob/main/examples/frontend/src/EncryptAndUpload.tsx
 *
 * @param sealClient SealClient 인스턴스
 * @param fileData 원본 파일 데이터
 * @param packageId Seal 패키지 ID
 * @param policyObjectId Policy Object ID (hex string)
 * @param threshold 복호화에 필요한 최소 키 서버 수 (기본값: 2)
 */
export async function sealEncryptFile(
  sealClient: SealClient,
  fileData: Uint8Array,
  packageId: string,
  policyObjectId: string,
  threshold: number = 2
): Promise<SealEncryptResult> {
  // 1. Policy Object + nonce로 고유한 ID 생성
  const id = createEncryptionId(policyObjectId);

  // 2. Seal로 파일 암호화
  const { encryptedObject, key: backupKey } = await sealClient.encrypt({
    threshold,
    packageId,
    id,
    data: fileData,
  });

  return {
    encryptedData: encryptedObject,
    id,
    backupKey,
  };
}

/**
 * Seal로 암호화된 파일을 복호화합니다.
 * 공식 문서 참고: https://seal-docs.wal.app/UsingSeal/#decryption
 *
 * 복호화 프로세스:
 * 1. SessionKey 생성 및 사용자 서명
 * 2. seal_approve* 함수를 호출하는 Transaction 생성
 * 3. decrypt 호출
 *
 * @param sealClient SealClient 인스턴스
 * @param encryptedData Seal로 암호화된 데이터
 * @param sessionKey Session key (사용자 인증된)
 * @param txBytes Transaction bytes (seal_approve 호출)
 */
export async function sealDecryptFile(
  sealClient: SealClient,
  encryptedData: Uint8Array,
  sessionKey: SessionKey,
  txBytes: Uint8Array
): Promise<Uint8Array> {
  const decryptedData = await sealClient.decrypt({
    data: encryptedData,
    sessionKey,
    txBytes,
  });

  return decryptedData;
}

/**
 * SessionKey를 생성합니다.
 * 사용자는 personal message에 서명하여 시간 제한된 키 액세스를 승인해야 합니다.
 *
 * @param suiClient Sui Client 인스턴스
 * @param address 사용자 주소
 * @param packageId Seal 패키지 ID
 * @param ttlMin 세션 키 유효 시간 (분)
 */
export async function createSessionKey(
  suiClient: SuiClient,
  address: string,
  packageId: string,
  ttlMin: number = 10
): Promise<SessionKey> {
  const sessionKey = await SessionKey.create({
    address,
    packageId,
    ttlMin,
    suiClient,
  });

  return sessionKey;
}