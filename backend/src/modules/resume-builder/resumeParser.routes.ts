import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth';
import { upload } from '../../shared/config/multer';
import { parseResume } from './resumeParser.controller';

const router = Router();

router.use(authenticate);

router.post('/parse', upload.single('resume'), parseResume);

export default router;
