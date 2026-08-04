import { prisma } from '../../../lib/prisma';

interface JobInput {
  title: string;
  company?: string;
  description: string;
}

interface PaginationOptions {
  page: number;
  limit: number;
}

export const getAllJobsByUser = async (
  userId: string,
  options: PaginationOptions
) => {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    prisma.jobDescription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.jobDescription.count({ where: { userId } }),
  ]);

  return {
    jobs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getJobById = async (jobId: string, userId: string) => {
  return prisma.jobDescription.findFirst({
    where: { id: jobId, userId },
  });
};

export const createJob = async (jobData: JobInput, userId: string) => {
  return prisma.jobDescription.create({
    data: {
      ...jobData,
      userId,
    },
  });
};

export const updateJobById = async (
  jobId: string,
  userId: string,
  jobData: Partial<JobInput>
) => {
  const existing = await prisma.jobDescription.findFirst({
    where: { id: jobId, userId },
  });

  if (!existing) {
    return null;
  }

  return prisma.jobDescription.update({
    where: { id: jobId },
    data: jobData,
  });
};

export const deleteJobById = async (jobId: string, userId: string) => {
  const existing = await prisma.jobDescription.findFirst({
    where: { id: jobId, userId },
  });

  if (!existing) {
    return null;
  }

  await prisma.jobDescription.delete({ where: { id: jobId } });
  return existing;
};
