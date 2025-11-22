import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tusk API Documentation",
      version: "1.0.0",
      description: "Tusk API - 블록체인 기반 구직자-채용자 매칭 플랫폼",
      contact: {
        name: "Tusk Team",
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      schemas: {
        Result: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              description: "요청 성공 여부",
            },
            data: {
              description: "응답 데이터 (성공 시)",
            },
            errorMessage: {
              type: "string",
              description: "에러 메시지 (실패 시)",
            },
          },
          required: ["success"],
        },
        Applicant: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "지원자 ID",
            },
            handle: {
              type: "string",
              description: "사용자 핸들",
            },
            walletAddress: {
              type: "string",
              description: "지갑 주소",
            },
            position: {
              type: "string",
              description: "직무",
            },
            techStack: {
              type: "array",
              items: {
                type: "string",
              },
              description: "기술 스택",
            },
            aiSummary: {
              type: "string",
              description: "AI 요약",
            },
            blobId: {
              type: "string",
              description: "Blob ID (선택)",
            },
            sealPolicyId: {
              type: "string",
              description: "Seal Policy ID (선택)",
            },
            accessPrice: {
              type: "integer",
              description: "접근 가격 (선택)",
            },
            isJobSeeking: {
              type: "boolean",
              description: "구직 중 여부",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성 일시",
            },
          },
        },
        Match: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "매칭 ID",
            },
            recruiterWalletAddress: {
              type: "string",
              description: "채용자 지갑 주소",
            },
            applicantId: {
              type: "string",
              description: "지원자 ID",
            },
            status: {
              type: "string",
              enum: ["pending", "accepted", "rejected", "cancelled"],
              description: "매칭 상태",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성 일시",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정 일시",
            },
          },
        },
        SearchResult: {
          type: "object",
          properties: {
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                  },
                  handle: {
                    type: "string",
                  },
                  walletAddress: {
                    type: "string",
                  },
                  position: {
                    type: "string",
                  },
                  techStack: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                  aiSummary: {
                    type: "string",
                  },
                  similarity: {
                    type: "number",
                    description: "유사도 점수 (0-1)",
                  },
                  createdAt: {
                    type: "string",
                    format: "date-time",
                  },
                },
              },
            },
            query: {
              type: "string",
              description: "검색 쿼리",
            },
          },
        },
        History: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "이력 ID",
            },
            recruiterWalletAddress: {
              type: "string",
              description: "채용자 지갑 주소",
            },
            query: {
              type: "string",
              description: "검색 쿼리",
            },
            results: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  applicantId: {
                    type: "string",
                  },
                  similarity: {
                    type: "number",
                  },
                  createdAt: {
                    type: "string",
                    format: "date-time",
                  },
                },
              },
              description: "검색 결과",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성 일시",
            },
          },
        },
        SearchResultCard: {
          type: "object",
          properties: {
            applicant: {
              $ref: "#/components/schemas/Applicant",
            },
            match: {
              $ref: "#/components/schemas/Match",
            },
            similarity: {
              type: "number",
              description: "유사도 점수",
            },
          },
        },
        PdfAnalysisResult: {
          type: "object",
          properties: {
            handle: {
              type: "string",
              description: "추출된 사용자 핸들",
            },
            position: {
              type: "string",
              description: "추출된 직무",
            },
            techStack: {
              type: "array",
              items: {
                type: "string",
              },
              description: "추출된 기술 스택",
            },
            aiSummary: {
              type: "string",
              description: "AI 생성 요약",
            },
          },
        },
      },
      securitySchemes: {
        WalletAddress: {
          type: "apiKey",
          in: "header",
          name: "x-wallet-address",
          description: "사용자 지갑 주소",
        },
      },
    },
  },
  apis: ["./src/app/api/v1/**/route.ts"], // API route 파일 경로
};

export const swaggerSpec = swaggerJsdoc(options);
