import { z } from "zod";

export const generateAnalysisSchema = z.object({
  resumeId: z.string(),
  jobDescription: z.string().min(50),
});

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export type GenerateAnalysisInput = z.infer<typeof generateAnalysisSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
