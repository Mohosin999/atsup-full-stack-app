import { z } from "zod";

export const resumeContentSchema = z.object({
  content: z.record(z.string(), z.any()),
});

export type ResumeContentInput = z.infer<typeof resumeContentSchema>;
