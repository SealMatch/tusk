import { db } from "@/server/db";
import { histories } from "@/server/db/schema/histories.schema";
import { desc, eq } from "drizzle-orm";
import { CreateHistoryParams } from "./history.type";

/**
 * History Repository
 * 검색 이력 데이터베이스 접근 로직
 */
export class HistoryRepository {
  /**
   * 검색 이력 생성
   */
  async create(params: CreateHistoryParams) {
    const [history] = await db
      .insert(histories)
      .values({
        id: params.id,
        recruiterWalletAddress: params.recruiterWalletAddress,
        query: params.query,
        applicantIds: params.result, // result는 applicantId[] 타입
        createdAt: params.createdAt,
      })
      .returning();

    return history;
  }

  /**
   * 특정 구인자의 검색 이력 조회
   * @param recruiterWalletAddress 구인자 지갑 주소
   * @returns 검색 이력 배열 (최신순)
   */
  async findSearchHistoriesByRecruiter(recruiterWalletAddress: string) {
    return await db
      .select()
      .from(histories)
      .where(eq(histories.recruiterWalletAddress, recruiterWalletAddress))
      .orderBy(desc(histories.createdAt));
  }
}

export const historyRepository = new HistoryRepository();
