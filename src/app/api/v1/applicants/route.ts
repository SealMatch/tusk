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
  encryptionId: z.string().optional(),
  accessPrice: z.number().int().min(0).optional(),
  isJobSeeking: z.boolean().optional(),
});

/**
 * @openapi
 * /api/v1/applicants:
 *   post:
 *     summary: 지원자 등록
 *     description: 새로운 지원자를 시스템에 등록합니다. AI 요약과 기술 스택 정보를 포함합니다.
 *     tags:
 *       - Applicants
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - handle
 *               - walletAddress
 *               - position
 *               - techStack
 *               - aiSummary
 *             properties:
 *               handle:
 *                 type: string
 *                 description: 사용자 핸들
 *                 example: "john_dev"
 *               walletAddress:
 *                 type: string
 *                 description: 지갑 주소
 *                 example: "0x1234567890abcdef"
 *               position:
 *                 type: string
 *                 description: 직무
 *                 example: "Frontend Developer"
 *               techStack:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 기술 스택 목록
 *                 example: ["React", "TypeScript", "Next.js"]
 *               aiSummary:
 *                 type: string
 *                 description: AI 생성 요약
 *                 example: "3년 경력의 프론트엔드 개발자..."
 *               blobId:
 *                 type: string
 *                 description: Blob ID (선택)
 *                 example: "blob_123"
 *               sealPolicyId:
 *                 type: string
 *                 description: Seal Policy ID (선택)
 *                 example: "policy_456"
 *               encryptionId:
 *                 type: string
 *                 description: Encryption ID (선택)
 *                 example: "encryption_789"
 *               accessPrice:
 *                 type: integer
 *                 minimum: 0
 *                 description: 접근 가격 (선택)
 *                 example: 1000
 *               isJobSeeking:
 *                 type: boolean
 *                 description: 구직 중 여부
 *                 example: true
 *     responses:
 *       201:
 *         description: 지원자가 성공적으로 생성됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: string
 *                   description: 생성된 지원자 ID
 *                   example: "applicant_123"
 *       400:
 *         description: 유효성 검증 실패
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
 *                   example: "Validation failed"
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
