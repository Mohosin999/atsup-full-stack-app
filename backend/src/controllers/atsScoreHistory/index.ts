import { Response } from 'express';
import { AuthRequest } from '../../middlewares';
import { prisma } from '../../lib/prisma';
import {
  createAtsScoreHistory,
  getAtsScoreHistory,
  getAtsScoreHistoryById,
  deleteAtsScoreHistory,
  deleteAllAtsScoreHistory,
} from '../../services/atsScoreHistory';

export const analyzeAtsScore = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeName, resumeContent } = req.body;

    if (!resumeContent) {
      return res.status(400).json({
        success: false,
        message: 'Resume content is required',
      });
    }

    // Check user credits (ATS Score costs 1 credit)
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        subscription: true,
      },
    });

    const credits = (user?.subscription as any)?.credits ?? 0;
    if (!user || credits < 1) {
      return res.status(403).json({
        success: false,
        message: `Insufficient credits. This task requires 1 credit. You have ${credits} credits.`,
      });
    }

    const score = await createAtsScoreHistory(
      req.user.id,
      resumeName || 'Untitled Resume',
      resumeContent
    );

    // Deduct 1 credit for ATS Score Analysis
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        subscription: {
          ...((user.subscription as any) || {}),
          credits: credits - 1,
        },
      },
      select: {
        subscription: true,
      },
    });

    const remainingCredits = (updated.subscription as any)?.credits ?? 0;

    res.status(201).json({
      success: true,
      data: score,
      credits: remainingCredits,
      message: "✅ Credit deducted successfully! Task: ATS Score Analysis, Credits deducted: 1",
    });
  } catch (error: any) {
    console.error('ATS Score analysis error:', error);
    const status = error.message.includes('Insufficient credits') ? 403 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Failed to analyze ATS score',
    });
  }
};

export const getAtsScores = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 3;

    const result = await getAtsScoreHistory(
      req.user.id,
      page,
      limit
    );

    res.json({
      success: true,
      data: result.scores,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Get ATS scores error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get ATS scores',
    });
  }
};

export const getAtsScore = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const score = await getAtsScoreHistoryById(req.user.id, id);

    res.json({
      success: true,
      data: score,
    });
  } catch (error: any) {
    console.error('Get ATS score error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'ATS Score not found',
    });
  }
};

export const deleteAtsScoreController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    await deleteAtsScoreHistory(req.user.id, id);

    res.json({
      success: true,
      message: 'ATS Score deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete ATS score error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Failed to delete ATS Score',
    });
  }
};

export const deleteAllAtsScoresController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    await deleteAllAtsScoreHistory(req.user.id);

    res.json({
      success: true,
      message: 'All ATS Scores deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete all ATS scores error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete ATS Scores',
    });
  }
};
