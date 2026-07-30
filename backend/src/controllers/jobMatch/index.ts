import { Response } from 'express';
import { AuthRequest } from '../../middlewares';
import {
  calculateJobMatch,
  getJobMatchHistory,
  getJobMatchById,
  deleteJobMatch,
} from '../../services/jobMatch';

export const analyzeJobMatch = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobDescription, jobTitle, company } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: 'Resume ID is required',
      });
    }

    if (!jobDescription || jobDescription.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Job description is required',
      });
    }

    const { jobMatch, credits } = await calculateJobMatch(
      req.user.id,
      resumeId,
      jobDescription,
      jobTitle,
      company
    );

    res.status(201).json({
      success: true,
      data: jobMatch,
      credits,
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
    const limit = parseInt(req.query.limit as string) || 10;

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

    const match = await getJobMatchById(req.user.id, id);

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

    await deleteJobMatch(req.user.id, id);

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
