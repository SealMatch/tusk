import { Match } from "@/server/db/schema/matches.schema";
import { matchService } from "@/server/domains/match/match.service";
import { ProfilePageDataResponse } from "@/server/domains/match/match.type";
import { Result } from "@/server/shared/types/result.type";
import { NextRequest, NextResponse } from "next/server";

/**
 * @openapi
 * /api/v1/match:
 *   get:
 *     summary: walletAddress로 프로필 페이지 데이터 조회
 *     description: 지갑 주소를 기준으로 요청한 매치(requestedList)와 받은 매치(receivedList)를 조회합니다.
 *     tags:
 *       - Match
 *     parameters:
 *       - in: query
 *         name: walletAddress
 *         required: true
 *         schema:
 *           type: string
 *         description: 지갑 주소
 *         example: "0xabcdef1234567890"
 *     responses:
 *       200:
 *         description: 프로필 페이지 데이터 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     requestedList:
 *                       type: array
 *                       description: recruiter로서 요청한 매치 목록
 *                       items:
 *                         type: object
 *                         properties:
 *                           match:
 *                             $ref: '#/components/schemas/Match'
 *                           applicant:
 *                             $ref: '#/components/schemas/Applicant'
 *                     receivedList:
 *                       type: array
 *                       description: applicant로서 받은 매치 목록
 *                       items:
 *                         type: object
 *                         properties:
 *                           match:
 *                             $ref: '#/components/schemas/Match'
 *                           applicant:
 *                             $ref: '#/components/schemas/Applicant'
 *       400:
 *         description: 필수 파라미터 누락
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errorMessage:
 *                   type: string
 *                   example: "walletAddress is required"
 *       500:
 *         description: 내부 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errorMessage:
 *                   type: string
 *                   example: "Internal server error"
 */
export async function GET(
  request: NextRequest
): Promise<NextResponse<Result<ProfilePageDataResponse>>> {
  try {
    // 1. Parse query parameters
    const params = request.nextUrl.searchParams;
    const walletAddress = params.get("walletAddress");

    // 2. Validation
    if (!walletAddress) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "walletAddress is required",
        },
        { status: 400 }
      );
    }

    // 3. Get profile page data
    const result = await matchService.getProfilePageData(walletAddress);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: result.errorMessage,
        },
        { status: 500 }
      );
    }

    // 4. Return data
    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in GET /api/v1/match:", error);

    return NextResponse.json(
      {
        success: false,
        errorMessage: "Internal server error",
      },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/v1/match:
 *   post:
 *     summary: 리크루터가 지원자에게 이력서 열람 요청 버튼을 누를때 매칭정보 테이블이 생성됩니다
 *     description: 채용자가 지원자에게 매칭 요청을 생성합니다.
 *     tags:
 *       - Match
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recruiterWalletAddress
 *               - applicantId
 *             properties:
 *               recruiterWalletAddress:
 *                 type: string
 *                 description: 채용자 지갑 주소
 *                 example: "0xabcdef1234567890"
 *               applicantId:
 *                 type: string
 *                 description: 지원자 ID
 *                 example: "applicant_123"
 *     responses:
 *       201:
 *         description: 매칭이 성공적으로 생성됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         description: 필수 파라미터 누락
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errorMessage:
 *                   type: string
 *                   example: "recruiterWalletAddress and applicantId are required"
 *       404:
 *         description: 지원자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errorMessage:
 *                   type: string
 *                   example: "Applicant not found"
 *       409:
 *         description: 이미 매칭이 존재함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errorMessage:
 *                   type: string
 *                   example: "Match already exists"
 *       500:
 *         description: 내부 서버 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 errorMessage:
 *                   type: string
 *                   example: "Internal server error"
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<Result<Match>>> {
  try {
    // 1. Parse request body
    const body = await request.json();
    const { recruiterWalletAddress, applicantId, viewRequestId } = body;

    // 2. Validation
    if (!recruiterWalletAddress || !applicantId || !viewRequestId) {
      return NextResponse.json(
        {
          success: false,
          errorMessage:
            "recruiterWalletAddress, applicantId, and viewRequestId are required",
        },
        { status: 400 }
      );
    }

    const existingMatch = await matchService.findExistingMatch(
      recruiterWalletAddress,
      applicantId
    );

    if (existingMatch) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: "Match already exists",
        },
        { status: 409 }
      );
    }
    // 3. Create match
    const result = await matchService.createMatch({
      recruiterWalletAddress,
      applicantId,
      viewRequestId,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errorMessage: result.errorMessage,
        },
        { status: 500 }
      );
    }

    // 4. Return created match
    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("L Error in POST /api/v1/match:", error);

    return NextResponse.json(
      {
        success: false,
        errorMessage: "Internal server error",
      },
      { status: 500 }
    );
  }
}
