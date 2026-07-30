import { Response } from 'express';
import { AuthRequest } from '../../types';
import { prisma } from '../../lib/prisma';

export const deleteAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const analysis = await prisma.analysis.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      });
    }

    await prisma.analysis.delete({
      where: { id: req.params.id },
    });

    return res.json({
      success: true,
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting analysis",
    });
  }
};
