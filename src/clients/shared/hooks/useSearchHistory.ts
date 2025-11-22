import { History } from "@/server/db/schema/histories.schema";
import { Result } from "@/server/shared/types/result.type";
import { useCurrentAccount } from "@mysten/dapp-kit";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { customAxios } from "../libs/axios.libs";

export const useSearchHistory = () => {
  const recruiterWalletAddress = useCurrentAccount()?.address;
  const queryClient = useQueryClient();

  const deleteSearchHistoryFn = async (historyId: string) => {
    if (!recruiterWalletAddress) {
      throw new Error("Wallet address is required");
    }

    const response = await customAxios.delete<Result<void>>(
      `/api/v1/histories/${historyId}`,
      {
        headers: {
          "X-Wallet-Address": recruiterWalletAddress,
        },
      }
    );

    if (!response.data.success) {
      throw new Error(
        response.data.errorMessage || "Failed to delete search history"
      );
    }
  };

  const deleteSearchHistory = useMutation({
    mutationFn: deleteSearchHistoryFn,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["search-history", recruiterWalletAddress],
      });
    },
  });

  const getSearchHistory = async (): Promise<History[]> => {
    if (!recruiterWalletAddress) {
      return [];
    }

    const response = await customAxios.get<Result<History[]>>(
      `/api/v1/histories?recruiterAddress=${recruiterWalletAddress}`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.errorMessage || "Failed to fetch search history"
      );
    }

    return response.data.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["search-history", recruiterWalletAddress],
    queryFn: getSearchHistory,
    enabled: !!recruiterWalletAddress,
  });

  console.log(data);

  return { data, isLoading, error, deleteSearchHistory };
};
