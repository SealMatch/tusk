// lib/walrus-config.ts
import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { SuiJsonRpcClient } from "@mysten/sui/jsonRpc";
import { walrus, type WalrusClient } from "@mysten/walrus";

export const walrusClient = new SuiJsonRpcClient({
  url: getFullnodeUrl('testnet'),
  // Setting network on your client is required for walrus to work correctly
  network: 'testnet',
}).$extend(walrus({
  wasmUrl: 'https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm'
})).walrus;