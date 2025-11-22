import { applicantsService } from "@/server/domains/applicants/applicants.service";
import { SearchApplicantsResult } from "@/server/domains/applicants/applicants.type";
import { historyService } from "@/server/domains/histories/history.service";
import { Result } from "@/server/shared/types/result.type";
import { NextRequest, NextResponse } from "next/server";

/**
 * Search applicants
 * GET /api/v1/search?query=search_term&limit=20
 *
 * @param request
 * @returns Search results with similarity scores
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<Result<SearchApplicantsResult>>> {
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

    // 4. Save search history (async, non-blocking)
    const recruiterWalletAddress = request.headers.get("x-wallet-address");

    if (recruiterWalletAddress && result.data) {
      // Map search results to SearchResultItem format
      const searchResultItems = result.data.results.map((r) => ({
        applicantId: r.id,
        similarity: r.similarity,
        createdAt: r.createdAt,
      }));

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

    // 5. Return search results
    return NextResponse.json(
      {
        success: true,
        data: result.data,
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
