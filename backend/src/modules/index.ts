import authRoutes from "./auth/auth.routes";
import userRoutes from "./users/users.routes";
import atsScoreHistoryRoutes from "./ats-score-check/history/atsScoreHistory.routes";
import resumeParserRoutes from "./ats-score-check/resume-parser/resumeParser.routes";
import jobMatchRoutes from "./job-match/jobMatch.routes";
import resumeBuilderRoutes from "./resume-builder/resumeBuilder.routes";
import paymentRoutes from "./payment/payment.routes";

export const moduleRoutes = [
  { path: "/api/auth", router: authRoutes },
  { path: "/api/users", router: userRoutes },
  { path: "/api/ats-score-history", router: atsScoreHistoryRoutes },
  { path: "/api/resume-parser", router: resumeParserRoutes },
  { path: "/api/jobs", router: jobMatchRoutes },
  { path: "/api/resumes", router: resumeBuilderRoutes },
  { path: "/api/payment", router: paymentRoutes },
];
