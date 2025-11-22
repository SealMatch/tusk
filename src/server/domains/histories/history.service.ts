import { History } from "@/server/db/schema/histories.schema";
import { Result } from "@/server/shared/types/result.type";
import {
  HistoryRepository,
  historyRepository,
} from "./history.repository";

/**
 * 검색 이력 생성 파라미터
 */
export interface CreateSearchHistoryParams {
  recruiterWalletAddress: string;
  query: string;
  applicantIds: string[];
}

/**
 * History Service
 * 검색 이력 비즈니스 로직 처리
 */
class HistoryService {
  private readonly historyRepository: HistoryRepository;

  constructor() {
    this.historyRepository = historyRepository;
  }

  /**
   * 검색 이력 생성
   */
  async createSearchHistory(
    params: CreateSearchHistoryParams
  ): Promise<Result<History>> {
    try {
      console.log("💾 Creating search history:", {
        recruiter: params.recruiterWalletAddress,
        query: params.query,
        resultCount: params.applicantIds.length,
      });

      const history = await this.historyRepository.create({
        id: crypto.randomUUID(),
        recruiterWalletAddress: params.recruiterWalletAddress,
        query: params.query,
        result: params.applicantIds,
        createdAt: new Date(),
      });

      console.log("✅ Search history created:", history.id);

      return {
        success: true,
        data: history,
      };
    } catch (error) {
      console.error("❌ Error creating search history:", error);

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
   * 특정 구인자의 검색 이력 조회
   */
  async getSearchHistoriesByRecruiter(
    recruiterWalletAddress: string
  ): Promise<Result<History[]>> {
    try {
      console.log(
        "🔍 Fetching search histories for recruiter:",
        recruiterWalletAddress
      );

      const histories = await this.historyRepository.findSearchHistoriesByRecruiter(
        recruiterWalletAddress
      );

      console.log("✅ Found", histories.length, "search histories");

      return {
        success: true,
        data: histories,
      };
    } catch (error) {
      console.error("❌ Error fetching search histories:", error);

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

export const historyService = new HistoryService();
