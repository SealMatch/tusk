export type Applicant = {
  id: string;
  handle: string;
  walletAddress: string;
  blobId: string;
  sealPolicyId: string;
  pdfDataHash: string;
  position: string; // 공개용 데이터
  techStack: string[]; // 공개용 데이터
  aiSummary: string; // 공개용 데이터
  introduction: string; // 직접 입력 - 공개용 데이터
  accessPrice: number;
  embedding: number[];
  isJobSeeking: boolean;
  accessList: Record<string, boolean>;
};
