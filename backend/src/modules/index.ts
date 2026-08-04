import authRoutes from "./auth/auth.routes";
import userRoutes from "./users/users.routes";
import analysisRoutes from "./ats-score/analysis.routes";
import atsScoreRoutes from "./ats-score/atsScore.routes";
import atsScoreHistoryRoutes from "./ats-score/atsScoreHistory.routes";
import jobMatchRoutes from "./job-match/jobMatch.routes";
import resumeParserRoutes from "./resume-builder/resumeParser.routes";
import resumeBuilderRoutes from "./resume-builder/resumeBuilder.routes";
import paymentRoutes from "./payment/payment.routes";

export const moduleRoutes = [
  { path: "/api/auth", router: authRoutes },
  { path: "/api/users", router: userRoutes },
  { path: "/api/analysis", router: analysisRoutes },
  { path: "/api/ats-score", router: atsScoreRoutes },
  { path: "/api/ats-score-history", router: atsScoreHistoryRoutes },
  { path: "/api/jobs", router: jobMatchRoutes },
  { path: "/api/resume-parser", router: resumeParserRoutes },
  { path: "/api/resumes", router: resumeBuilderRoutes },
  { path: "/api/payment", router: paymentRoutes },
];
