import { applicantsService } from "@/server/domains/applicants/applicants.service";
import { PublicApplicant } from "@/server/domains/applicants/applicants.type";
import { historyService } from "@/server/domains/histories/history.service";
import { SearchResultCard } from "@/server/domains/histories/history.type";
import { Result } from "@/server/shared/types/result.type";
import { NextRequest, NextResponse } from "next/server";

/**
 * @openapi
 * /api/v1/search:
 *   get:
 *     summary: 지원자 검색
 *     description: AI 벡터 검색을 통해 지원자를 검색합니다. 검색 이력도 자동으로 저장됩니다.
 *     tags:
 *       - Search
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: 검색 쿼리 (자연어)
 *         example: "React와 TypeScript 경험이 있는 개발자"
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 검색 결과 개수
 *         example: 20
 *       - in: header
 *         name: x-wallet-address
 *         required: false
 *         schema:
 *           type: string
 *         description: 채용자 지갑 주소 (검색 이력 저장용)
 *         example: "0xabcdef1234567890"
 *     responses:
 *       200:
 *         description: 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SearchResult'
 *       400:
 *         description: 잘못된 요청 (쿼리 누락 또는 limit 범위 초과)
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
 *                   example: "Query parameter is required"
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
): Promise<
  NextResponse<Result<{ results: SearchResultCard[]; total: number }>>
> {
  try {
    // 1. Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query");
    const limitParam = searchParams.get("limit");

    // 2. Validation
    if (!query || query.trim() === "") {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "Query parameter is required",
        },
        { status: 400 }
      );
    }

    const limit = limitParam ? parseInt(limitParam, 10) : 20;

    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "Limit must be between 1 and 100",
        },
        { status: 400 }
      );
    }

    // 3. Call service layer
    // - Convert query to embedding (LLM)
    // - Search by vector similarity (DB)
    const result = await applicantsService.searchApplicants({
      query: query.trim(),
      limit,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: result.errorMessage,
        },
        { status: 500 }
      );
    }

    // 4. Save search history (async, non-blocking) & Enrich results
    const recruiterWalletAddress =
      request.headers.get("x-wallet-address") || "";

    // Map search results to SearchResultItem format (for history service)
    const searchResultItems = result.data!.results.map((r) => {
      const { similarity, ...snapshot } = r;
      return {
        applicantId: r.id,
        similarity: similarity,
        createdAt: r.createdAt,
        snapshot: snapshot as unknown as PublicApplicant, // Explicit cast to avoid type issues
      };
    });

    if (recruiterWalletAddress) {
      // Save history in background (don't await)
      historyService
        .createSearchHistory({
          recruiterWalletAddress,
          query: query.trim(),
          results: searchResultItems,
        })
        .catch((err) => {
          console.warn("⚠️ Failed to save search history:", err);
        });
    }

    // 5. Get full result cards (with match info)
    const cardsResult = await historyService.getSearchResultCards(
      recruiterWalletAddress,
      searchResultItems
    );

    if (!cardsResult.success) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: cardsResult.errorMessage,
        },
        { status: 500 }
      );
    }

    // 6. Return search results
    return NextResponse.json(
      {
        success: true,
        data: {
          results: cardsResult.data!,
          total: result.data!.total,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in GET /api/v1/search:", error);

    return NextResponse.json(
      {
        success: false,
        errorMessage: "Internal server error",
      },
      { status: 500 }
    );
  }
}
