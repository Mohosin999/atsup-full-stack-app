import { prisma } from '../../lib/prisma';
import { analyzeJobMatch as analyzeWithGemini } from '../aiAnalysis/gemini';
import { ResumeContent } from '../../types';

export const createJobMatchHistory = async (
  userId: string,
  resumeName: string,
  resumeContent: ResumeContent,
  jobDescription: string
) => {
  const analysis = await analyzeWithGemini(resumeContent, jobDescription);

  const title = `${resumeName} – Job Match v${Date.now().toString(36).slice(-4)}`;

  const jobMatchHistory = await prisma.jobMatchHistory.create({
    data: {
      userId,
      title,
      resumeName,
      jobDescription,
      matchPercentage: analysis.matchPercentage,
      breakdown: analysis.breakdown,
      missingSkills: analysis.missingSkills,
      missingKeywords: analysis.missingKeywords,
      suggestions: analysis.suggestions,
      resumeContent,
    },
  });

  return jobMatchHistory;
};

export const getJobMatchHistory = async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [matches, total] = await Promise.all([
    prisma.jobMatchHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.jobMatchHistory.count({ where: { userId } }),
  ]);

  return {
    matches,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getJobMatchHistoryById = async (userId: string, historyId: string) => {
  const match = await prisma.jobMatchHistory.findFirst({
    where: { id: historyId, userId },
  });

  if (!match) {
    throw new Error('Job Match history not found');
  }

  return match;
};

export const deleteJobMatchHistory = async (userId: string, historyId: string) => {
  const existing = await prisma.jobMatchHistory.findFirst({
    where: { id: historyId, userId },
  });

  if (!existing) {
    throw new Error('Job Match history not found');
  }

  await prisma.jobMatchHistory.delete({ where: { id: historyId } });
  return { success: true };
};

export const deleteAllJobMatchHistory = async (userId: string) => {
  await prisma.jobMatchHistory.deleteMany({ where: { userId } });
  return { success: true };
};
