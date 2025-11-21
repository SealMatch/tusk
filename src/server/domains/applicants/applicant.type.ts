export type Applicant = {
  id: string;
  name: string;
  walletAddress: string;
  publicBlobId: string;
  privateBlobId: string;
  sealPolicyId: string;
  dataHash: string;
  position: string; // 공개용 데이터
  techStack: string[]; // 공개용 데이터
  careerDetail: string;
  education: Education[];
  experiences: Experience[];
  introduction: string; // 공개용 데이터
  projects: Project[]; // 수기 입력 필요
  accessPrice: number;
  isJobSeeking: boolean;
  accessList: Record<string, boolean>;
};

export type Education = {
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  isCurrentEducation: boolean;
};

export type Experience = {
  companyName: string;
  title: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  isCurrentJob: boolean;
};

export type Project = {
  title: string;
  url: string;
  description: string;
};
