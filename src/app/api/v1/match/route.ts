import { Match } from "@/server/db/schema/matches.schema";
import { matchService } from "@/server/domains/match/match.service";
import { Result } from "@/server/shared/types/result.type";
import { NextRequest, NextResponse } from "next/server";

/**
 * @openapi
 * /api/v1/match:
 *   post:
 *     summary: 매칭 요청 생성
 *     description: 채용자가 지원자에게 매칭 요청을 생성합니다.
 *     tags:
 *       - Match
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recruiterWalletAddress
 *               - applicantId
 *             properties:
 *               recruiterWalletAddress:
 *                 type: string
 *                 description: 채용자 지갑 주소
 *                 example: "0xabcdef1234567890"
 *               applicantId:
 *                 type: string
 *                 description: 지원자 ID
 *                 example: "applicant_123"
 *     responses:
 *       201:
 *         description: 매칭이 성공적으로 생성됨
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
 *         description: 필수 파라미터 누락
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
 *                   example: "recruiterWalletAddress and applicantId are required"
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
 *       409:
 *         description: 이미 매칭이 존재함
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
 *                   example: "Match already exists"
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
export async function POST(
  request: NextRequest
): Promise<NextResponse<Result<Match>>> {
  try {
    // 1. Parse request body
    const body = await request.json();
    const { recruiterWalletAddress, applicantId } = body;

    // 2. Validation
    if (!recruiterWalletAddress || !applicantId) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "recruiterWalletAddress and applicantId are required",
        },
        { status: 400 }
      );
    }

    // 3. Create match
    const result = await matchService.createMatch({
      recruiterWalletAddress,
      applicantId,
    });

    if (!result.success) {
      // Determine appropriate status code
      const status = result.errorMessage?.includes("already exists")
        ? 409
        : result.errorMessage?.includes("not found")
        ? 404
        : 500;

      return NextResponse.json(
        {
          success: false,
          errorMessage: result.errorMessage,
        },
        { status }
      );
    }

    // 4. Return created match
    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("L Error in POST /api/v1/match:", error);

    return NextResponse.json(
      {
        success: false,
        errorMessage: "Internal server error",
      },
      { status: 500 }
    );
  }
}
