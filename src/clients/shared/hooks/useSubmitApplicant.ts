import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CreateApplicantParams {
    handle: string;
    walletAddress: string;
    position: string;
    techStack: string[];
    aiSummary: string;
    introduction?: string;
    blobId?: string;
    capId?: string;
    sealPolicyId?: string;
    encryptionId?: string;
    accessPrice?: number;
    isJobSeeking?: boolean;
}

interface CreateApplicantResponse {
    success: boolean;
    data?: string; // applicant ID
    errorMessage?: string;
}

export function useSubmitApplicant() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (params: CreateApplicantParams): Promise<CreateApplicantResponse> => {
            const response = await fetch('/api/v1/applicants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.errorMessage || '지원자 등록에 실패했습니다.');
            }

            return result;
        },
        onSuccess: (data) => {
            console.log('✅ 지원자 등록 성공:', data.data);
            queryClient.invalidateQueries({ queryKey: ['applicants'] });
        },
        onError: (error) => {
            console.error('❌ 지원자 등록 에러:', error);
        },
    });

    return {
        submitApplicant: mutation.mutate,
        submitApplicantAsync: mutation.mutateAsync,
        isLoading: mutation.isPending,
        isSuccess: mutation.isSuccess,
        isError: mutation.isError,
        error: mutation.error,
        data: mutation.data,
        reset: mutation.reset,
    };
}
