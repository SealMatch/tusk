import { db } from "@/server/db";
import { applicants } from "@/server/db/schema/applicants.schema";
import { eq } from "drizzle-orm";
import { CreateApplicantData, CreateApplicantResult } from "./applicants.type";

/**
 * Applicants Repository
 * 데이터베이스 접근 로직을 캡슐화
 */
class ApplicantsRepository {
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
}

export const applicantsRepository = new ApplicantsRepository();
