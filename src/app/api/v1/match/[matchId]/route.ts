import { Match } from "@/server/db/schema/matches.schema";
import { applicantsRepository } from "@/server/domains/applicants/applicants.repository";
import { matchRepository } from "@/server/domains/match/match.repository";
import { matchService } from "@/server/domains/match/match.service";
import { MatchStatus } from "@/server/domains/match/match.type";
import { Result } from "@/server/shared/types/result.type";
import { NextRequest, NextResponse } from "next/server";

/**
 * @openapi
 * /api/v1/match/{matchId}:
 *   patch:
 *     summary: 매치 상태 업데이트 (승인/거절)
 *     description: 구직자가 받은 매치 요청을 승인하거나 거절합니다.
 *     tags:
 *       - Match
 *     parameters:
 *       - in: path
 *         name: matchId
 *         required: true
 *         schema:
 *           type: string
 *         description: 매치테이블 ID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - recruiterWalletAddress
 *               - applicantId
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [approved, rejected]
 *                 description: 업데이트할 상태
 *                 example: "approved"
 *               recruiterWalletAddress:
 *                 type: string
 *                 description: 구인자 지갑 주소 (검증용)
 *                 example: "0x1234567890abcdef"
 *               applicantId:
 *                 type: string
 *                 description: 구직자 ID (검증용 및 권한 확인용)
 *                 example: "applicant_123"
 *     responses:
 *       200:
 *         description: 매치 상태가 성공적으로 업데이트됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         description: 필수 파라미터 누락 또는 잘못된 상태 값
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
 *                   example: "status, recruiterWalletAddress, and applicantId are required"
 *       403:
 *         description: 권한 없음
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
 *                   example: "Unauthorized: You are not the owner of this applicant"
 *       404:
 *         description: 매치를 찾을 수 없음
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
 *                   example: "Match not found"
 *       500:
 *         description: 내부 서버 오류
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
 *                   example: "Internal server error"
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
): Promise<NextResponse<Result<Match>>> {
  try {
    // 1. Parse URL parameters
    const { matchId } = await params;

    // 2. Parse request body
    const body = await request.json();
    const { status, recruiterWalletAddress, applicantId } = body;

    // 3. Validation
    if (!status || !recruiterWalletAddress || !applicantId) {
      return NextResponse.json(
        {
          success: false,
          errorMessage:
            "status, recruiterWalletAddress, and applicantId are required",
        },
        { status: 400 }
      );
    }

    // 4. Validate status value
    const validStatuses: MatchStatus[] = ["approved", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "Invalid status. Must be 'approved' or 'rejected'",
        },
        { status: 400 }
      );
    }

    // 5. Verify match exists and data matches
    const existingMatch = await matchRepository.findById(matchId);

    if (!existingMatch) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "Match not found",
        },
        { status: 404 }
      );
    }

    // 6. Verify recruiterWalletAddress and applicantId match
    if (
      existingMatch.recruiterWalletAddress !== recruiterWalletAddress ||
      existingMatch.applicantId !== applicantId
    ) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "Match data does not match provided parameters",
        },
        { status: 400 }
      );
    }

    // 7. Get applicant wallet address
    const applicant = await applicantsRepository.findById(applicantId);

    if (!applicant) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "Applicant not found",
        },
        { status: 404 }
      );
    }

    // 8. Update match status
    const result = await matchService.updateMatchStatus({
      matchId: matchId,
      status,
      applicantWalletAddress: applicant.walletAddress,
    });

    if (!result.success) {
      // Determine appropriate status code
      const statusCode = result.errorMessage?.includes("not found")
        ? 404
        : result.errorMessage?.includes("Unauthorized")
        ? 403
        : 500;

      return NextResponse.json(
        {
          success: false,
          errorMessage: result.errorMessage,
        },
        { status: statusCode }
      );
    }

    // 6. Return updated match
    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in PATCH /api/v1/match/[matchId]:", error);

    return NextResponse.json(
      {
        success: false,
        errorMessage: "Internal server error",
      },
      { status: 500 }
    );
  }
}
