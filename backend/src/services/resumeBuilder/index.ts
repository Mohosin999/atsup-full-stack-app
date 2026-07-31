import { prisma } from '../../lib/prisma';
import {
  generateSectionContent as generateWithGemini,
  improveResumeSection as improveWithGemini,
} from '../aiAnalysis/gemini';
import { ResumeContent } from '../../types';
import { useUserCredits, getUserCredits } from '../users';

export const createResumeTemplate = async (
  userId: string,
  name: string = 'Untitled Resume'
) => {
  const template = await prisma.resumeTemplate.create({
    data: {
      userId,
      name,
      isAtsFriendly: true,
      content: {
        personalInfo: {},
        experience: [],
        education: [],
        skills: [],
        projects: [],
        achievements: [],
      },
      isDraft: true,
    },
  });

  return template;
};

export const getResumeTemplates = async (
  userId: string,
  page = 1,
  limit = 10
) => {
  const skip = (page - 1) * limit;

  const [templates, total] = await Promise.all([
    prisma.resumeTemplate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.resumeTemplate.count({ where: { userId } }),
  ]);

  return {
    templates,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getResumeTemplateById = async (
  userId: string,
  templateId: string
) => {
  const template = await prisma.resumeTemplate.findFirst({
    where: { id: templateId, userId },
  });

  if (!template) {
    throw new Error('Resume template not found');
  }

  return template;
};

export const updateResumeTemplate = async (
  userId: string,
  templateId: string,
  updates: any
) => {
  const existing = await prisma.resumeTemplate.findFirst({
    where: { id: templateId, userId },
  });

  if (!existing) {
    throw new Error('Resume template not found');
  }

  return prisma.resumeTemplate.update({
    where: { id: templateId },
    data: {
      ...updates,
      updatedAt: new Date(),
    },
  });
};

export const deleteResumeTemplate = async (
  userId: string,
  templateId: string
) => {
  const existing = await prisma.resumeTemplate.findFirst({
    where: { id: templateId, userId },
  });

  if (!existing) {
    throw new Error('Resume template not found');
  }

  await prisma.resumeTemplate.delete({ where: { id: templateId } });
  return { success: true };
};

export const generateSectionContent = async (
  userId: string,
  section: string,
  context?: {
    jobTitle?: string;
    industry?: string;
    experience?: string;
    skills?: string[];
  }
) => {
  const currentCredits = await getUserCredits(userId);
  if (currentCredits < 1) {
    throw new Error(`Insufficient credits. This task requires 1 credit. You have ${currentCredits} credits.`);
  }

  const { credits } = await useUserCredits(userId, 1);
  const suggestion = await generateWithGemini(section, context);
  return { suggestion, credits };
};

export const improveResumeSection = async (
  userId: string,
  section: string,
  currentContent: string
) => {
  const improvement = await improveWithGemini(section, currentContent);
  const credits = await getUserCredits(userId);
  return { improvement, credits };
};

export const checkAtsFriendliness = async (content: ResumeContent) => {
  const issues: string[] = [];
  const suggestions: string[] = [];

  if (!content.summary || content.summary.length < 30) {
    issues.push('Summary is too short or missing');
    suggestions.push('Add a professional summary of 30-100 words');
  }

  if (!content.skills || content.skills.length < 5) {
    issues.push('Skills section is too short');
    suggestions.push('Add at least 5 relevant technical skills');
  }

  if (!content.experience || content.experience.length === 0) {
    issues.push('No work experience listed');
    suggestions.push('Add your work experience with quantified achievements');
  }

  if (!content.education || content.education.length === 0) {
    issues.push('No education listed');
    suggestions.push('Add your education background');
  }

  if (!content.personalInfo.contact?.email) {
    issues.push('Missing email address');
    suggestions.push('Add a professional email address');
  }

  if (
    !content.personalInfo.contact?.whatsapp &&
    !content.personalInfo.contact?.socialLinks?.github
  ) {
    issues.push('Limited contact information');
    suggestions.push('Add phone number or professional social links');
  }

  content.experience?.forEach((exp, index) => {
    const expText = (exp.highlights ?? []).join(' ');
    if (!expText || expText.length < 50) {
      issues.push(`Experience ${index + 1}: Description too short`);
      suggestions.push(`Expand experience ${index + 1} with quantified achievements`);
    }

    const actionVerbs = [
      'developed',
      'created',
      'implemented',
      'designed',
      'built',
      'optimized',
      'improved',
      'led',
      'managed',
    ];
    const hasActionVerb = actionVerbs.some((verb) =>
      expText.toLowerCase().includes(verb)
    );
    if (!hasActionVerb) {
      issues.push(`Experience ${index + 1}: No action verbs`);
      suggestions.push(
        `Start bullet points with strong action verbs for experience ${index + 1}`
      );
    }
  });

  const atsScore = Math.max(0, 100 - issues.length * 10);

  return {
    atsScore,
    issues,
    suggestions,
    isAtsFriendly: atsScore >= 70,
  };
};
