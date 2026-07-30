import authRoutes from './auth';
import userRoutes from './users';
import analysisRoutes from './analysis';
import jobRoutes from './jobs';
import atsScoreRoutes from './atsScore';
import atsScoreHistoryRoutes from './atsScoreHistory';
import resumeBuildHistoryRoutes from './resumeBuildHistory';
import resumeBuilderRoutes from './resumeBuilder';
import resumeParserRoutes from './resumeParser';
import paymentRoutes from './payment';

export {
  authRoutes,
  userRoutes,
  analysisRoutes,
  jobRoutes,
  atsScoreRoutes,
  atsScoreHistoryRoutes,
  resumeBuildHistoryRoutes,
  resumeBuilderRoutes,
  resumeParserRoutes,
  paymentRoutes,
};

export const routes = [
  { path: '/api/auth', router: authRoutes },
  { path: '/api/users', router: userRoutes },
  { path: '/api/analysis', router: analysisRoutes },
  { path: '/api/jobs', router: jobRoutes },
  { path: '/api/ats-score', router: atsScoreRoutes },
  { path: '/api/ats-score-history', router: atsScoreHistoryRoutes },
  { path: '/api/resume-build-history', router: resumeBuildHistoryRoutes },
  { path: '/api/resume-builder', router: resumeBuilderRoutes },
  { path: '/api/resume-parser', router: resumeParserRoutes },
  { path: '/api/payment', router: paymentRoutes },
];
