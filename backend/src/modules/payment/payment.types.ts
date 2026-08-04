export type PlanId = "pro" | "enterprise";

export interface CreateCheckoutSessionParams {
  userId: string;
  planId: PlanId;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string | null;
}
