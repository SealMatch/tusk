import { historyService } from "@/server/domains/histories/history.service";
import { History } from "@/server/db/schema/histories.schema";
import { Result } from "@/server/shared/types/result.type";
import { NextRequest, NextResponse } from "next/server";

/**
 * Get search histories by recruiter
 * GET /api/v1/histories?recruiterAddress=0x...
 *
 * @param request
 * @returns Search history list
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<Result<History[]>>> {
  try {
    // 1. Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const recruiterAddress = searchParams.get("recruiterAddress");

    // 2. Validation
    if (!recruiterAddress) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "recruiterAddress parameter is required",
        },
        { status: 400 }
      );
    }

    // Optional: Validate wallet address format (0x...)
    if (!recruiterAddress.startsWith("0x")) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "Invalid wallet address format",
        },
        { status: 400 }
      );
    }

    // 3. Service call
    const result = await historyService.getSearchHistoriesByRecruiter(
      recruiterAddress
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

    // 4. Return histories
    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in GET /api/v1/histories:", error);

    return NextResponse.json(
      {
        success: false,
        errorMessage: "Internal server error",
      },
      { status: 500 }
    );
  }
}
