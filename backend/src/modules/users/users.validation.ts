import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  preferences: z
    .object({
      theme: z.enum(["light", "dark", "system"]).optional(),
      defaultTemplate: z.string().optional(),
      notifications: z.boolean().optional(),
    })
    .optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
