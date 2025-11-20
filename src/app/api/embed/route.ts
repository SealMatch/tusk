import { embedService } from "@/server/domains/embed/embed.service";
import {
  EmbedResponse,
  embedRequestSchema,
} from "@/server/domains/embed/embed.type";
import { Result } from "@/server/shared/types/result.type";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export async function POST(
  request: NextRequest
): Promise<NextResponse<Result<EmbedResponse>>> {
  try {
    // 1. Request body 파싱
    const body = await request.json();

    // 2. Validation
    const validatedData = embedRequestSchema.parse(body);

    // 3. Service 호출
    const result = await embedService.createEmbedding(validatedData.text);

    // 4. Result 처리
    if (!result.success) {
      return NextResponse.json(
        { success: false, errorMessage: result.errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.data },
      { status: 200 }
    );
  } catch (error) {
    // Zod validation 에러
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errorMessage: "Invalid request data" },
        { status: 400 }
      );
    }

    // 기타 에러
    console.error("Embed API error:", error);
    return NextResponse.json(
      { success: false, errorMessage: "Internal server error" },
      { status: 500 }
    );
  }
}
