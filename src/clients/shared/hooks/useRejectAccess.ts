import { rejectViewRequestTx } from "../libs/contracts.libs";
import useExecOnChain from "./useExecOnChain";

export type RejectAccessParams = {
    viewRequestId: string;
    policyObjectId: string;
}

export const useRejectAccess = () => {
    const { exec } = useExecOnChain();

    const handleRejectAccess = async ({ viewRequestId, policyObjectId }: RejectAccessParams) => {
        const tx = rejectViewRequestTx(viewRequestId, policyObjectId);
        const result = await exec(tx);
        return result;
    };

    return {
        handleRejectAccess
    }
};