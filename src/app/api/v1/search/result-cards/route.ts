import { applicantsService } from "@/server/domains/applicants";
import { PublicApplicant } from "@/server/domains/applicants/applicants.type";
import { historyService } from "@/server/domains/histories/history.service";
import { SearchResultCard } from "@/server/domains/histories/history.type";
import { Result } from "@/server/shared/types/result.type";
import { NextRequest, NextResponse } from "next/server";



/**
 * @openapi
 * /api/v1/histories/result-cards:
 *   post:
 *     summary: 예전 검색 결과 카드 조회
 *     description: 예전 검색 결과와 매칭 정보를 결합하여 카드 형태로 제공합니다.
 *     tags:
 *       - Histories
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *               - results
 *               - recruiterWalletAddress
 *             properties:
 *               query:
 *                 type: string
 *                 description: 검색 쿼리
 *                 example: "React 개발자"
 *               results:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - applicantId
 *                     - similarity
 *                     - createdAt
 *                   properties:
 *                     applicantId:
 *                       type: string
 *                       description: 지원자 ID
 *                       example: "applicant_123"
 *                     similarity:
 *                       type: number
 *                       description: 유사도 점수
 *                       example: 0.85
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: 생성 일시 (ISO 8601)
 *                       example: "2024-01-15T10:30:00Z"
 *                 description: 검색 결과 목록
 *               recruiterWalletAddress:
 *                 type: string
 *                 description: 채용자 지갑 주소
 *                 example: "0xabcdef1234567890"
 *     responses:
 *       200:
 *         description: 검색 결과 카드 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SearchResultCard'
 *       400:
 *         description: 잘못된 요청 (필수 필드 누락 또는 유효성 검증 실패)
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
 *                   example: "recruiterWalletAddress is required"
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
export async function GET(
  request: NextRequest
): Promise<NextResponse<Result<SearchResultCard[]>>> {
  try {
    // 1. Extract parameters
    const searchParams = request.nextUrl.searchParams;
    const historyId = searchParams.get("historyId");
    const recruiterWalletAddress = request.headers.get("x-wallet-address");

    // 2. Validation
    if (!historyId) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "historyId is required",
        },
        { status: 400 }
      );
    }

    if (!recruiterWalletAddress) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "recruiterWalletAddress is required (x-wallet-address header)",
        },
        { status: 400 }
      );
    }

    // 3. Fetch history
    const historyResult = await historyService.getHistoryById(historyId);

    if (!historyResult.success) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: historyResult.errorMessage || "History not found",
        },
        { status: 404 }
      );
    }

    if (!historyResult.data) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "History data is missing",
        },
        { status: 404 }
      );
    }

    const history = historyResult.data;

    // 4. Verify ownership
    if (history.recruiterWalletAddress !== recruiterWalletAddress) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "Unauthorized: You can only view your own history",
        },
        { status: 403 }
      );
    }

    // 5. Get result cards
    const result = await historyService.getSearchResultCards(
      recruiterWalletAddress,
      history.results
    );

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: result.errorMessage,
        },
        { status: 500 }
      );
    }

    // 6. Return result cards
    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in GET /api/v1/search/result-cards:", error);

    return NextResponse.json(
      {
        success: false,
        errorMessage: "Internal server error",
      },
      { status: 500 }
    );
  }
}
