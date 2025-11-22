import { rejectViewRequestTx } from "../libs/contracts.libs";
import useExecOnChain from "./useExecOnChain";

export type RejectAccessParams = {
    viewRequestId: string;
    policyObjectId: string;
    adminCapId: string;
}

export const useRejectAccess = ({ viewRequestId, policyObjectId, adminCapId }: RejectAccessParams) => {
    const { exec } = useExecOnChain();

    const handleRejectAccess = async () => {
        const tx = rejectViewRequestTx(viewRequestId, policyObjectId, adminCapId);
        const result = await exec(tx);
    };

    return {
        handleRejectAccess
    }
};