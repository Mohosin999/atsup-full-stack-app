import authRoutes from "./auth/auth.routes";
import userRoutes from "./users/users.routes";
import atsScoreCheckRoutes from "./ats-score-check/atsScoreCheck.routes";
import resumeBuilderRoutes from "./resume-builder/resumeBuilder.routes";
import unlimitedAtsRoutes from "./unlimited-ats-check/unlimitedAts.routes";
import adminDashboardRoutes from "./admin-dashboard/admin-dashboard.routes";
import supportRoutes from "./support/support.routes";
import visitorRoutes from "./visitor/visitor.routes";
import feedbackRoutes from "./feedback/feedback.routes";

export const moduleRoutes = [
  { path: "/api/auth", router: authRoutes },
  { path: "/api/users", router: userRoutes },
  { path: "/api/ats-score", router: atsScoreCheckRoutes },
  { path: "/api/resumes", router: resumeBuilderRoutes },
  { path: "/api/unlimited-ats-check", router: unlimitedAtsRoutes },
  { path: "/api/admin-dashboard", router: adminDashboardRoutes },
  { path: "/api/support", router: supportRoutes },
  { path: "/api/visitor", router: visitorRoutes },
  { path: "/api/feedback", router: feedbackRoutes },
];
