import { Match } from "@/server/db/schema/matches.schema";
import { Result } from "@/server/shared/types/result.type";
import {
  ApplicantsRepository,
  applicantsRepository,
} from "../applicants/applicants.repository";
import { MatchRepository, matchRepository } from "./match.repository";
import {
  CreateMatchParams,
  ProfilePageDataResponse,
  UpdateMatchStatusParams,
} from "./match.type";

/**
 * Match Service
 * 매치 비즈니스 로직 처리
 */
class MatchService {
  private readonly matchRepository: MatchRepository;
  private readonly applicantsRepository: ApplicantsRepository;

  constructor() {
    this.matchRepository = matchRepository;
    this.applicantsRepository = applicantsRepository;
  }

  /**
   * 매치 생성 (이력서 열람 요청)
   */
  async createMatch(params: CreateMatchParams): Promise<Result<Match>> {
    try {
      console.log("💌 Creating match request:", {
        recruiter: params.recruiterWalletAddress,
        applicant: params.applicantId,
      });

      // 1. Applicant 존재 확인
      const applicant = await this.applicantsRepository.findById(
        params.applicantId
      );

      if (!applicant) {
        return {
          success: false,
          errorMessage: "Applicant not found",
        };
      }

      // 2. 중복 요청 확인
      const existingMatch = await this.matchRepository.findExistingPendingMatch(
        params.recruiterWalletAddress,
        params.applicantId
      );

      if (existingMatch) {
        return {
          success: false,
          errorMessage: "Match request already exists",
        };
      }

      // 3. 매치 생성
      const match = await this.matchRepository.create({
        id: crypto.randomUUID(),
        recruiterWalletAddress: params.recruiterWalletAddress,
        applicantId: params.applicantId,
        viewRequestId: params.viewRequestId,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("✅ Match request created:", match.id);

      return {
        success: true,
        data: match,
      };
    } catch (error) {
      console.error("❌ Error creating match:", error);

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
   * 구인자가 보낸 매치 요청 조회
   */
  async getMatchesByRecruiter(
    recruiterWalletAddress: string
  ): Promise<Result<Match[]>> {
    try {
      console.log("🔍 Fetching matches for recruiter:", recruiterWalletAddress);

      const matches = await this.matchRepository.findByRecruiter(
        recruiterWalletAddress
      );

      console.log("✅ Found", matches.length, "matches");

      return {
        success: true,
        data: matches,
      };
    } catch (error) {
      console.error("❌ Error fetching matches:", error);

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
   * 구직자가 받은 매치 요청 조회
   */
  async getMatchesByApplicant(applicantId: string): Promise<Result<Match[]>> {
    try {
      console.log("🔍 Fetching matches for applicant:", applicantId);

      const matches = await this.matchRepository.findByApplicant(applicantId);

      console.log("✅ Found", matches.length, "matches");

      return {
        success: true,
        data: matches,
      };
    } catch (error) {
      console.error("❌ Error fetching matches:", error);

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
   * 매치 상태 업데이트 (구직자가 수락/거절)
   */
  async updateMatchStatus(
    params: UpdateMatchStatusParams
  ): Promise<Result<Match>> {
    try {
      console.log("🔄 Updating match status:", {
        matchId: params.matchId,
        status: params.status,
        applicant: params.applicantWalletAddress,
      });

      // 1. 매치 조회
      const match = await this.matchRepository.findById(params.matchId);

      if (!match) {
        return {
          success: false,
          errorMessage: "Match not found",
        };
      }

      // 2. 권한 확인 - 해당 applicant의 소유자인지 확인
      const applicant = await this.applicantsRepository.findById(
        match.applicantId
      );

      if (
        !applicant ||
        applicant.walletAddress !== params.applicantWalletAddress
      ) {
        return {
          success: false,
          errorMessage: "Unauthorized: You are not the owner of this applicant",
        };
      }

      // 3. 상태 업데이트
      const updatedMatch = await this.matchRepository.updateStatus(
        params.matchId,
        params.status
      );

      console.log(
        "✅ Match status updated:",
        updatedMatch.id,
        "->",
        updatedMatch.status
      );

      return {
        success: true,
        data: updatedMatch,
      };
    } catch (error) {
      console.error("❌ Error updating match status:", error);

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
   * 프로필 페이지 데이터 조회
   * walletAddress를 기준으로 요청한 매치(requestedList)와 받은 매치(receivedList)를 구분하여 반환
   */
  async getProfilePageData(
    walletAddress: string
  ): Promise<Result<ProfilePageDataResponse>> {
    try {
      console.log("🔍 Fetching profile page data for wallet:", walletAddress);

      // 1. 해당 지갑 주소의 applicant 조회
      const applicant = await this.applicantsRepository.findByWalletAddress(
        walletAddress
      );

      // 2. recruiter로서 요청한 매치 목록 조회
      const requestedMatches = await this.matchRepository.findByRecruiter(
        walletAddress
      );

      // 3. applicant로서 받은 매치 목록 조회
      const receivedMatches = applicant
        ? await this.matchRepository.findByApplicant(applicant.id)
        : [];

      // 4. requestedList 구성 (recruiter가 요청한 매치)
      const requestedApplicantIds = requestedMatches.map((m) => m.applicantId);
      const requestedApplicants = await this.applicantsRepository.findByIds(
        requestedApplicantIds
      );

      const requestedList = requestedMatches.map((match) => {
        const applicantData = requestedApplicants.find(
          (a) => a.id === match.applicantId
        );
        return {
          match,
          applicant: applicantData!,
        };
      });

      // 5. receivedList 구성 (applicant가 받은 매치)
      const receivedList = receivedMatches.map((match) => ({
        match,
        applicant: applicant!,
      }));

      console.log("✅ Profile page data fetched:", {
        requestedCount: requestedList.length,
        receivedCount: receivedList.length,
      });

      return {
        success: true,
        data: {
          userHandle: applicant?.handle ?? "",
          requestedList,
          receivedList,
        },
      };
    } catch (error) {
      console.error("❌ Error fetching profile page data:", error);

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

export const matchService = new MatchService();
