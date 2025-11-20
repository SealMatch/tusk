import { z } from "zod";

// Request Schema
export const embedRequestSchema = z.object({
  text: z.string().min(1, "Text cannot be empty"),
});

export type EmbedRequest = z.infer<typeof embedRequestSchema>;

// Response Types
export interface EmbedResponse {
  embedding: number[];
  dimensions: number;
}
