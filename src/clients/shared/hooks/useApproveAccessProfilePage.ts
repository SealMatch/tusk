import { approveViewRequestTx } from "../libs/contracts.libs";
import useExecOnChain from "./useExecOnChain";

export type ApproveAccessParams = {
  viewRequestId: string;
  policyObjectId: string;
  adminCapId: string;
  matchId: string;
  recruiterWalletAddress: string;
  applicantId: string;
};

export const useApproveAccessProfilePage = () => {
  const { exec } = useExecOnChain();

  const handleApproveAccess = async ({
    viewRequestId,
    policyObjectId,
    adminCapId,
    matchId,
    recruiterWalletAddress,
    applicantId,
  }: ApproveAccessParams) => {
    // 1. 블록체인 트랜잭션 생성 및 실행
    const tx = approveViewRequestTx(viewRequestId, policyObjectId, adminCapId);
    const result = await exec(tx);

    // 2. 블록체인 성공 확인
    if (result.effects?.status?.status === "success") {
      // 3. DB 업데이트 (PostgreSQL)
      try {
        const response = await fetch(`/api/v1/match/${matchId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "approved",
            recruiterWalletAddress,
            applicantId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Failed to update match status in DB:", errorData);
        }
      } catch (error) {
        console.error("Error calling PATCH API:", error);
      }
    }

    return result;
  };

  return {
    handleApproveAccess,
  };
};
