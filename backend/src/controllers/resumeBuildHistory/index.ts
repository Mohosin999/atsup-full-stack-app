import { Response } from 'express';
import { AuthRequest } from '../../middlewares';
import { prisma } from '../../lib/prisma';
import {
  createResumeBuildHistory,
  getResumeBuildHistory,
  getResumeBuildHistoryById,
  deleteResumeBuildHistory,
  deleteAllResumeBuildHistory,
  updateResumeBuildHistory,
} from '../../services/resumeBuildHistory';

export const saveResumeBuild = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeContent, resumeName } = req.body;

    if (!resumeContent) {
      return res.status(400).json({
        success: false,
        message: 'Resume content is required',
      });
    }

    // Check user credits (Resume Build costs 1 credit)
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

    const build = await createResumeBuildHistory(
      req.user.id,
      resumeContent
    );

    // Deduct 1 credit for Resume Build
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
      data: build,
      credits: remainingCredits,
      message: "✅ Credit deducted successfully! Task: Resume Build, Credits deducted: 1",
    });
  } catch (error: any) {
    console.error('Save resume build error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to save resume build',
    });
  }
};

export const getResumeBuilds = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 3;

    const result = await getResumeBuildHistory(
      req.user.id,
      page,
      limit
    );

    res.json({
      success: true,
      data: result.builds,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('Get Resume Builds error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get Resume Builds',
    });
  }
};

export const getResumeBuild = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const build = await getResumeBuildHistoryById(req.user.id, id);

    res.json({
      success: true,
      data: build,
    });
  } catch (error: any) {
    console.error('Get Resume Build error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Resume Build not found',
    });
  }
};

export const deleteResumeBuildController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    await deleteResumeBuildHistory(req.user.id, id);

    res.json({
      success: true,
      message: 'Resume Build deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete Resume Build error:', error);
    res.status(404).json({
      success: false,
      message: error.message || 'Failed to delete Resume Build',
    });
  }
};

export const deleteAllResumeBuildsController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    await deleteAllResumeBuildHistory(req.user.id);

    res.json({
      success: true,
      message: 'All Resume Builds deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete all Resume Builds error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete Resume Builds',
    });
  }
};

export const updateResumeBuildController = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { resumeContent } = req.body;

    if (!resumeContent) {
      return res.status(400).json({
        success: false,
        message: 'Resume content is required',
      });
    }

    const build = await updateResumeBuildHistory(
      req.user.id,
      id,
      resumeContent
    );

    res.json({
      success: true,
      data: build,
    });
  } catch (error: any) {
    console.error('Update resume build error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update resume build',
    });
  }
};
