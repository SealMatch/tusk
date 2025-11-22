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
 * Get search result cards with match information
 * POST /api/v1/search/result-cards
 *
 * @param request
 * @returns SearchResultCard[] (only items with existing matches)
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
