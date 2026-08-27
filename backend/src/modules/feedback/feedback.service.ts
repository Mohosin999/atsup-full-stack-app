import { prisma } from "../../lib/prisma";

export const createFeedback = async (
  userId: string,
  rating: number,
  message: string
) => {
  return prisma.feedback.create({
    data: { userId, rating, message },
    select: {
      id: true,
      rating: true,
      message: true,
      createdAt: true,
    },
  });
};
