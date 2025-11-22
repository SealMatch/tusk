import { z } from "zod";

/**
 * Embed AI Request and Response
 */
export const embedRequestSchema = z.object({
  text: z.string().min(1, "Text cannot be empty"),
});

export type EmbedRequest = z.infer<typeof embedRequestSchema>;

// Response Types
export interface EmbedResponse {
  embedding: number[];
  dimensions: number;
}

/**
 * Summary AI Request and Response
 */
export const summaryRequestSchema = z.object({
  pdfBase64: z.string().min(1, "PDF data is required"),
  mimeType: z.literal("application/pdf").default("application/pdf"),
});

export type SummaryRequest = z.infer<typeof summaryRequestSchema>;

// 응답 타입
export type SummaryResponse = {
  position: string;
  techStack: string[];
  careerDetail: string;
};

export type PreProcessEmbeddingParams = {
  position: string;
  techStack: string[];
  aiSummary: string;
};

export type PreProcessEmbeddingResponse = {
  processedSummary: string;
};
