export type Applicant = {
  id: string;
  name: string;
  walletAddress: string;
  publicBlobId: string;
  privateBlobId: string;
  sealPolicyId: string;
  pdfDataHash: string;
  position: string; // 공개용 데이터
  techStack: string[]; // 공개용 데이터
  careerDetail: string; // 공개용 데이터
  introduction: string; // 직접 입력
  accessPrice: number;
  embedding: number[];
  isJobSeeking: boolean;
  accessList: Record<string, boolean>;
};
