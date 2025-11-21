class SuiService {
  // Access Policy 생성
  async createAccessPolicy(applicantAddress: string) {
    throw new Error("Not implemented");
  }

  // Recruiter 접근 권한 추가
  async addRecruiterToAccessList(
    policyId: string,
    adminCap: string,
    recruiterAddress: string
  ) {
    throw new Error("Not implemented");
  }

  // View Request 생성
  async createViewRequest(recruiterAddress: string, candidateId: string) {
    throw new Error("Not implemented");
  }

  // View Request 승인/거부
  async approveViewRequest(requestId: string) {
    throw new Error("Not implemented");
  }
}

export const suiService = new SuiService();
