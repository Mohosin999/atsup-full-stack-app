import { Response } from 'express';
import { AuthRequest } from '../../middlewares';
import {
  calculateAtsScore,
  getAtsScoreHistory,
  getAtsScoreById,
  deleteAtsScore,
} from '../../services/atsScore';

export const analyzeAtsScore = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: 'Resume ID is required',
      });
    }

    const { atsScore, credits } = await calculateAtsScore(req.user.id, resumeId);

    res.status(201).json({
      success: true,
      data: atsScore,
      credits,
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
    const limit = parseInt(req.query.limit as string) || 10;

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

    const score = await getAtsScoreById(req.user.id, id);

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

    await deleteAtsScore(req.user.id, id);

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
