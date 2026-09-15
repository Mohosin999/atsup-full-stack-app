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

  const resume = await prisma.resume.create({
    data: {
      userId,
      sourceType: 'builder',
      content,
      metadata: {
        filename: `resume_${Date.now()}.json`,
        originalName:
          content.personalInfo?.jobTitle ||
          content.personalInfo?.fullName ||
          '',
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

  return { resume };
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

export const duplicateResumeById = async (resumeId: string, userId: string) => {
  const existing = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });

  if (!existing) {
    return null;
  }

  const sourceTitle =
    (existing.metadata as any)?.originalName ||
    (existing.content as any)?.personalInfo?.jobTitle ||
    (existing.content as any)?.personalInfo?.fullName ||
    'Resume';

  const resume = await prisma.resume.create({
    data: {
      userId,
      sourceType: existing.sourceType,
      content: existing.content as any,
      metadata: {
        filename: `resume_${Date.now()}.json`,
        originalName: `${sourceTitle} (Copy)`,
        size: JSON.stringify(existing.content).length,
        type: "application/json",
      },
      tags: existing.tags,
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
