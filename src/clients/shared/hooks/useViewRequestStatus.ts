import { PACKAGE_ID } from "@/clients/shared/config";
import type { PermissionStatus } from "@/clients/shared/types";
import { useSuiClient } from "@mysten/dapp-kit";
import { useQuery } from "@tanstack/react-query";

// ViewRequest 객체의 Move 타입
const VIEW_REQUEST_TYPE = `${PACKAGE_ID}::view_request::ViewRequest`;

// status 값을 PermissionStatus로 변환
function parseStatus(status: number): PermissionStatus {
  switch (status) {
    case 0:
      return "pending";
    case 1:
      return "approved";
    case 2:
      return "rejected";
    default:
      return "pending";
  }
}

interface ViewRequestFields {
  recruiter: string;
  candidate_id: number[]; // vector<u8>
  status: number;
}

interface UseViewRequestStatusParams {
  recruiterAddress: string | undefined;
  candidateId: string; // blobId
  enabled?: boolean;
}

export function useViewRequestStatus({
  recruiterAddress,
  candidateId,
  enabled = true,
}: UseViewRequestStatusParams) {
  const suiClient = useSuiClient();

  return useQuery({
    queryKey: ["viewRequestStatus", recruiterAddress, candidateId],
    queryFn: async (): Promise<PermissionStatus | null> => {
      if (!recruiterAddress) return null;

      // candidateId를 bytes로 변환 (비교용)
      const candidateIdBytes = Array.from(new TextEncoder().encode(candidateId));

      // recruiter가 소유한 ViewRequest 객체들 조회
      const { data: objects } = await suiClient.getOwnedObjects({
        owner: recruiterAddress,
        filter: {
          StructType: VIEW_REQUEST_TYPE,
        },
        options: {
          showContent: true,
        },
      });

      // 해당 candidateId와 매칭되는 ViewRequest 찾기
      for (const obj of objects) {
        if (obj.data?.content?.dataType !== "moveObject") continue;

        const fields = obj.data.content.fields as unknown as ViewRequestFields;

        // candidate_id 비교
        const storedCandidateId = fields.candidate_id;
        if (
          storedCandidateId.length === candidateIdBytes.length &&
          storedCandidateId.every((byte, i) => byte === candidateIdBytes[i])
        ) {
          return parseStatus(fields.status);
        }
      }

      // 매칭되는 ViewRequest가 없으면 null (요청한 적 없음)
      return null;
    },
    enabled: enabled && !!recruiterAddress && !!candidateId,
    staleTime: 10000, // 10초간 캐시
    refetchInterval: 30000, // 30초마다 자동 갱신
  });
}
