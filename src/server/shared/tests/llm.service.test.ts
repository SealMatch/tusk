import { geminiSummaryModel } from "@/server/shared/libs/gemini.lib";
import { llmService } from "../../domains/llm/llm.service";
import { PreProcessEmbeddingParams } from "../../domains/llm/llm.type";

// Mock Gemini library
jest.mock("@/server/shared/libs/gemini.lib", () => ({
  geminiEmbeddingModel: {},
  geminiSummaryModel: {
    generateContent: jest.fn(),
  },
}));

describe("LLMService - preprocessForEmbedding", () => {
  const mockGenerateContent = geminiSummaryModel.generateContent as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("성공 케이스", () => {
    it("정상적인 한글 입력으로 처리된 텍스트를 반환해야 한다", async () => {
      // Given
      const params: PreProcessEmbeddingParams = {
        position: "백엔드 개발자",
        techStack: ["NestJS", "TypeScript", "PostgreSQL"],
        aiSummary:
          "3년 경력의 백엔드 개발자로 NestJS를 활용한 API 개발 경험이 있습니다.",
      };

      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            keywords: "Backend Developer Backend Engineer Server Developer TypeScript NestJS PostgreSQL Node.js API Development 3 years Mid-level",
            context: "Backend Developer with 3 years of experience specializing in NestJS and TypeScript for RESTful API development. Demonstrates comprehensive expertise in NestJS framework and PostgreSQL database management. Proficient in modern backend engineering practices and web development."
          })),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      // When
      const result = await llmService.preprocessForEmbedding(params);

      // Then
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.processedSummary).toContain("Backend");
      expect(result.data?.processedSummary).toContain("NestJS");
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it("정상적인 영어 입력으로 처리된 텍스트를 반환해야 한다", async () => {
      // Given
      const params: PreProcessEmbeddingParams = {
        position: "Frontend Developer",
        techStack: ["React", "Next.js", "TypeScript"],
        aiSummary:
          "Experienced frontend developer with 5 years of React development.",
      };

      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            keywords: "Frontend Developer Frontend Engineer React Next.js NextJS TypeScript JavaScript UI UX 5 years Senior-level",
            context: "Frontend Developer with 5 years of experience specializing in React and Next.js development. Demonstrates comprehensive expertise in modern frontend engineering with TypeScript. Proficient in building scalable web applications with React ecosystem and Next.js framework."
          })),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      // When
      const result = await llmService.preprocessForEmbedding(params);

      // Then
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.processedSummary).toContain("Frontend");
      expect(result.data?.processedSummary).toContain("React");
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it("여러 기술 스택을 가진 풀스택 개발자 입력을 처리해야 한다", async () => {
      // Given
      const params: PreProcessEmbeddingParams = {
        position: "Full-stack Developer",
        techStack: [
          "React",
          "Next.js",
          "NestJS",
          "PostgreSQL",
          "Docker",
          "AWS",
        ],
        aiSummary:
          "Full-stack developer with experience in both frontend and backend technologies.",
      };

      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            keywords: "Full-stack Developer Fullstack Engineer React Next.js NestJS PostgreSQL Docker AWS DevOps Mid-level",
            context: "Full-stack Developer with experience in both frontend and backend technologies. Demonstrates comprehensive expertise in React, Next.js for frontend and NestJS for backend development. Proficient in PostgreSQL database management, Docker containerization, and AWS cloud infrastructure."
          })),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      // When
      const result = await llmService.preprocessForEmbedding(params);

      // Then
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.processedSummary).toContain("Full-stack");
    });
  });

  describe("입력 검증", () => {
    it("빈 기술 스택으로도 처리할 수 있어야 한다", async () => {
      // Given
      const params: PreProcessEmbeddingParams = {
        position: "Junior Developer",
        techStack: [],
        aiSummary: "Entry-level developer seeking opportunities.",
      };

      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            keywords: "Junior Developer Entry-level Software Developer",
            context: "Entry-level developer seeking opportunities to grow and learn. Demonstrates enthusiasm for software development and willingness to acquire new technical skills."
          })),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      // When
      const result = await llmService.preprocessForEmbedding(params);

      // Then
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
    });

    it("긴 aiSummary를 처리할 수 있어야 한다", async () => {
      // Given
      const longSummary =
        "This is a very long summary ".repeat(50) +
        "with extensive details about the candidate's experience.";

      const params: PreProcessEmbeddingParams = {
        position: "Senior Engineer",
        techStack: ["JavaScript", "Python"],
        aiSummary: longSummary,
      };

      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            keywords: "Senior Engineer Senior Developer JavaScript Python Multi-language",
            context: "Senior Engineer with extensive experience across multiple programming languages. Demonstrates deep technical expertise in JavaScript and Python. Capable of handling complex technical challenges and architectural decisions."
          })),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      // When
      const result = await llmService.preprocessForEmbedding(params);

      // Then
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });
  });

  describe("에러 핸들링", () => {
    it("Gemini API 오류 시 실패 응답을 반환해야 한다", async () => {
      // Given
      const params: PreProcessEmbeddingParams = {
        position: "Developer",
        techStack: ["JavaScript"],
        aiSummary: "Summary text",
      };

      const errorMessage = "API rate limit exceeded";
      mockGenerateContent.mockRejectedValue(new Error(errorMessage));

      // When
      const result = await llmService.preprocessForEmbedding(params);

      // Then
      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe(errorMessage);
      expect(result.data).toBeUndefined();
    });

    it("알 수 없는 에러 시 기본 에러 메시지를 반환해야 한다", async () => {
      // Given
      const params: PreProcessEmbeddingParams = {
        position: "Developer",
        techStack: ["JavaScript"],
        aiSummary: "Summary text",
      };

      mockGenerateContent.mockRejectedValue("Unknown error");

      // When
      const result = await llmService.preprocessForEmbedding(params);

      // Then
      expect(result.success).toBe(false);
      expect(result.errorMessage).toBe("Failed to preprocess for embedding");
      expect(result.data).toBeUndefined();
    });

    it("네트워크 오류를 적절히 처리해야 한다", async () => {
      // Given
      const params: PreProcessEmbeddingParams = {
        position: "Developer",
        techStack: ["TypeScript"],
        aiSummary: "Summary",
      };

      mockGenerateContent.mockRejectedValue(
        new Error("Network request failed")
      );

      // When
      const result = await llmService.preprocessForEmbedding(params);

      // Then
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain("Network request failed");
    });
  });

  describe("프롬프트 생성 확인", () => {
    it("올바른 형식의 프롬프트로 API를 호출해야 한다", async () => {
      // Given
      const params: PreProcessEmbeddingParams = {
        position: "DevOps Engineer",
        techStack: ["Docker", "Kubernetes", "AWS"],
        aiSummary: "DevOps engineer with cloud experience.",
      };

      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            keywords: "DevOps Engineer Cloud Engineer Docker Kubernetes AWS Infrastructure",
            context: "DevOps engineer with cloud experience specializing in containerization and orchestration. Proficient in Docker, Kubernetes, and AWS cloud platforms."
          })),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      // When
      await llmService.preprocessForEmbedding(params);

      // Then
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
      const callArg = mockGenerateContent.mock.calls[0][0];

      expect(callArg).toContain("**Input Data:**");
      expect(callArg).toContain("DevOps Engineer");
      expect(callArg).toContain("Docker");
      expect(callArg).toContain("Kubernetes");
      expect(callArg).toContain("AWS");
    });
  });

  describe("응답 형식 검증", () => {
    it("Result 타입의 success 응답을 반환해야 한다", async () => {
      // Given
      const params: PreProcessEmbeddingParams = {
        position: "Data Engineer",
        techStack: ["Python", "SQL"],
        aiSummary: "Data engineer with ETL experience.",
      };

      const mockResponse = {
        response: {
          text: jest.fn().mockReturnValue(JSON.stringify({
            keywords: "Data Engineer ETL Python SQL Data Pipeline",
            context: "Data engineer with ETL experience specializing in Python and SQL. Proficient in building and maintaining data pipelines and data processing systems."
          })),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      // When
      const result = await llmService.preprocessForEmbedding(params);

      // Then
      expect(result).toHaveProperty("success");
      expect(result.success).toBe(true);
      expect(result).toHaveProperty("data");
      expect(result.data).toHaveProperty("processedSummary");
      expect(typeof result.data?.processedSummary).toBe("string");
    });

    it("processedSummary는 trim된 문자열이어야 한다", async () => {
      // Given
      const params: PreProcessEmbeddingParams = {
        position: "Mobile Developer",
        techStack: ["Flutter", "React Native"],
        aiSummary: "Mobile app developer",
      };

      const mockResponse = {
        response: {
          text: jest
            .fn()
            .mockReturnValue(JSON.stringify({
              keywords: "Mobile Developer Flutter React-Native",
              context: "Mobile app developer with cross-platform expertise."
            })),
        },
      };

      mockGenerateContent.mockResolvedValue(mockResponse);

      // When
      const result = await llmService.preprocessForEmbedding(params);

      // Then
      expect(result.success).toBe(true);
      expect(result.data?.processedSummary).toContain("Mobile Developer");
      expect(result.data?.processedSummary).not.toMatch(/^\s/);
      expect(result.data?.processedSummary).not.toMatch(/\s$/);
    });
  });
});
