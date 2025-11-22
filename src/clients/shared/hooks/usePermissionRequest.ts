import { PACKAGE_ID } from "@/clients/shared/config";
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UsePermissionRequestParams {
  blobId: string;
  companyAddress: string;
  currentAccountAddress: string;
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
              resolve({ success: true, newStatus: "pending" as const });
            },
            onError: (error) => {
              console.error("Transaction failed:", error);
              reject(error);
            },
          }
        );
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["resume", blobId, companyAddress],
      });
      queryClient.invalidateQueries({
        queryKey: ["viewRequestStatus", companyAddress, blobId],
      });
    },
  });

  return {
    requestPermission: mutation.mutate,
    isPending: mutation.isPending,
  };
}
