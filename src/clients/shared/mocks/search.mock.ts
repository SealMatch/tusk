import type { ResumeResult, SearchResponse } from "@/clients/shared/types";

export const mockResumeResults: ResumeResult[] = [
  {
    blobId: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
    skills: ["React", "TypeScript", "Node.js"],
    position: "Frontend Developer",
    experienceDetail: "3년차 프론트엔드 개발자. 대규모 SPA 프로젝트 리드 경험.",
    education: "서울대학교 컴퓨터공학과",
    introduction: "사용자 경험을 최우선으로 생각하는 개발자입니다.",
    createdAt: "2024-01-15T09:00:00Z",
  },
  {
    blobId: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
    skills: ["Python", "TensorFlow", "PyTorch"],
    position: "ML Engineer",
    experienceDetail: "5년차 ML 엔지니어. 추천 시스템 및 NLP 모델 개발.",
    education: "KAIST 인공지능학과 석사",
    introduction: "데이터로 가치를 만드는 엔지니어입니다.",
    createdAt: "2024-01-14T14:30:00Z",
  },
  {
    blobId: "0x3c4d5e6f7890abcdef1234567890abcdef123456",
    skills: ["Java", "Spring", "AWS"],
    position: "Backend Developer",
    experienceDetail: "4년차 백엔드 개발자. MSA 아키텍처 설계 및 구축.",
    education: "고려대학교 소프트웨어학과",
    introduction: "안정적이고 확장 가능한 시스템을 구축합니다.",
    etc: "정보처리기사, AWS SAA 자격증 보유",
    createdAt: "2024-01-13T11:00:00Z",
  },
  {
    blobId: "0x4d5e6f7890abcdef1234567890abcdef12345678",
    skills: ["React Native", "Flutter", "Swift"],
    position: "Mobile Developer",
    experienceDetail: "2년차 모바일 개발자. iOS/Android 크로스 플랫폼 개발.",
    education: "연세대학교 컴퓨터과학과",
    introduction: "모바일 UX에 진심인 개발자입니다.",
    createdAt: "2024-01-12T16:45:00Z",
  },
  {
    blobId: "0x5e6f7890abcdef1234567890abcdef1234567890",
    skills: ["Kubernetes", "Docker", "Terraform"],
    position: "DevOps Engineer",
    experienceDetail: "6년차 DevOps 엔지니어. 대규모 클라우드 인프라 운영.",
    education: "포항공대 컴퓨터공학과",
    introduction: "자동화와 효율성을 추구합니다.",
    etc: "CKA, AWS DevOps Professional 자격증",
    createdAt: "2024-01-11T10:15:00Z",
  },
  {
    blobId: "0x6f7890abcdef1234567890abcdef12345678901a",
    skills: ["Solidity", "Rust", "Move"],
    position: "Blockchain Developer",
    experienceDetail: "3년차 블록체인 개발자. DeFi 프로토콜 및 스마트 컨트랙트 개발.",
    education: "성균관대학교 소프트웨어학과",
    introduction: "Web3의 미래를 만들어갑니다.",
    createdAt: "2024-01-10T08:30:00Z",
  },
];

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
