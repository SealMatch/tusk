import { PACKAGE_ID } from "@/clients/shared/config";
import { requestPermission } from "@/clients/shared/mocks";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UsePermissionRequestParams {
  blobId: string;
  companyAddress: string | undefined;
  currentAccountAddress: string | undefined;
}

export function usePermissionRequest({
  blobId,
  companyAddress,
  currentAccountAddress,
}: UsePermissionRequestParams) {
  const queryClient = useQueryClient();
  const suiClient = useSuiClient();
  const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const mutation = useMutation({
    mutationFn: async () => {
      if (currentAccountAddress) {
        const tx = new Transaction();
        const candidateIdBytes = Array.from(new TextEncoder().encode(blobId));

        tx.moveCall({
          target: `${PACKAGE_ID}::view_request::create`,
          arguments: [
            tx.pure.address(currentAccountAddress),
            tx.pure.vector("u8", candidateIdBytes),
          ],
        });

        return new Promise((resolve, reject) => {
          signAndExecuteTransaction(
            { transaction: tx },
            {
              onSuccess: async (result) => {
                await suiClient.waitForTransaction({ digest: result.digest });
                await requestPermission(blobId, companyAddress);
                resolve({ success: true, newStatus: "pending" as const });
              },
              onError: (error) => {
                console.error("Transaction failed:", error);
                reject(error);
              },
            }
          );
        });
      }

      return requestPermission(blobId, companyAddress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["resume", blobId, companyAddress],
      });
    },
  });

  return {
    requestPermission: mutation.mutate,
    isPending: mutation.isPending,
  };
}
