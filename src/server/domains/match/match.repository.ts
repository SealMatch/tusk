import { db } from "@/server/db";
import { matches } from "@/server/db/schema/matches.schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { CreateMatchData, MatchStatus } from "./match.type";

/**
 * Match Repository
 * 매치 데이터베이스 접근 로직
 */
export class MatchRepository {
  /**
   * 매치 생성
   */
  async create(data: CreateMatchData) {
    const [match] = await db
      .insert(matches)
      .values({
        id: data.id,
        recruiterWalletAddress: data.recruiterWalletAddress,
        applicantId: data.applicantId,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .returning();

    return match;
  }

  /**
   * 중복 요청 확인
   * - 같은 recruiter가 같은 applicant에게 pending 상태로 요청한 적 있는지 확인
   */
  async findExistingPendingMatch(
    recruiterWalletAddress: string,
    applicantId: string
  ) {
    const [existingMatch] = await db
      .select()
      .from(matches)
      .where(
        and(
          eq(matches.recruiterWalletAddress, recruiterWalletAddress),
          eq(matches.applicantId, applicantId),
          eq(matches.status, "pending")
        )
      )
      .limit(1);

    return existingMatch || null;
  }

  /**
   * ID로 매치 조회
   */
  async findById(id: string) {
    const [match] = await db
      .select()
      .from(matches)
      .where(eq(matches.id, id))
      .limit(1);

    return match || null;
  }

  /**
   * 구인자가 보낸 매치 요청 조회
   */
  async findByRecruiter(recruiterWalletAddress: string) {
    return await db
      .select()
      .from(matches)
      .where(eq(matches.recruiterWalletAddress, recruiterWalletAddress))
      .orderBy(desc(matches.createdAt));
  }

  /**
   * 구직자가 받은 매치 요청 조회
   */
  async findByApplicant(applicantId: string) {
    return await db
      .select()
      .from(matches)
      .where(eq(matches.applicantId, applicantId))
      .orderBy(desc(matches.createdAt));
  }

  /**
   * 특정 구인자가 여러 구직자에게 보낸 매치 요청 조회
   * @param recruiterWalletAddress 구인자 지갑 주소
   * @param applicantIds 구직자 ID 배열
   * @returns 매치 배열
   */
  async findByRecruiterAndApplicantIds(
    recruiterWalletAddress: string,
    applicantIds: string[]
  ) {
    if (applicantIds.length === 0) {
      return [];
    }

    return await db
      .select()
      .from(matches)
      .where(
        and(
          eq(matches.recruiterWalletAddress, recruiterWalletAddress),
          inArray(matches.applicantId, applicantIds)
        )
      );
  }

  /**
   * 매치 상태 업데이트
   */
  async updateStatus(id: string, status: MatchStatus) {
    const [updatedMatch] = await db
      .update(matches)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(matches.id, id))
      .returning();

    return updatedMatch;
  }
}

export const matchRepository = new MatchRepository();
