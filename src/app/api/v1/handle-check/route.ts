import { applicantsService } from "@/server/domains/applicants/applicants.service";
import { Result } from "@/server/shared/types/result.type";
import { NextRequest, NextResponse } from "next/server";

/**
 * @openapi
 * /api/v1/handle-check:
 *   get:
 *     summary: handle 중복 확인
 *     description: 주어진 handle이 이미 사용 중인지 확인합니다.
 *     tags:
 *       - Applicants
 *     parameters:
 *       - in: query
 *         name: handle
 *         required: true
 *         schema:
 *           type: string
 *         description: 확인할 handle
 *         example: "johndoe"
 *     responses:
 *       200:
 *         description: 중복 확인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: boolean
 *                   description: true = 이미 존재 (중복), false = 사용 가능
 *                   example: false
 *       400:
 *         description: 잘못된 요청 (handle 파라미터 누락)
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
 *                   example: "handle parameter is required"
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
): Promise<NextResponse<Result<boolean>>> {
  try {
    // 1. Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const handle = searchParams.get("handle");

    // 2. Validation
    if (!handle) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "handle parameter is required",
        },
        { status: 400 }
      );
    }

    // 3. Service call
    const result = await applicantsService.handleCheck(handle);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: result.errorMessage,
        },
        { status: 500 }
      );
    }

    // 4. Return result
    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in GET /api/v1/handle-check:", error);

    return NextResponse.json(
      {
        success: false,
        errorMessage: "Internal server error",
      },
      { status: 500 }
    );
  }
}
