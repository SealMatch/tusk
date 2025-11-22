import { createViewRequestTx, extractViewRequestObjectIds } from "../libs/contracts.libs"
import useExecOnChain from "./useExecOnChain";

export type RequestAccessParams = {
    policyObjectId: string;
    accessPrice: string;
}

export const useRequestAccess = ({ policyObjectId, accessPrice }: RequestAccessParams) => {

    const { exec } = useExecOnChain();

    const handleRequestAccess = async () => {
        try {
            const tx = createViewRequestTx(
                policyObjectId,
                accessPrice,
            );
            const result = await exec(tx);
            const { viewRequestId } = extractViewRequestObjectIds(result);

            return viewRequestId;
        } catch (error) {
            console.error('Request access failed:', error);
            throw error;
        }
    }

    return {
        handleRequestAccess
    }
}