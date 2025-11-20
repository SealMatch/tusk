import { geminiEmbeddingModel } from "@/server/shared/libs/gemini.lib";
import type { Result } from "@/server/shared/types/result.type";
import type { EmbedResponse } from "./embed.type";

class EmbedService {
  // TODO: 요청 데이터 유효성 검사 - LLM 요약본이 들어와야함
  async createEmbedding(text: string): Promise<Result<EmbedResponse>> {
    try {
      const result = await geminiEmbeddingModel.embedContent(text);
      const embedding = result.embedding.values;

      return {
        success: true,
        data: {
          embedding,
          dimensions: embedding.length,
        },
      };
    } catch (error) {
      console.error("Gemini embedding error:", error);
      return {
        success: false,
        errorMessage:
          error instanceof Error ? error.message : "Failed to create embedding",
      };
    }
  }
}

// 싱글톤 패턴 (모듈 레벨 인스턴스)
export const embedService = new EmbedService();
