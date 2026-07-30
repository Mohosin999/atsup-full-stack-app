import { prisma } from '../../lib/prisma';
import { ResumeContent } from '../../types';

export const createResumeBuildHistory = async (
  userId: string,
  resumeContent: ResumeContent
) => {
  const title = `${resumeContent.personalInfo?.fullName || 'Resume'} – Resume Builder v${Date.now().toString(36).slice(-4)}`;

  const resumeBuildHistory = await prisma.resumeBuildHistory.create({
    data: {
      userId,
      title,
      resumeContent,
    },
  });

  return resumeBuildHistory;
};

export const getResumeBuildHistory = async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [builds, total] = await Promise.all([
    prisma.resumeBuildHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.resumeBuildHistory.count({ where: { userId } }),
  ]);

  return {
    builds,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getResumeBuildHistoryById = async (userId: string, historyId: string) => {
  const build = await prisma.resumeBuildHistory.findFirst({
    where: { id: historyId, userId },
  });

  if (!build) {
    throw new Error('Resume Build history not found');
  }

  return build;
};

export const deleteResumeBuildHistory = async (userId: string, historyId: string) => {
  const existing = await prisma.resumeBuildHistory.findFirst({
    where: { id: historyId, userId },
  });

  if (!existing) {
    throw new Error('Resume Build history not found');
  }

  await prisma.resumeBuildHistory.delete({ where: { id: historyId } });
  return { success: true };
};

export const deleteAllResumeBuildHistory = async (userId: string) => {
  await prisma.resumeBuildHistory.deleteMany({ where: { userId } });
  return { success: true };
};

export const updateResumeBuildHistory = async (
  userId: string,
  historyId: string,
  resumeContent: ResumeContent
) => {
  const existing = await prisma.resumeBuildHistory.findFirst({
    where: { id: historyId, userId },
  });

  if (!existing) {
    throw new Error('Resume Build history not found');
  }

  const title = `${resumeContent.personalInfo?.fullName || 'Resume'} – Resume Builder v${Date.now().toString(36).slice(-4)}`;

  return prisma.resumeBuildHistory.update({
    where: { id: historyId },
    data: {
      title,
      resumeContent,
      updatedAt: new Date(),
    },
  });
};
