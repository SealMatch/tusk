import { llmService } from "@/server/domains/llm/llm.service";
import { SummaryResponse } from "@/server/domains/llm/llm.type";
import { Result } from "@/server/shared/types/result.type";
import { parseFormData } from "@/server/shared/utils/parse-form-data";
import { NextRequest, NextResponse } from "next/server";

// Route Segment Config for body size limit
export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds timeout

/**
 * @openapi
 * /api/v1/summary:
 *   post:
 *     summary: PDF 이력서 분석
 *     description: PDF 형식의 이력서를 분석하여 구조화된 정보를 추출합니다.
 *     tags:
 *       - Summary
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - pdf
 *             properties:
 *               pdf:
 *                 type: string
 *                 format: binary
 *                 description: PDF 이력서 파일
 *     responses:
 *       200:
 *         description: PDF 분석 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PdfAnalysisResult'
 *       400:
 *         description: 잘못된 요청 (PDF 파일 누락 또는 분석 실패)
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
 *                   example: "PDF file is required"
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
): Promise<NextResponse<Result<SummaryResponse>>> {
  try {
    const { files } = await parseFormData(request);

    const pdfFile = files.find((file) => file.fieldname === "pdf");

    if (!pdfFile) {
      return NextResponse.json(
        { success: false, errorMessage: "PDF file is required" },
        { status: 400 }
      );
    }

    // LLM Service 호출
    const result = await llmService.analyzePdfResume(
      pdfFile.buffer,
      pdfFile.mimetype || "application/pdf"
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, errorMessage: result.errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Summary API error:", error);
    return NextResponse.json(
      { success: false, errorMessage: "Internal server error" },
      { status: 500 }
    );
  }
}
