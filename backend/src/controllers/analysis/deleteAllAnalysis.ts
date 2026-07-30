import { Response } from 'express';
import { AuthRequest } from '../../types';
import { prisma } from '../../lib/prisma';

export const deleteAllAnalyses = async (req: AuthRequest, res: Response) => {
  try {
    await prisma.analysis.deleteMany({
      where: { userId: req.user.id },
    });

    return res.json({
      success: true,
      message: "All analyses deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting all analyses",
    });
  }
};
