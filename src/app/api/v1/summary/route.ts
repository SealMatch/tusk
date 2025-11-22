import { llmService } from "@/server/domains/llm/llm.service";
import { parseFormData } from "@/server/shared/utils/parse-form-data";
import { NextRequest, NextResponse } from "next/server";

// Route Segment Config for body size limit
export const runtime = "nodejs";
export const maxDuration = 60; // 60 seconds timeout

export async function POST(request: NextRequest) {
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
