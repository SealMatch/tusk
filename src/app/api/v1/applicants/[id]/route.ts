import { applicantsService } from "@/server/domains/applicants/applicants.service";
import { Result } from "@/server/shared/types/result.type";
import { NextRequest, NextResponse } from "next/server";

/**
 * @openapi
 * /api/v1/applicants/{id}:
 *   get:
 *     summary: 단일 지원자 조회
 *     description: ID로 특정 지원자의 정보를 조회합니다.
 *     tags:
 *       - Applicants
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 지원자 ID
 *         example: "uuid-1234-5678"
 *     responses:
 *       200:
 *         description: 지원자 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     handle:
 *                       type: string
 *                     walletAddress:
 *                       type: string
 *                     position:
 *                       type: string
 *                     techStack:
 *                       type: array
 *                       items:
 *                         type: string
 *                     aiSummary:
 *                       type: string
 *                     blobId:
 *                       type: string
 *                     sealPolicyId:
 *                       type: string
 *                     accessPrice:
 *                       type: integer
 *                     isJobSeeking:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *       404:
 *         description: 지원자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errorMessage:
 *                   type: string
 *                   example: "Applicant not found"
 *       500:
 *         description: 내부 서버 오류
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<Result<unknown>>> {
  try {
    const { id } = await params;

    const applicant = await applicantsService.getApplicantById(id);

    if (!applicant) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "Applicant not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          id: applicant.id,
          handle: applicant.handle,
          walletAddress: applicant.walletAddress,
          position: applicant.position,
          techStack: applicant.techStack,
          aiSummary: applicant.aiSummary,
          blobId: applicant.blobId,
          sealPolicyId: applicant.sealPolicyId,
          accessPrice: applicant.accessPrice,
          isJobSeeking: applicant.isJobSeeking,
          createdAt: applicant.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/v1/applicants/[id]:", error);

    return NextResponse.json(
      {
        success: false,
        errorMessage: "Internal server error",
      },
      { status: 500 }
    );
  }
}
