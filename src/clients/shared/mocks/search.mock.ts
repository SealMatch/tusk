import type { ResumeResult, SearchResponse } from "@/clients/shared/types";
import { mockResumeDetails } from "./resume.mock";

// resume.mock.ts의 데이터를 기반으로 검색용 결과 생성
const mockResumeResults: ResumeResult[] = Object.values(mockResumeDetails).map(
  ({ ownerAddress, ...rest }) => rest
);

// 자연어에서 키워드 추출
const extractKeywords = (query: string): string[] => {
  // 불용어 (검색에서 제외할 단어)
  const stopWords = [
    "있는", "있으면", "좋겠습니다", "찾고", "필요해요", "개발자를", "개발자가",
    "이상", "정도", "경험이", "경험", "그리고", "또는", "및", "등", "를", "을",
    "이", "가", "은", "는", "의", "에", "로", "와", "과", "년차", "년", "차",
    "합니다", "입니다", "해요", "하는", "된", "할", "수", "있는", "싶어요",
  ];

  // 쿼리를 소문자로 변환하고 특수문자 제거 후 단어 분리
  const words = query
    .toLowerCase()
    .replace(/[.,!?;:'"()]/g, "")
    .split(/\s+/)
    .filter((word) => word.length >= 2) // 2글자 이상
    .filter((word) => !stopWords.includes(word)) // 불용어 제외
    .filter((word) => !/^\d+$/.test(word)); // 숫자만 있는 것 제외

  return [...new Set(words)]; // 중복 제거
};

export const getMockSearchResponse = (query: string): SearchResponse => {
  const keywords = extractKeywords(query);

  // 키워드가 없으면 빈 결과 반환
  if (keywords.length === 0) {
    return {
      results: [],
      total: 0,
    };
  }

  // 각 결과에 대해 매칭 점수 계산
  const scoredResults = mockResumeResults.map((result) => {
    let score = 0;
    const searchableText = [
      ...result.skills.map((s) => s.toLowerCase()),
      result.position.toLowerCase(),
      result.experienceDetail.toLowerCase(),
      result.education.toLowerCase(),
      result.introduction.toLowerCase(),
    ].join(" ");

    // 각 키워드에 대해 점수 부여
    keywords.forEach((keyword) => {
      if (searchableText.includes(keyword)) {
        score += 1;
      }
      // 기술 스택에 정확히 일치하면 추가 점수
      if (result.skills.some((skill) => skill.toLowerCase() === keyword)) {
        score += 2;
      }
      // 직무에 포함되면 추가 점수
      if (result.position.toLowerCase().includes(keyword)) {
        score += 2;
      }
    });

    return { result, score };
  });

  // 점수가 0보다 큰 결과만 필터링하고 점수순으로 정렬
  const filtered = scoredResults
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ result }) => result);

  return {
    results: filtered,
    total: filtered.length,
  };
};
