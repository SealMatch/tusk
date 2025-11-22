import { applicantsService } from "@/server/domains/applicants/applicants.service";
import { Result } from "@/server/shared/types/result.type";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Request body validation schema
const createApplicantSchema = z.object({
  handle: z.string().min(1, "Handle is required"),
  walletAddress: z.string().min(1, "Wallet address is required"),
  position: z.string().min(1, "Position is required"),
  techStack: z.array(z.string()).min(1, "At least one tech stack is required"),
  aiSummary: z.string().min(1, "AI summary is required"),
  blobId: z.string().optional(),
  sealPolicyId: z.string().optional(),
  accessPrice: z.number().int().min(0).optional(),
  isJobSeeking: z.boolean().optional(),
});

/**
 * 지원자 등록
 * POST /api/v1/applicants
 *
 * @param request
 * @returns 201 Created with applicant id
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<Result<string>>> {
  try {
    // 1. Request body 파싱 및 검증
    const body = await request.json();
    const validatedData = createApplicantSchema.parse(body);

    // 2. Service 레이어 호출
    const result = await applicantsService.createApplicant(validatedData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: result.errorMessage,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data!.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Error in POST /api/v1/applicants:", error);

    // Zod validation error
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "Validation failed",
        },
        { status: 400 }
      );
    }

    // General error
    return NextResponse.json(
      {
        success: false,
        errorMessage: "Internal server error",
      },
      { status: 500 }
    );
  }
}
