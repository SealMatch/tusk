import { historyService } from "@/server/domains/histories/history.service";
import { History } from "@/server/db/schema/histories.schema";
import { Result } from "@/server/shared/types/result.type";
import { NextRequest, NextResponse } from "next/server";

/**
 * @openapi
 * /api/v1/histories:
 *   get:
 *     summary: 검색 이력 조회
 *     description: 채용자의 검색 이력을 조회합니다.
 *     tags:
 *       - Histories
 *     parameters:
 *       - in: query
 *         name: recruiterAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: 채용자 지갑 주소
 *         example: "0xabcdef1234567890"
 *     responses:
 *       200:
 *         description: 검색 이력 조회 성공
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
 *                     $ref: '#/components/schemas/History'
 *       400:
 *         description: 잘못된 요청 (파라미터 누락 또는 잘못된 지갑 주소 형식)
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
 *                   example: "recruiterAddress parameter is required"
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
