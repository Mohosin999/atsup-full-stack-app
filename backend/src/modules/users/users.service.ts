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
  await prisma.atsScoreHistory.deleteMany({ where: { userId } });
  await prisma.analysis.deleteMany({ where: { userId } });
  await prisma.atsScore.deleteMany({ where: { userId } });
  await prisma.resume.deleteMany({ where: { userId } });

  return prisma.user.delete({ where: { id: userId } });
};
