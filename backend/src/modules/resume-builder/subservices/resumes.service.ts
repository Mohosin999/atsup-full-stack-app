import { prisma } from '../../../lib/prisma';
import { findUserById } from '../../auth/auth.service';

interface PaginationOptions {
  page: number;
  limit: number;
  sourceType?: 'uploaded' | 'builder';
}

export const getAllResumesByUser = async (
  userId: string,
  options: PaginationOptions
) => {
  const { page, limit, sourceType } = options;
  const skip = (page - 1) * limit;

  const where: any = { userId };

  if (sourceType) {
    where.sourceType = sourceType;
  }

  const [resumes, total] = await Promise.all([
    prisma.resume.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        sourceType: true,
        originalFormat: false,
        content: true,
        metadata: true,
        tags: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    }),
    prisma.resume.count({ where }),
  ]);

  return {
    resumes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getResumeById = async (resumeId: string, userId: string) => {
  return prisma.resume.findFirst({
    where: { id: resumeId, userId },
    select: {
      id: true,
      sourceType: true,
      originalFormat: true,
      content: true,
      metadata: true,
      tags: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
    },
  });
};

interface UploadedFile {
  path: string;
  filename: string;
  mimetype: string;
  size: number;
  originalname: string;
}

export const createResumeFromUpload = async (
  userId: string,
  file: UploadedFile
) => {
  const { parseResumeFile } = await import('../../../shared/resume-parser');
  const parsed = await parseResumeFile(file.path, file.mimetype);

  const resume = await prisma.resume.create({
    data: {
      userId,
      sourceType: 'uploaded',
      originalFormat: {
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
      },
      content: { rawText: parsed.text } as any,
      metadata: {
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        type: file.mimetype,
      },
      isActive: true,
    },
    select: {
      id: true,
      sourceType: true,
      originalFormat: true,
      content: true,
      metadata: true,
      tags: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
    },
  });

  return resume;
};

export const createResumeFromContent = async (
  userId: string,
  content: any
) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  const subscription = (user.subscription as any) || {};
  const credits = subscription.credits ?? 0;

  if (credits <= 0) {
    throw new Error('Insufficient credits. Please upgrade your plan.');
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

  const resume = await prisma.resume.create({
    data: {
      userId,
      sourceType: 'builder',
      content,
      metadata: {
        filename: `resume_${Date.now()}.json`,
        originalName: content.personalInfo?.fullName || 'Resume',
        size: JSON.stringify(content).length,
        type: 'application/json',
      },
      isActive: true,
    },
    select: {
      id: true,
      sourceType: true,
      originalFormat: true,
      content: true,
      metadata: true,
      tags: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
    },
  });

  return { resume, remainingCredits: (updated.subscription as any).credits };
};

export const updateResumeById = async (
  resumeId: string,
  userId: string,
  updateData: any
) => {
  const existing = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });

  if (!existing) {
    return null;
  }

  return prisma.resume.update({
    where: { id: resumeId },
    data: updateData,
    select: {
      id: true,
      sourceType: true,
      originalFormat: true,
      content: true,
      metadata: true,
      tags: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      userId: true,
    },
  });
};

export const deleteResumeById = async (resumeId: string, userId: string) => {
  const existing = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });

  if (!existing) {
    return null;
  }

  await prisma.resume.delete({ where: { id: resumeId } });
  return existing;
};

export const deleteAllResumesByUser = async (
  userId: string
): Promise<{ deletedCount: number }> => {
  const result = await prisma.resume.deleteMany({ where: { userId } });
  return { deletedCount: result.count };
};
