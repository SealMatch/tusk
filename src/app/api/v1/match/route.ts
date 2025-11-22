import { Match } from "@/server/db/schema/matches.schema";
import { matchService } from "@/server/domains/match/match.service";
import { Result } from "@/server/shared/types/result.type";
import { NextRequest, NextResponse } from "next/server";

/**
 * Create match request
 * POST /api/v1/match
 *
 * @param request
 * @returns Created match
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
