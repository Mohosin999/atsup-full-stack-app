import { ApiError } from "@google/genai";

export class AiQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AiQuotaError";
  }
}

export const isGeminiQuotaError = (error: unknown): boolean => {
  if (error instanceof ApiError) {
    return error.status === 429 || error.status === 403;
  }
  const err = error as any;
  const msg = String(err?.message ?? error ?? "").toLowerCase();
  return (
    msg.includes("quota") ||
    msg.includes("rate limit") ||
    msg.includes("resource_exhausted") ||
    msg.includes("429") ||
    msg.includes("403")
  );
};

export const throwIfQuotaError = (error: unknown): void => {
  if (isGeminiQuotaError(error)) {
    throw new AiQuotaError(
      "AI service quota exceeded. Please try again tomorrow."
    );
  }
};
