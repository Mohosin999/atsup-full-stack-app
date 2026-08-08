import { z } from "zod";

export const checkoutPlanSchema = z.object({
  planId: z.enum(["pro", "enterprise"]),
});

export type CheckoutPlanInput = z.infer<typeof checkoutPlanSchema>;
