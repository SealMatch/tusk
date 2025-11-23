import { rejectViewRequestTx } from "../libs/contracts.libs";
import useExecOnChain from "./useExecOnChain";

export type RejectAccessParams = {
  viewRequestId: string;
  policyObjectId: string;
  matchId: string;
  recruiterWalletAddress: string;
  applicantId: string;
};

export const useRejectAccessProfilePage = () => {
  const { exec } = useExecOnChain();

  const handleRejectAccess = async ({
    viewRequestId,
    policyObjectId,
    matchId,
    recruiterWalletAddress,
    applicantId,
  }: RejectAccessParams) => {
    // 1. 블록체인 트랜잭션 생성 및 실행
    const tx = rejectViewRequestTx(viewRequestId, policyObjectId);
    const result = await exec(tx);

    // 2. 블록체인 성공 확인
    if (result.effects?.status?.status === "success") {
      // 3. DB 업데이트 (PostgreSQL)
      try {
        const response = await fetch(`/api/v1/match/${matchId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "rejected",
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
    handleRejectAccess,
  };
};
