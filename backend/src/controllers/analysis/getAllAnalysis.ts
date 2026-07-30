import { Response } from 'express';
import { AuthRequest } from '../../types';
import { prisma } from '../../lib/prisma';

export const getAllAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 3;
    const skip = (page - 1) * limit;

    const analyses = await prisma.analysis.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        resume: {
          select: {
            metadata: true,
            content: true,
          },
        },
      },
    });

    const total = await prisma.analysis.count({
      where: { userId: req.user.id },
    });

    return res.json({
      success: true,
      data: analyses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching analyses",
    });
  }
};
