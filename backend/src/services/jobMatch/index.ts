import { prisma } from '../../lib/prisma';
import { analyzeJobMatch as analyzeWithGemini } from '../aiAnalysis/gemini';
import { useUserCredits, getUserCredits } from '../users';

export const calculateJobMatch = async (
  userId: string,
  resumeId: string,
  jobDescription: string,
  jobTitle?: string,
  company?: string
) => {
  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });

  if (!resume) {
    throw new Error('Resume not found');
  }

  const currentCredits = await getUserCredits(userId);
  if (currentCredits < 1) {
    throw new Error(`Insufficient credits. This task requires 1 credit. You have ${currentCredits} credits.`);
  }

  const { credits } = await useUserCredits(userId, 1);

  const analysis = await analyzeWithGemini(
    resume.content as any,
    jobDescription,
    jobTitle,
    company
  );

  const jobMatch = await prisma.jobMatch.create({
    data: {
      userId,
      resumeId,
      jobDescription,
      jobTitle,
      company,
      matchPercentage: analysis.matchPercentage,
      breakdown: analysis.breakdown,
      missingSkills: analysis.missingSkills,
      missingKeywords: analysis.missingKeywords,
      suggestions: analysis.suggestions,
    },
  });

  return { jobMatch, credits };
};

export const getJobMatchHistory = async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [matches, total] = await Promise.all([
    prisma.jobMatch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        userId: true,
        resumeId: true,
        jobDescription: true,
        jobTitle: true,
        company: true,
        matchPercentage: true,
        breakdown: true,
        missingSkills: true,
        missingKeywords: true,
        suggestions: true,
        createdAt: true,
        updatedAt: true,
        resume: {
          select: {
            metadata: true,
            content: true,
          },
        },
      },
    }),
    prisma.jobMatch.count({ where: { userId } }),
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

export const getJobMatchById = async (userId: string, matchId: string) => {
  const match = await prisma.jobMatch.findFirst({
    where: { id: matchId, userId },
    select: {
      id: true,
      userId: true,
      resumeId: true,
      jobDescription: true,
      jobTitle: true,
      company: true,
      matchPercentage: true,
      breakdown: true,
      missingSkills: true,
      missingKeywords: true,
      suggestions: true,
      createdAt: true,
      updatedAt: true,
      resume: {
        select: {
          metadata: true,
          content: true,
        },
      },
    },
  });

  if (!match) {
    throw new Error('Job Match not found');
  }

  return match;
};

export const deleteJobMatch = async (userId: string, matchId: string) => {
  const existing = await prisma.jobMatch.findFirst({
    where: { id: matchId, userId },
  });

  if (!existing) {
    throw new Error('Job Match not found');
  }

  await prisma.jobMatch.delete({ where: { id: matchId } });
  return { success: true };
};
