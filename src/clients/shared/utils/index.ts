export { downloadAndDecryptPdf, downloadBlob } from "./pdf-download.utils";
export type {
  PdfDownloadProgress,
  PdfDownloadResult,
} from "./pdf-download.utils";
export { formatAddress } from "./wallet.utils";

export const testWalletAddress =
  process.env.VERCEL_ENV === "development"
    ? process.env.NEXT_PUBLIC_TEST_WALLET_ADDRESS
    : "";
