import {
  geminiEmbeddingModel,
  geminiSummaryModel,
} from "@/server/shared/libs/gemini.lib";
import { Result } from "@/server/shared/types/result.type";
import { GenerativeModel } from "@google/generative-ai";
import {
  ANALYZE_PDF_PROMPT,
  PREPROCESS_FOR_EMBEDDING_PROMPT,
} from "./llm.promts";
import {
  EmbedResponse,
  PreProcessEmbeddingParams,
  PreProcessEmbeddingResponse,
  SummaryResponse,
} from "./llm.type";

class LLMService {
  private readonly embeddingModel: GenerativeModel;
  private readonly summaryModel: GenerativeModel;

  constructor() {
    this.embeddingModel = geminiEmbeddingModel;
    this.summaryModel = geminiSummaryModel;
  }

  /**
   * @param pdfBase64 - PDF 이력서 Base64
   * @param mimeType - PDF 이력서 MIME Type
   * @returns SummaryResponse
   */
  async analyzePdfResume(
    pdfBuffer: Buffer,
    mimeType: string = "application/pdf"
  ): Promise<Result<SummaryResponse>> {
    try {
      const prompt = ANALYZE_PDF_PROMPT;

      // Buffer를 Base64로 변환
      const pdfBase64 = pdfBuffer.toString("base64");

      const result = await this.summaryModel.generateContent([
        {
          inlineData: {
            data: pdfBase64,
            mimeType: mimeType,
          },
        },
        prompt,
      ]);

      const response = result.response;
      const text = response.text();

      // JSON 파싱 (코드 블록 제거)
      let jsonText = text.trim();

      // ```json ... ``` 형태의 코드 블록 제거
      if (jsonText.startsWith("```")) {
        jsonText = jsonText
          .replace(/^```(?:json)?\s*\n?/, "")
          .replace(/\n?```\s*$/, "");
      }

      jsonText = jsonText.trim();

      const parsed = JSON.parse(jsonText) as SummaryResponse;

      // 유효성 검증
      if (!parsed.position || !Array.isArray(parsed.techStack)) {
        throw new Error("Invalid response format from Gemini");
      }

      return {
        success: true,
        data: {
          position: parsed.position,
          techStack: parsed.techStack,
          careerDetail: parsed.careerDetail || "",
        },
      };
    } catch (error) {
      console.error("Gemini PDF analysis error:", error);
      return {
        success: false,
        errorMessage:
          error instanceof Error
            ? error.message
            : "Failed to analyze PDF resume",
      };
    }
  }

  /**
   * @param processedSummary - 처리된 LLM 요약본
   * @returns EmbedResponse
   */
  async createEmbedding(
    processedSummary: string
  ): Promise<Result<EmbedResponse>> {
    try {
      const result = await this.embeddingModel.embedContent(processedSummary);
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

  /**
   * 임베딩을 위한 텍스트 전처리 (LLM 사용)
   * summaryModel을 사용하여 지능적으로 키워드 추출 및 영어 변환
   *
   * @param position - 직무/포지션
   * @param techStack - 기술 스택 배열
   * @param aiSummary - AI 생성 요약
   * @returns 임베딩용 최적화된 텍스트
   */
  async preprocessForEmbedding({
    position,
    techStack,
    aiSummary,
  }: PreProcessEmbeddingParams): Promise<Result<PreProcessEmbeddingResponse>> {
    try {
      const inputData = JSON.stringify(
        {
          position,
          techStack,
          aiSummary,
        },
        null,
        2
      );

      const prompt = `${PREPROCESS_FOR_EMBEDDING_PROMPT}

**Input Data:**
${inputData}

**Generate the optimized embedding text now:**`;

      const result = await this.summaryModel.generateContent(prompt);
      const optimizedText = result.response.text().trim();

      return {
        success: true,
        data: {
          processedSummary: optimizedText,
        },
      };
    } catch (error) {
      console.error("Preprocessing for embedding error:", error);
      return {
        success: false,
        errorMessage:
          error instanceof Error
            ? error.message
            : "Failed to preprocess for embedding",
      };
    }
  }
}

export const llmService = new LLMService();
