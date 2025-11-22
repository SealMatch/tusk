import {
  geminiEmbeddingModel,
  geminiSummaryModel,
} from "@/server/shared/libs/gemini.lib";
import { Result } from "@/server/shared/types/result.type";
import { GenerativeModel } from "@google/generative-ai";
import { EmbedResponse, SummaryResponse } from "./llm.type";

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
      const prompt = `
You are a resume analysis expert. Analyze the provided PDF resume and extract the following information in JSON format.

**IMPORTANT: Respond in the SAME LANGUAGE as the resume's PRIMARY LANGUAGE.**
- If the resume is in Korean, respond in Korean.
- If the resume is in English, respond in English.
- If the resume is in Japanese, respond in Japanese.
- Maintain the language consistency throughout all fields.

**Required Output Format (JSON only):**
{
  "position": "Primary job position (e.g., Backend Developer, Frontend Engineer, Full-stack Developer, DevOps Engineer, etc.)",
  "techStack": ["JavaScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS", ...],
  "careerDetail": "Career summary (Summarize key career experiences and projects in 10-15 sentences)"
}

**Analysis Guidelines:**
1. position: Select ONE most prominent job role or target position from the resume
2. techStack: Extract ALL technical skills including:
   - Programming languages (e.g., JavaScript, Python, Java, Go, TypeScript, C++)
   - Frameworks & Libraries (e.g., React, Vue, Spring Boot, Django, Express)
   - Databases (e.g., PostgreSQL, MySQL, MongoDB, Redis)
   - DevOps & Cloud tools (e.g., Docker, Kubernetes, AWS, GCP, Azure, Jenkins)
   - Development tools (e.g., Git, Jira, Figma)
   - Maximum 10 most relevant items
3. careerDetail: Concisely summarize core career highlights in 3-5 sentences

**Important Notes:**
- MUST respond ONLY in valid JSON format
- Return pure JSON without any comments or explanations
- Use empty string ("") or empty array ([]) if information is unclear
- The language of all text fields (position, techStack, careerDetail) MUST match the resume's primary language
- For techStack, use standard technology names (keep English names for technologies even if resume is in another language)
`;

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
   * @param llmSummary - LLM 요약본
   * @returns EmbedResponse
   */

  async createEmbedding(llmSummary: string): Promise<Result<EmbedResponse>> {
    try {
      const result = await this.embeddingModel.embedContent(llmSummary);
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

export const llmService = new LLMService();
