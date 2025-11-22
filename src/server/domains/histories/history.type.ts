export interface CreateHistoryParams {
  id: string;
  recruiterWalletAddress: string;
  query: string;
  result: SearchResultItem["applicantId"][];
  createdAt: Date;
}

export interface SearchResultItem {
  applicantId: string;
  walletAddress: string;
  position: string;
  techStack: string[];
  aiSummary: string;
  blobId: string;
  sealPolicyId: string;
  accessPrice: number;
  accessStatus: "pending" | "accepted" | "rejected";
  similarity: number;
  createdAt: Date;
}
