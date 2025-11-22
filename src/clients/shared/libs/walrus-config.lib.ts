// lib/walrus-config.ts
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { walrus, type WalrusClient } from "@mysten/walrus";

// 네트워크 설정 (상수로 관리)
export const WALRUS_NETWORK = "testnet";
export const SUI_RPC_URL = getFullnodeUrl(WALRUS_NETWORK);

// 1. 기본 Sui Client 생성기 (공통)
export const createSuiClient = () => {
  return new SuiClient({ url: SUI_RPC_URL });
};

// 2. Walrus 기능이 확장된 Client 생성기 (공통)
// 클라이언트/서버 모두 이 함수를 통해 SDK 인스턴스를 얻습니다.
export const getWalrusClient = (existingClient?: SuiClient) => {
  const baseClient = existingClient || createSuiClient();
  
  // 이미 walrus 기능이 있다면 그대로 반환
  if ((baseClient as any).walrus) {
     return baseClient as SuiClient & { walrus: WalrusClient };
  }
  
  return baseClient.$extend(walrus({ network: WALRUS_NETWORK }));
};