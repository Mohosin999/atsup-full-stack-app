import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().min(2).max(100),
  company: z.string().max(100).optional(),
  description: z.string().min(10),
});

export type JobInput = z.infer<typeof jobSchema>;
