import { Response } from 'express';
import { AuthRequest } from '../../middlewares';
import { prisma } from '../../lib/prisma';
import {
  createJobMatchHistory,
  getJobMatchHistory,
  getJobMatchHistoryById,
  deleteJobMatchHistory,
  deleteAllJobMatchHistory,
} from '../../services/jobMatchHistory';

export const analyzeJobMatch = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeName, resumeContent, jobDescription } = req.body;

    if (!resumeContent) {
      return res.status(400).json({
        success: false,
        message: 'Resume content is required',
      });
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required',
      });
    }

    // Check user credits (Job Match costs 1 credit)
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

    const match = await createJobMatchHistory(
      req.user.id,
      resumeName || 'Untitled Resume',
      resumeContent,
      jobDescription
    );

    // Deduct 1 credit for Job Match Analysis
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
      data: match,
      credits: remainingCredits,
      message: "✅ Credit deducted successfully! Task: Job Match Analysis, Credits deducted: 1",
    });
  } catch (error: any) {
    console.error('Job Match analysis error:', error);
    const status = error.message.includes('Insufficient credits') ? 403 : 500;
    res.status(status).json({
      success: false,
      message: error.message || 'Failed to analyze job match',
    });
  }
};

export const getJobMatches = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 3;

    const result = await getJobMatchHistory(
      req.user.id,
      page,
      limit
    );

    res.json({
      success: true,
      data: result.matches,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Get Job Matches error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get job matches',
    });
  }
};

export const getJobMatch = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const match = await getJobMatchHistoryById(req.user.id, id);

    res.json({
      success: true,
      data: match,
    });
  } catch (error: any) {
    console.error('Get Job Match error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Job Match not found',
    });
  }
};

export const deleteJobMatchController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    await deleteJobMatchHistory(req.user.id, id);

    res.json({
      success: true,
      message: 'Job Match deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete Job Match error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Failed to delete Job Match',
    });
  }
};

export const deleteAllJobMatchesController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    await deleteAllJobMatchHistory(req.user.id);

    res.json({
      success: true,
      message: 'All Job Matches deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete all Job Matches error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete Job Matches',
    });
  }
};
