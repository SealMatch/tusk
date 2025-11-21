import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not set");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const geminiEmbeddingModel = genAI.getGenerativeModel({
  model: "text-embedding-004",
});

export const geminiSummaryModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});
