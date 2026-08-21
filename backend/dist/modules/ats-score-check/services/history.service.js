import { prisma } from "../../../lib/prisma";
import { calculateAtsScore } from "./scoring.service";
const CATEGORY_TITLES = {
    searchability: "Searchability",
    hardSkills: "Hard Skills",
    softSkills: "Soft Skills",
    recruiterTips: "Recruiter Tips",
    formatting: "Formatting",
};
const normalizeCategories = (sectionScores) => {
    if (!sectionScores?.categories)
        return sectionScores;
    const categories = { ...sectionScores.categories };
    for (const key of Object.keys(categories)) {
        if (CATEGORY_TITLES[key] && categories[key]) {
            categories[key] = { ...categories[key], title: CATEGORY_TITLES[key] };
        }
    }
    return { ...sectionScores, categories };
};
export const createAtsScoreHistory = async (userId, resumeName, resumeContent, structuredJD, aiResearch) => {
    const analysis = calculateAtsScore(resumeContent, structuredJD);
    const hasContactInfo = !!resumeContent.personalInfo?.contact?.email ||
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
            },
            atsFriendliness: analysis.atsFriendliness,
            suggestions: analysis.suggestions,
            resumeContent: resumeContent,
            aiResearch,
        },
    });
};
export const getAtsScoreHistory = async (userId, page = 1, limit = 10) => {
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
        scores: scores.map((s) => ({
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
export const getAtsScoreHistoryById = async (userId, historyId) => {
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
export const deleteAtsScoreHistory = async (userId, historyId) => {
    const existing = await prisma.atsScoreHistory.findFirst({
        where: { id: historyId, userId },
    });
    if (!existing) {
        throw new Error("ATS Score history not found");
    }
    await prisma.atsScoreHistory.delete({ where: { id: historyId } });
    return { success: true };
};
export const deleteAllAtsScoreHistory = async (userId) => {
    await prisma.atsScoreHistory.deleteMany({ where: { userId } });
    return { success: true };
};
export const renameAtsScoreHistory = async (userId, historyId, resumeName) => {
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
