import { llmService } from "@/server/domains/llm/llm.service";
import { Result } from "@/server/shared/types/result.type";
import { applicantsRepository } from "./applicants.repository";
import { CreateApplicantParams, CreateApplicantResult } from "./applicants.type";

/**
 * Applicants Service
 * 비즈니스 로직 처리 (임베딩 생성, 저장 조율)
 */
class ApplicantsService {
  /**
   * 지원자 등록
   * 1. 임베딩 전처리
   * 2. 벡터 임베딩 생성
   * 3. DB 저장
   */
  async createApplicant(
    params: CreateApplicantParams
  ): Promise<Result<CreateApplicantResult>> {
    try {
      console.log("✅ Creating applicant:", {
        handle: params.handle,
        position: params.position,
        techStackCount: params.techStack.length,
      });

      // 1. 임베딩 전처리
      console.log("🔄 Preprocessing for embedding...");
      const preprocessResult = await llmService.preprocessForEmbedding({
        position: params.position,
        techStack: params.techStack,
        aiSummary: params.aiSummary,
      });

      if (!preprocessResult.success) {
        console.error("❌ Preprocessing failed:", preprocessResult.errorMessage);
        return {
          success: false,
          errorMessage: preprocessResult.errorMessage || "Preprocessing failed",
        };
      }

      const processedSummary = preprocessResult.data!.processedSummary;
      console.log(
        "✅ Preprocessing completed. Summary length:",
        processedSummary.length
      );

      // 2. 벡터 임베딩 생성
      console.log("🔄 Creating embedding vector...");
      const embeddingResult = await llmService.createEmbedding(processedSummary);

      if (!embeddingResult.success) {
        console.error(
          "❌ Embedding creation failed:",
          embeddingResult.errorMessage
        );
        return {
          success: false,
          errorMessage: embeddingResult.errorMessage || "Embedding creation failed",
        };
      }

      const embedding = embeddingResult.data!.embedding;
      console.log("✅ Embedding created. Dimensions:", embedding.length);

      // 3. DB 저장
      console.log("🔄 Saving to database...");
      const newApplicant = await applicantsRepository.create({
        ...params,
        embedding,
      });

      console.log("✅ Applicant created successfully:", newApplicant.id);

      return {
        success: true,
        data: newApplicant,
      };
    } catch (error) {
      console.error("❌ Error in createApplicant service:", error);

      if (error instanceof Error) {
        return {
          success: false,
          errorMessage: error.message,
        };
      }

      return {
        success: false,
        errorMessage: "Unknown error occurred",
      };
    }
  }

  /**
   * 지갑 주소로 지원자 조회
   */
  async getApplicantByWalletAddress(walletAddress: string) {
    return applicantsRepository.findByWalletAddress(walletAddress);
  }

  /**
   * ID로 지원자 조회
   */
  async getApplicantById(id: string) {
    return applicantsRepository.findById(id);
  }
}

export const applicantsService = new ApplicantsService();
