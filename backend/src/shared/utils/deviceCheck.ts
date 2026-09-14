import { prisma } from "../../lib/prisma";

/**
 * Check if a device fingerprint is already registered.
 * Returns { blocked: true, reason: string } if registration should be denied.
 */
export const checkDuplicateDevice = async (
  fingerprint?: string | null,
): Promise<{ blocked: boolean; reason?: string }> => {
  if (!fingerprint) {
    return { blocked: false };
  }

  const existingUser = await prisma.user.findFirst({
    where: { fingerprint },
    select: { id: true },
  });

  if (existingUser) {
    return {
      blocked: true,
      reason:
        "An account already exists on this device. Each device is limited to one account.",
    };
  }

  return { blocked: false };
};

/**
 * Validate email domain — only @gmail.com allowed.
 */
export const isGmail = (email: string): boolean => {
  return /^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email);
};
