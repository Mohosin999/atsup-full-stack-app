import { ResumeContent, StructuredJD } from "../types";
import { CategoryResult, CategorySubgroup, CheckStatus } from "./types";
import { CATEGORY_WEIGHTS } from "./constants";
import { scoreFromChecks, scoreFromSubgroups, deriveFeedback } from "./utils";

const buildSummarySubgroup = (resume: ResumeContent): CategorySubgroup => {
  const summaryWords = (resume.summary || "")
    .split(/\s+/)
    .filter(Boolean).length;
  const status: CheckStatus =
    summaryWords >= 30 ? "passed" : summaryWords > 0 ? "partial" : "failed";
  const detail =
    summaryWords >= 30
      ? "Summary present with good length."
      : summaryWords > 0
        ? `Summary too short (${summaryWords} words).`
        : "No summary section found.";
  const checks = [{ label: "Summary section", status, detail, weight: 30 }];
  return {
    key: "summary",
    title: "Summary",
    score: scoreFromChecks(checks),
    weight: 30,
    summary: detail,
    checks,
  };
};

const buildJobLevelSubgroup = (
  jd: StructuredJD | null,
  resumeYears: number,
): CategorySubgroup => {
  let status: CheckStatus;
  let detail: string;
  if (jd && jd.experienceYearsRequired > 0) {
    if (resumeYears >= jd.experienceYearsRequired) {
      status = "passed";
      detail = "Your experience aligns with the role's requirements.";
    } else if (resumeYears >= jd.experienceYearsRequired * 0.6) {
      status = "partial";
      detail = `Your experience (${resumeYears} yrs) is close to the requirement of ${jd.experienceYearsRequired}+ yrs.`;
    } else {
      status = "failed";
      detail = `Your experience (${resumeYears} yrs) doesn't align with the requirement of ${jd.experienceYearsRequired}+ yrs.`;
    }
  } else {
    status = resumeYears >= 1 ? "passed" : "failed";
    detail =
      resumeYears >= 1
        ? `Your experience (${resumeYears} yrs) shows relevant work history.`
        : "We couldn't verify your years of experience.";
  }
  const checks = [{ label: "Job level match", status, detail, weight: 30 }];
  return {
    key: "jobLevelMatch",
    title: "Job Level Match",
    score: scoreFromChecks(checks),
    weight: 30,
    summary: detail,
    checks,
  };
};

const buildMeasurableSubgroup = (measurable: {
  count: number;
}): CategorySubgroup => {
  const status: CheckStatus =
    measurable.count >= 5
      ? "passed"
      : measurable.count > 0
        ? "partial"
        : "failed";
  const detail =
    measurable.count >= 5
      ? `${measurable.count} measurable results found.`
      : measurable.count > 0
        ? `${measurable.count} of 5+ measurable results found.`
        : "No measurable results found.";
  const checks = [
    { label: "Measurable results (5+)", status, detail, weight: 20 },
  ];
  return {
    key: "measurableResults",
    title: "Measurable Results",
    score: scoreFromChecks(checks),
    weight: 20,
    summary: detail,
    checks,
  };
};

const buildActionVerbsSubgroup = (
  actionVerbCount: number,
): CategorySubgroup => {
  const status: CheckStatus =
    actionVerbCount >= 5
      ? "passed"
      : actionVerbCount > 0
        ? "partial"
        : "failed";
  const detail =
    actionVerbCount >= 5
      ? `${actionVerbCount} strong action verbs found.`
      : actionVerbCount > 0
        ? `Only ${actionVerbCount} action verbs found.`
        : "No action verbs found.";
  const checks = [{ label: "Action verbs", status, detail, weight: 20 }];
  return {
    key: "actionVerbs",
    title: "Action Verbs",
    score: scoreFromChecks(checks),
    weight: 20,
    summary: detail,
    checks,
  };
};

export const buildRecruiterTips = (
  resume: ResumeContent,
  jd: StructuredJD | null,
  resumeYears: number,
  measurable: { count: number },
  actionVerbCount: number,
): CategoryResult => {
  const subgroups = [
    buildSummarySubgroup(resume),
    buildJobLevelSubgroup(jd, resumeYears),
    buildMeasurableSubgroup(measurable),
    buildActionVerbsSubgroup(actionVerbCount),
  ];
  const checks = subgroups.flatMap((s) => s.checks);
  const { strengths, improvements } = deriveFeedback(checks);
  const score = scoreFromSubgroups(subgroups);
  return {
    key: "recruiterTips",
    title: "Recruiter Tips",
    score,
    weight: CATEGORY_WEIGHTS.recruiterTips,
    summary: `Resume is ${score >= 80 ? "very compelling" : score >= 50 ? "decent but improvable" : "missing key hooks"}.`,
    checks,
    subgroups,
    strengths,
    improvements,
  };
};
