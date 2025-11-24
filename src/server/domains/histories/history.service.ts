import { History } from "@/server/db/schema/histories.schema";
import { Result } from "@/server/shared/types/result.type";
import { HistoryRepository, historyRepository } from "./history.repository";

import { applicantsRepository } from "../applicants/applicants.repository";
import { PublicApplicant } from "../applicants/applicants.type";
import { matchRepository } from "../match/match.repository";
import { SearchResultCard, SearchResultItem } from "./history.type";

/**
 * 검색 이력 생성 파라미터
 */
export interface CreateSearchHistoryParams {
  recruiterWalletAddress: string;
  query: string;
  results: SearchResultItem[];
  historyId?: string; // Optional unique ID to prevent duplicates
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
      const historyId = params.historyId || crypto.randomUUID();

      console.log("💾 Creating search history:", {
        recruiter: params.recruiterWalletAddress,
        query: params.query,
        resultCount: params.results.length,
        historyId,
      });

      // Check if history with this ID already exists (prevent duplicates)
      if (params.historyId) {
        const existingHistory = await this.historyRepository.findById(
          params.historyId
        );

        if (existingHistory) {
          console.log("⚠️ History already exists, skipping:", historyId);
          return {
            success: true,
            data: existingHistory,
          };
        }
      }

      const history = await this.historyRepository.create({
        id: historyId,
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
   * ID로 검색 이력 조회
   */
  async getHistoryById(historyId: string): Promise<Result<History>> {
    try {
      const history = await this.historyRepository.findById(historyId);

      if (!history) {
        return {
          success: false,
          errorMessage: "History not found",
        };
      }

      return {
        success: true,
        data: history,
      };
    } catch (error) {
      console.error("❌ Error fetching search history:", error);

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
   * - match는 있으면 포함, 없으면 null
   */
  async getSearchResultCards(
    recruiterWalletAddress: string,
    results: SearchResultItem[]
  ): Promise<Result<SearchResultCard[]>> {
    try {
      // 1. Extract applicant IDs
      const applicantIds = results.map((item) => item.applicantId);

      if (applicantIds.length === 0) {
        return {
          success: true,
          data: [],
        };
      }

      // 2. Fetch matches (always needed for dynamic status)
      const matchesArray = await matchRepository.findByRecruiterAndApplicantIds(
        recruiterWalletAddress,
        applicantIds
      );

      const matchesMap = new Map(
        matchesArray.map((match) => [match.applicantId, match])
      );

      // 3. Construct result cards
      // Strategy: Fetch from DB first (to ensure we get existing data).
      // If not found in DB, fall back to snapshot (for deleted applicants).

      // Fetch all applicants from DB
      const fetchedApplicants = await applicantsRepository.findByIds(
        applicantIds
      );
      const applicantsMap = new Map(fetchedApplicants.map((a) => [a.id, a]));

      const resultCards: SearchResultCard[] = results
        .map((item) => {
          let publicApplicant: PublicApplicant | null = null;

          // 1. Try DB
          const dbApplicant = applicantsMap.get(item.applicantId);
          if (dbApplicant) {
            const { embedding, ...rest } = dbApplicant;
            publicApplicant = rest;
          }
          // 2. Fallback to snapshot
          else if (item.snapshot) {
            publicApplicant = item.snapshot;
          }

          if (!publicApplicant) return null;

          return {
            applicant: publicApplicant,
            match: matchesMap.get(item.applicantId) ?? null,
            similarity: item.similarity,
            createdAt: item.createdAt,
          };
        })
        .filter((card): card is SearchResultCard => card !== null);

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

  /**
   * 검색 이력 삭제 (권한 검증 포함)
   * @param historyId 검색 이력 ID
   * @param recruiterWalletAddress 요청자 지갑 주소 (권한 검증용)
   */
  async deleteHistory(
    historyId: string,
    recruiterWalletAddress: string
  ): Promise<Result<History>> {
    try {
      console.log("🗑️ Deleting search history:", {
        historyId,
        recruiter: recruiterWalletAddress,
      });

      // 1. 이력 조회
      const history = await this.historyRepository.findById(historyId);

      if (!history) {
        console.log("❌ History not found:", historyId);
        return {
          success: false,
          errorMessage: "History not found",
        };
      }

      // 2. 권한 검증: 요청자가 이력 소유자인지 확인
      if (history.recruiterWalletAddress !== recruiterWalletAddress) {
        console.log("❌ Unauthorized: recruiter address mismatch");
        return {
          success: false,
          errorMessage: "Unauthorized: You can only delete your own history",
        };
      }

      // 3. 삭제 실행
      const deletedHistory = await this.historyRepository.delete(historyId);

      console.log("✅ Search history deleted:", historyId);

      return {
        success: true,
        data: deletedHistory,
      };
    } catch (error) {
      console.error("❌ Error deleting search history:", error);

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
