import { prisma } from "../../../lib/prisma";
import { ResumeContent, StructuredJD } from "../../../shared/types";
import { calculateAtsScore } from "./scoring.service";

const CATEGORY_TITLES: Record<string, string> = {
  searchability: "Searchability",
  hardSkills: "Hard Skills",
  softSkills: "Soft Skills",
  recruiterTips: "Recruiter Tips",
  formatting: "Formatting",
};

const normalizeCategories = (sectionScores: any) => {
  if (!sectionScores?.categories) return sectionScores;
  const categories = { ...sectionScores.categories };
  for (const key of Object.keys(categories)) {
    if (CATEGORY_TITLES[key] && categories[key]) {
      categories[key] = { ...categories[key], title: CATEGORY_TITLES[key] };
    }
  }
  return { ...sectionScores, categories };
};

export const createAtsScoreHistory = async (
  userId: string,
  resumeName: string,
  resumeContent: ResumeContent,
  structuredJD?: StructuredJD | null,
  aiResearch?: any | null,
) => {
  const analysis = calculateAtsScore(resumeContent, structuredJD);

  const hasContactInfo =
    !!resumeContent.personalInfo?.contact?.email ||
    !!resumeContent.personalInfo?.contact?.phone ||
    !!resumeContent.personalInfo?.contact?.address;

  if (!analysis.sectionScores.contactInfo.hasContactInfo && hasContactInfo) {
    analysis.sectionScores.contactInfo.hasContactInfo = true;
  }

  const title = `${resumeName || "Untitled Resume"}`;

  return prisma.atsScoreHistory.create({
    data: {
      userId,
      title,
      resumeName,
      overallScore: analysis.overallScore,
      sectionScores: {
        ...analysis.sectionScores,
        ...(analysis.matchBreakdown
          ? { matchBreakdown: analysis.matchBreakdown }
          : {}),
        categories: analysis.categories,
      } as any,
      atsFriendliness: analysis.atsFriendliness,
      suggestions: analysis.suggestions,
      resumeContent: resumeContent as any,
      aiResearch,
    },
  });
};

export const getAtsScoreHistory = async (
  userId: string,
  page = 1,
  limit = 10,
) => {
  const skip = (page - 1) * limit;

  const [scores, total] = await Promise.all([
    prisma.atsScoreHistory.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.atsScoreHistory.count({ where: { userId } }),
  ]);

  return {
    scores: scores.map((s: any) => ({
      ...s,
      sectionScores: normalizeCategories(s.sectionScores),
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAtsScoreHistoryById = async (
  userId: string,
  historyId: string,
) => {
  const score = await prisma.atsScoreHistory.findFirst({
    where: { id: historyId, userId },
  });

  if (!score) {
    throw new Error("ATS Score history not found");
  }

  return {
    ...score,
    sectionScores: normalizeCategories(score.sectionScores),
  };
};

export const deleteAtsScoreHistory = async (
  userId: string,
  historyId: string,
) => {
  const existing = await prisma.atsScoreHistory.findFirst({
    where: { id: historyId, userId },
  });

  if (!existing) {
    throw new Error("ATS Score history not found");
  }

  await prisma.atsScoreHistory.delete({ where: { id: historyId } });
  return { success: true };
};

export const deleteAllAtsScoreHistory = async (userId: string) => {
  await prisma.atsScoreHistory.deleteMany({ where: { userId } });
  return { success: true };
};

export const renameAtsScoreHistory = async (
  userId: string,
  historyId: string,
  resumeName: string,
) => {
  const existing = await prisma.atsScoreHistory.findFirst({
    where: { id: historyId, userId },
  });

  if (!existing) {
    throw new Error("ATS Score history not found");
  }

  return prisma.atsScoreHistory.update({
    where: { id: historyId },
    data: { resumeName, title: resumeName },
  });
};

export const rescanAtsScoreHistory = async (
  userId: string,
  historyId: string,
  resumeName: string,
  resumeContent: ResumeContent,
  sectionScores: any,
  overallScore: number,
  atsFriendliness: number,
  suggestions: string[],
  matchBreakdown?: any,
) => {
  const existing = await prisma.atsScoreHistory.findFirst({
    where: { id: historyId, userId },
  });

  if (!existing) {
    throw new Error("ATS Score history not found");
  }

  return prisma.atsScoreHistory.update({
    where: { id: historyId },
    data: {
      resumeName,
      title: resumeName,
      overallScore,
      sectionScores: {
        ...sectionScores,
        ...(matchBreakdown ? { matchBreakdown } : {}),
        categories: sectionScores.categories,
      } as any,
      atsFriendliness,
      suggestions,
      resumeContent: resumeContent as any,
    },
  });
};
