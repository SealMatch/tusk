import { approveViewRequestTx } from "../libs/contracts.libs";
import useExecOnChain from "./useExecOnChain";

export type ApproveAccessParams = {
    viewRequestId: string;
    policyObjectId: string;
    adminCapId: string;
}

export const useApproveAccess = ({ viewRequestId, policyObjectId, adminCapId }: ApproveAccessParams) => {
    const { exec } = useExecOnChain();

    const handleApproveAccess = async () => {
        const tx = approveViewRequestTx(viewRequestId, policyObjectId, adminCapId);
        const result = await exec(tx);
    };

    return {
        handleApproveAccess
    }
};