import { History } from "@/server/db/schema/histories.schema";
import { Result } from "@/server/shared/types/result.type";
import { HistoryRepository, historyRepository } from "./history.repository";

import { applicantsRepository } from "../applicants/applicants.repository";
import { matchRepository } from "../match/match.repository";
import { SearchResultCard, SearchResultItem } from "./history.type";

/**
 * 검색 이력 생성 파라미터
 */
export interface CreateSearchHistoryParams {
  recruiterWalletAddress: string;
  query: string;
  results: SearchResultItem[];
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
        resultCount: params.results.length,
      });

      const history = await this.historyRepository.create({
        id: crypto.randomUUID(),
        recruiterWalletAddress: params.recruiterWalletAddress,
        query: params.query,
        result: params.results,
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

      const histories =
        await this.historyRepository.findSearchHistoriesByRecruiter(
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

  /**
   * 검색 결과를 SearchResultCard로 변환
   * - match가 존재하는 항목만 반환
   */
  async getSearchResultCards(
    recruiterWalletAddress: string,
    results: SearchResultItem[]
  ): Promise<Result<SearchResultCard[]>> {
    try {
      console.log("🔍 Fetching search result cards:", {
        recruiter: recruiterWalletAddress,
        resultCount: results.length,
      });

      // 1. Extract applicant IDs
      const applicantIds = results.map((item) => item.applicantId);

      if (applicantIds.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      // 2. Parallel queries
      const [applicantsArray, matchesArray] = await Promise.all([
        applicantsRepository.findByIds(applicantIds),
        matchRepository.findByRecruiterAndApplicantIds(
          recruiterWalletAddress,
          applicantIds
        ),
      ]);

      // 3. Create maps for quick lookup
      const applicantsMap = new Map(
        applicantsArray.map((applicant) => [applicant.id, applicant])
      );
      const matchesMap = new Map(
        matchesArray.map((match) => [match.applicantId, match])
      );

      // 4. Filter & Combine (match가 존재하는 항목만)
      const resultCards: SearchResultCard[] = results
        .filter((item) => matchesMap.has(item.applicantId))
        .filter((item) => applicantsMap.has(item.applicantId))
        .map((item) => ({
          applicant: applicantsMap.get(item.applicantId)!,
          match: matchesMap.get(item.applicantId)!,
          similarity: item.similarity,
          createdAt: item.createdAt,
        }));

      console.log("✅ Result cards created:", resultCards.length);

      return {
        success: true,
        data: resultCards,
      };
    } catch (error) {
      console.error("❌ Error creating result cards:", error);

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
