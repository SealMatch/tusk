import { historyService } from "@/server/domains/histories/history.service";
import { Result } from "@/server/shared/types/result.type";
import { NextRequest, NextResponse } from "next/server";

/**
 * @openapi
 * /api/v1/histories/{historyId}:
 *   delete:
 *     summary: 검색 이력 삭제
 *     description: 특정 검색 이력을 삭제합니다. 본인의 이력만 삭제할 수 있습니다.
 *     tags:
 *       - Histories
 *     parameters:
 *       - in: path
 *         name: historyId
 *         required: true
 *         schema:
 *           type: string
 *         description: 삭제할 검색 이력 ID
 *         example: "550e8400-e29b-41d4-a716-446655440000"
 *       - in: header
 *         name: X-Wallet-Address
 *         required: true
 *         schema:
 *           type: string
 *         description: 요청자 지갑 주소 (권한 검증용)
 *         example: "0xabcdef1234567890"
 *     responses:
 *       200:
 *         description: 검색 이력 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   properties:
 *                     id:
 *                      type: string
 *                      description: 삭제된 검색 이력 ID
 *                      example: "550e8400-e29b-41d4-a716-446655440000"
 *       400:
 *         description: 잘못된 요청 (헤더 누락)
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
 *                   example: "X-Wallet-Address header is required"
 *       403:
 *         description: 권한 없음 (본인의 이력이 아님)
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
 *                   example: "Unauthorized: You can only delete your own history"
 *       404:
 *         description: 이력을 찾을 수 없음
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
 *                   example: "History not found"
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { historyId: string } }
): Promise<NextResponse<Result<{ deletedHistoryId: string }>>> {
  try {
    // 1. Extract path parameter
    const { historyId } = params;

    // 2. Extract wallet address from header
    const recruiterWalletAddress = request.headers.get("X-Wallet-Address");

    // 3. Validation
    if (!recruiterWalletAddress) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "X-Wallet-Address header is required",
        },
        { status: 400 }
      );
    }

    // 4. Delete history (with authorization check)
    const result = await historyService.deleteHistory(
      historyId,
      recruiterWalletAddress
    );

    if (!result.success) {
      // Determine appropriate status code
      const status = result.errorMessage?.includes("Unauthorized")
        ? 403
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

    // 5. Return deleted history
    return NextResponse.json(
      {
        success: true,
        data: { deletedHistoryId: historyId },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error in DELETE /api/v1/histories/[historyId]:", error);

    return NextResponse.json(
      {
        success: false,
        errorMessage: "Internal server error",
      },
      { status: 500 }
    );
  }
}
