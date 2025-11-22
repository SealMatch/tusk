import { historyService } from "@/server/domains/histories/history.service";
import { SearchResultCard } from "@/server/domains/histories/history.type";
import { Result } from "@/server/shared/types/result.type";
import { NextRequest, NextResponse } from "next/server";

/**
 * Request body schema
 */
interface SearchResultCardsBody {
  query: string;
  results: Array<{
    applicantId: string;
    similarity: number;
    createdAt: string; // ISO 8601 string
  }>;
  recruiterWalletAddress: string;
}

/**
 * @openapi
 * /api/v1/search/result-cards:
 *   post:
 *     summary: 검색 결과 카드 조회
 *     description: 검색 결과와 매칭 정보를 결합하여 카드 형태로 제공합니다.
 *     tags:
 *       - Search
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
export async function POST(
  request: NextRequest
): Promise<NextResponse<Result<SearchResultCard[]>>> {
  try {
    // 1. Parse request body
    const body: SearchResultCardsBody = await request.json();

    // 2. Validation
    if (!body.recruiterWalletAddress) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "recruiterWalletAddress is required",
        },
        { status: 400 }
      );
    }

    if (!body.recruiterWalletAddress.startsWith("0x")) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "Invalid wallet address format",
        },
        { status: 400 }
      );
    }

    if (!body.query || typeof body.query !== "string") {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "query is required and must be a string",
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.results)) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "results must be an array",
        },
        { status: 400 }
      );
    }

    // Validate results array structure
    for (const item of body.results) {
      if (!item.applicantId || typeof item.applicantId !== "string") {
        return NextResponse.json(
          {
            success: false,
            errorMessage: "Each result item must have a valid applicantId",
          },
          { status: 400 }
        );
      }

      if (typeof item.similarity !== "number") {
        return NextResponse.json(
          {
            success: false,
            errorMessage: "Each result item must have a valid similarity score",
          },
          { status: 400 }
        );
      }

      if (!item.createdAt || typeof item.createdAt !== "string") {
        return NextResponse.json(
          {
            success: false,
            errorMessage: "Each result item must have a valid createdAt",
          },
          { status: 400 }
        );
      }
    }

    // 3. Convert results to SearchResultItem format
    const searchResultItems = body.results.map((item) => ({
      applicantId: item.applicantId,
      similarity: item.similarity,
      createdAt: new Date(item.createdAt),
    }));

    // 4. Service call
    const result = await historyService.getSearchResultCards(
      body.recruiterWalletAddress,
      searchResultItems
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

    // 5. Return result cards
    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in POST /api/v1/search/result-cards:", error);

    return NextResponse.json(
      {
        success: false,
        errorMessage: "Internal server error",
      },
      { status: 500 }
    );
  }
}
