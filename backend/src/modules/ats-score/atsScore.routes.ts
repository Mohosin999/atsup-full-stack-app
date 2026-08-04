import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth';
import {
  analyzeAtsScore,
  getAtsScores,
  getAtsScore,
  deleteAtsScoreController,
} from './atsScore.controller';

const router = Router();

// All routes require authentication
router.use(authenticate);

// POST /api/ats-score/analyze - Analyze resume for ATS score
router.post('/analyze', analyzeAtsScore);

// GET /api/ats-score - Get all ATS scores for user
router.get('/', getAtsScores);

// GET /api/ats-score/:id - Get specific ATS score
router.get('/:id', getAtsScore);

// DELETE /api/ats-score/:id - Delete ATS score
router.delete('/:id', deleteAtsScoreController);

export default router;
