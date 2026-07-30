import { Response } from 'express';
import { AuthRequest } from '../../types';
import { prisma } from '../../lib/prisma';

export const getSingleAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const analysis = await prisma.analysis.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { resume: true },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    return res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching analysis",
    });
  }
};
