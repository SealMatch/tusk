import { removeRecruiterTx } from "../libs/contracts.libs";
import useExecOnChain from "./useExecOnChain"

export type RemoveRecruiterParams = {
    policyId: string;
    adminCapId: string;
    recruiterAddress: string;
}

export const useRemoveWhitelist = () => {
    const { exec } = useExecOnChain();

    const handleRemoveRecruiter = ({
        policyId,
        adminCapId,
        recruiterAddress,
    }: RemoveRecruiterParams) => {
        const tx = removeRecruiterTx(policyId, adminCapId, recruiterAddress);
        const result = exec(tx);
    }

    return {
        handleRemoveRecruiter,
    }
}