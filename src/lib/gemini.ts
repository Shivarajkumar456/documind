import { GoogleGenerativeAI } from "@google/generative-ai";

const globalForGenAI = globalThis as unknown as { genAI: GoogleGenerativeAI };
export const genAI = globalForGenAI.genAI ?? new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);
if (process.env.NODE_ENV !== "production") globalForGenAI.genAI = genAI;
