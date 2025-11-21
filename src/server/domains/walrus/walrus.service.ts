import { SealClient } from "@mysten/seal";
import { WalrusClient } from "@mysten/walrus";

class WalrusService {
  private readonly walrusClient: WalrusClient;
  private readonly sealClient: SealClient;
}

export const walrusService = new WalrusService();
