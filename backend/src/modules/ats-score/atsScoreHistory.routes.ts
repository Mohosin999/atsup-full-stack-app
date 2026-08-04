import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth';
import {
  analyzeAtsScore,
  getAtsScores,
  getAtsScore,
  deleteAtsScoreController,
  deleteAllAtsScoresController,
} from './atsScoreHistory.controller';

const router = Router();

router.use(authenticate);

router.post('/analyze', analyzeAtsScore);
router.get('/', getAtsScores);
router.get('/:id', getAtsScore);
router.delete('/:id', deleteAtsScoreController);
router.delete('/', deleteAllAtsScoresController);

export default router;
