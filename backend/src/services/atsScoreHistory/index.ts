import { prisma } from '../../lib/prisma';
import { ResumeContent } from '../../types';
import { calculateLocalMatchScore } from '../atsScoreEngine';
import { StructuredJD } from '../jdParser';

export const createAtsScoreHistory = async (
  userId: string,
  resumeName: string,
  resumeContent: ResumeContent,
  jobDescription?: string,
  structuredJD?: StructuredJD | null
) => {
  const analysis = calculateLocalMatchScore(resumeContent, structuredJD, jobDescription);

  const hasContactInfo =
    !!resumeContent.personalInfo?.contact?.email ||
    !!(resumeContent.personalInfo as any)?.phone ||
    !!resumeContent.personalInfo?.contact?.linkedIn;

  if (!analysis.sectionScores.contactInfo.hasContactInfo && hasContactInfo) {
    analysis.sectionScores.contactInfo.hasContactInfo = true;
  }

  const title = `${resumeName || 'Resume'} – ATS Score v${Date.now().toString(36).slice(-4)}`;

  const atsScoreHistory = await prisma.atsScoreHistory.create({
    data: {
      userId,
      title,
      resumeName,
      overallScore: analysis.overallScore,
      sectionScores: {
        ...analysis.sectionScores,
        ...(analysis.matchBreakdown ? { matchBreakdown: analysis.matchBreakdown } : {}),
        categories: analysis.categories,
      } as any,
      spellingGrammar: analysis.spellingGrammar as any,
      atsFriendliness: analysis.atsFriendliness,
      suggestions: analysis.suggestions,
      resumeContent,
    },
  });

  return atsScoreHistory;
};

export const getAtsScoreHistory = async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [scores, total] = await Promise.all([
    prisma.atsScoreHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.atsScoreHistory.count({ where: { userId } }),
  ]);

  return {
    scores,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAtsScoreHistoryById = async (userId: string, historyId: string) => {
  const score = await prisma.atsScoreHistory.findFirst({
    where: { id: historyId, userId },
  });

  if (!score) {
    throw new Error('ATS Score history not found');
  }

  return score;
};

export const deleteAtsScoreHistory = async (userId: string, historyId: string) => {
  const existing = await prisma.atsScoreHistory.findFirst({
    where: { id: historyId, userId },
  });

  if (!existing) {
    throw new Error('ATS Score history not found');
  }

  await prisma.atsScoreHistory.delete({ where: { id: historyId } });
  return { success: true };
};

export const deleteAllAtsScoreHistory = async (userId: string) => {
  await prisma.atsScoreHistory.deleteMany({ where: { userId } });
  return { success: true };
};
