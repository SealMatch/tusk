import { llmService } from "@/server/domains/llm/llm.service";
import { Result } from "@/server/shared/types/result.type";
import {
  ApplicantsRepository,
  applicantsRepository,
} from "./applicants.repository";
import {
  CreateApplicantParams,
  CreateApplicantResult,
  SearchApplicantsParams,
  SearchApplicantsResult,
} from "./applicants.type";

/**
 * Applicants Service
 * 비즈니스 로직 처리 (임베딩 생성, 저장 조율)
 */
class ApplicantsService {
  private readonly applicantsRepository: ApplicantsRepository;

  constructor() {
    this.applicantsRepository = applicantsRepository;
  }

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
        console.error(
          "❌ Preprocessing failed:",
          preprocessResult.errorMessage
        );
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
      const embeddingResult = await llmService.createEmbedding(
        processedSummary
      );

      if (!embeddingResult.success) {
        console.error(
          "❌ Embedding creation failed:",
          embeddingResult.errorMessage
        );
        return {
          success: false,
          errorMessage:
            embeddingResult.errorMessage || "Embedding creation failed",
        };
      }

      const embedding = embeddingResult.data!.embedding;
      console.log("✅ Embedding created. Dimensions:", embedding.length);

      // 3. DB 저장
      console.log("🔄 Saving to database...");
      const newApplicant = await this.applicantsRepository.create({
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

  /**
   * 검색어로 지원자 검색
   * 1. 검색어를 벡터로 임베딩
   * 2. pgvector로 유사도 검색
   * 3. 결과 반환
   */
  async searchApplicants(
    params: SearchApplicantsParams
  ): Promise<Result<SearchApplicantsResult>> {
    try {
      const { query, limit = 20 } = params;

      console.log("🔍 Searching applicants with query:", query);

      // 1. 검색어를 벡터로 임베딩
      console.log("🔄 Creating embedding for search query...");
      const embeddingResult = await llmService.createEmbedding(query);

      if (!embeddingResult.success) {
        console.error(
          "❌ Embedding creation failed:",
          embeddingResult.errorMessage
        );
        return {
          success: false,
          errorMessage:
            embeddingResult.errorMessage || "Failed to create embedding",
        };
      }

      const queryVector = embeddingResult.data!.embedding;
      console.log(
        "✅ Query embedding created. Dimensions:",
        queryVector.length
      );

      // 2. pgvector로 유사도 검색
      console.log("🔄 Searching by vector similarity...");
      const results = await this.applicantsRepository.searchBySimilarity(
        queryVector,
        limit
      );

      console.log("✅ Search completed. Found", results.length, "results");

      return {
        success: true,
        data: {
          results,
          total: results.length,
        },
      };
    } catch (error) {
      console.error("❌ Error in searchApplicants service:", error);

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
   * handle 중복 확인
   * @param handle 확인할 handle
   * @returns true: 이미 존재 (중복), false: 사용 가능
   */
  async handleCheck(handle: string): Promise<Result<boolean>> {
    try {
      const existingApplicant =
        await this.applicantsRepository.findByHandle(handle);

      return {
        success: true,
        data: existingApplicant !== null,
      };
    } catch (error) {
      console.error("❌ Error in handleCheck service:", error);

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
}

export const applicantsService = new ApplicantsService();
