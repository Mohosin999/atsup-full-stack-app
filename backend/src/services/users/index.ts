import { prisma } from '../../lib/prisma';

interface UpdateProfileData {
  name?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    defaultTemplate?: string;
    notifications?: boolean;
  };
}

export const getUserProfile = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      picture: true,
      preferences: true,
      subscription: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const updateUserProfile = async (
  userId: string,
  updateData: UpdateProfileData
) => {
  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      picture: true,
      preferences: true,
      subscription: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const deleteUserAccount = async (userId: string) => {
  await prisma.payment.deleteMany({ where: { userId } });
  await prisma.resumeBuildHistory.deleteMany({ where: { userId } });
  await prisma.atsScoreHistory.deleteMany({ where: { userId } });
  await prisma.jobMatchHistory.deleteMany({ where: { userId } });
  await prisma.analysis.deleteMany({ where: { userId } });
  await prisma.jobMatch.deleteMany({ where: { userId } });
  await prisma.atsScore.deleteMany({ where: { userId } });
  await prisma.resume.deleteMany({ where: { userId } });

  return prisma.user.delete({ where: { id: userId } });
};

export const useUserCredit = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  const subscription = (user.subscription as any) || {};
  const credits = subscription.credits ?? 0;

  if (credits <= 0) {
    throw new Error('Insufficient credits');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      subscription: {
        ...subscription,
        credits: credits - 1,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      picture: true,
      preferences: true,
      subscription: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return { credits: (updated.subscription as any).credits, user: updated };
};

export const useUserCredits = async (userId: string, amount: number) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  const subscription = (user.subscription as any) || {};
  const credits = subscription.credits ?? 0;

  if (credits < amount) {
    throw new Error('Insufficient credits');
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      subscription: {
        ...subscription,
        credits: credits - amount,
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      picture: true,
      preferences: true,
      subscription: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return { credits: (updated.subscription as any).credits, user: updated };
};

export const getUserCredits = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error('User not found');
  }

  const subscription = (user.subscription as any) || {};
  return subscription.credits ?? 0;
};
