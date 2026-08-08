import { z } from "zod";

export const parseJDSchema = z.object({
  description: z.string().min(20, "Job description is too short. Please provide a detailed job description."),
});

export const analyzeSchema = z.object({
  resumeName: z.string().optional(),
  jobDescription: z.string().optional(),
  structuredJD: z.any().optional(),
  aiResearch: z.any().optional(),
});

export type ParseJDInput = z.infer<typeof parseJDSchema>;
export type AnalyzeInput = z.infer<typeof analyzeSchema>;
