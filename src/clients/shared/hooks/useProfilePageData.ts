import { ProfilePageDataResponse } from "@/server/domains/match/match.type";
import { Result } from "@/server/shared/types/result.type";
import { useQuery } from "@tanstack/react-query";
import { customAxios } from "../libs/axios.libs";

export const useProfilePageData = (walletAddress: string) => {
  const getProfilePageData = async (): Promise<ProfilePageDataResponse> => {
    const response = await customAxios.get<Result<ProfilePageDataResponse>>(
      `/api/v1/match?walletAddress=${walletAddress}`
    );

    if (!response.data.success) {
      throw new Error(
        response.data.errorMessage || "Failed to fetch profile page data"
      );
    }

    return response.data.data;
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["profile-page-data", walletAddress],
    queryFn: getProfilePageData,
    enabled: !!walletAddress,
  });

  return { data, isLoading, error };
};
