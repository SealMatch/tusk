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
        results: params.result,
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

  /**
   * ID로 검색 이력 조회
   * @param historyId 검색 이력 ID
   * @returns 검색 이력 또는 undefined
   */
  async findById(historyId: string) {
    const [history] = await db
      .select()
      .from(histories)
      .where(eq(histories.id, historyId))
      .limit(1);

    return history;
  }

  /**
   * 검색 이력 삭제
   * @param historyId 검색 이력 ID
   * @returns 삭제된 검색 이력
   */
  async delete(historyId: string) {
    const [deletedHistory] = await db
      .delete(histories)
      .where(eq(histories.id, historyId))
      .returning();

    return deletedHistory;
  }
}

export const historyRepository = new HistoryRepository();
