import { db } from "@/server/db";
import { applicants } from "@/server/db/schema/applicants.schema";
import { eq, inArray, sql } from "drizzle-orm";
import { CreateApplicantData, CreateApplicantResult, SearchResultItem } from "./applicants.type";

/**
 * Applicants Repository
 * 데이터베이스 접근 로직을 캡슐화
 */
export class ApplicantsRepository {
  /**
   * 지원자 생성
   */
  async create(data: CreateApplicantData): Promise<CreateApplicantResult> {
    const [newApplicant] = await db
      .insert(applicants)
      .values({
        handle: data.handle,
        walletAddress: data.walletAddress,
        position: data.position,
        techStack: data.techStack,
        aiSummary: data.aiSummary,
        blobId: data.blobId || "",
        sealPolicyId: data.sealPolicyId || "",
        encryptionId: data.encryptionId || "",
        accessPrice: data.accessPrice || 0,
        isJobSeeking: data.isJobSeeking ?? true,
        embedding: data.embedding,
      })
      .returning({ id: applicants.id });

    return newApplicant;
  }

  /**
   * 지갑 주소로 지원자 조회
   */
  async findByWalletAddress(walletAddress: string) {
    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.walletAddress, walletAddress))
      .limit(1);

    return applicant || null;
  }

  /**
   * ID로 지원자 조회
   */
  async findById(id: string) {
    const [applicant] = await db
      .select()
      .from(applicants)
      .where(eq(applicants.id, id))
      .limit(1);

    return applicant || null;
  }

  /**
   * 여러 ID로 지원자 조회
   * @param ids 지원자 ID 배열
   * @returns 지원자 배열
   */
  async findByIds(ids: string[]) {
    if (ids.length === 0) {
      return [];
    }

    const results = await db
      .select()
      .from(applicants)
      .where(inArray(applicants.id, ids));

    return results;
  }

  /**
   * 벡터 유사도 검색
   * pgvector의 cosine distance 연산자(<=>)를 사용하여 유사도 검색
   * @param queryVector 검색 쿼리 벡터 (768차원)
   * @param limit 결과 개수 제한 (기본값: 20)
   */
  async searchBySimilarity(
    queryVector: number[],
    limit: number = 20
  ): Promise<SearchResultItem[]> {
    const vectorString = JSON.stringify(queryVector);

    // pgvector 유사도 검색 쿼리
    // 1 - (embedding <=> query) = similarity (0~1, 높을수록 유사)
    const results = await db.execute(sql`
      SELECT
        id,
        handle,
        position,
        tech_stack as "techStack",
        ai_summary as "aiSummary",
        blob_id as "blobId",
        seal_policy_id as "sealPolicyId",
        encryption_id as "encryptionId",
        access_price as "accessPrice",
        created_at as "createdAt",
        1 - (embedding <=> ${vectorString}::vector) as similarity
      FROM applicants
      WHERE is_job_seeking = true
      ORDER BY embedding <=> ${vectorString}::vector
      LIMIT ${limit}
    `);

    return results as unknown as SearchResultItem[];
  }
}

export const applicantsRepository = new ApplicantsRepository();
