import { prisma } from '../../lib/prisma';
import { analyzeAtsScore as analyzeWithGemini } from '../aiAnalysis/gemini';
import { ResumeContent } from '../../types';
import { useUserCredits, getUserCredits } from '../users';

const validErrorTypes = ['spelling', 'grammar', 'punctuation', 'formatting', 'redundancy'];

const sanitizeSpellingGrammar = (spellingGrammar: any) => {
  return {
    ...spellingGrammar,
    errors: spellingGrammar.errors.map((error: any) => ({
      ...error,
      type: validErrorTypes.includes(error.type) ? error.type : 'formatting',
    })),
  };
};

export const calculateAtsScore = async (
  userId: string,
  resumeId: string
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

  const analysis = await analyzeWithGemini(resume.content as any);

  const sanitizedSpellingGrammar = sanitizeSpellingGrammar(analysis.spellingGrammar);

  const atsScore = await prisma.atsScore.create({
    data: {
      userId,
      resumeId,
      overallScore: analysis.overallScore,
      sectionScores: analysis.sectionScores,
      spellingGrammar: sanitizedSpellingGrammar,
      atsFriendliness: analysis.atsFriendliness,
      suggestions: analysis.suggestions,
    },
  });

  return { atsScore, credits };
};

export const getAtsScoreHistory = async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [scores, total] = await Promise.all([
    prisma.atsScore.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        userId: true,
        resumeId: true,
        overallScore: true,
        sectionScores: true,
        spellingGrammar: true,
        atsFriendliness: true,
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
    prisma.atsScore.count({ where: { userId } }),
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

export const getAtsScoreById = async (userId: string, scoreId: string) => {
  const score = await prisma.atsScore.findFirst({
    where: { id: scoreId, userId },
    select: {
      id: true,
      userId: true,
      resumeId: true,
      overallScore: true,
      sectionScores: true,
      spellingGrammar: true,
      atsFriendliness: true,
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

  if (!score) {
    throw new Error('ATS Score not found');
  }

  return score;
};

export const deleteAtsScore = async (userId: string, scoreId: string) => {
  const existing = await prisma.atsScore.findFirst({
    where: { id: scoreId, userId },
  });

  if (!existing) {
    throw new Error('ATS Score not found');
  }

  await prisma.atsScore.delete({ where: { id: scoreId } });
  return { success: true };
};
