import { ResumeContent, StructuredJD } from "../types";
import { CategoryResult, CategorySubgroup, CheckStatus } from "./types";
import { CATEGORY_WEIGHTS } from "./constants";
import { scoreFromChecks, scoreFromSubgroups, deriveFeedback } from "./utils";

const buildSummarySubgroup = (resume: ResumeContent): CategorySubgroup => {
  const summaryWords = (resume.summary || "")
    .split(/\s+/)
    .filter(Boolean).length;

  const status: CheckStatus =
    summaryWords >= 30 ? "passed" : "failed";
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

// QUESTION: why I need here jd instead of exect years from jd
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
    measurable.count >= 3 ? "passed" : "failed";

  const detail =
    measurable.count >= 3
      ? `${measurable.count} measurable results found.`
      : measurable.count > 0
        ? `${measurable.count} of 3+ measurable results found.`
        : "No measurable results found.";

  const checks = [
    { label: "Measurable results (3+)", status, detail, weight: 20 },
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

// TODO: also add (resume tone, web presence, word count)

export const buildRecruiterTips = (
  resume: ResumeContent,
  jd: StructuredJD | null,
  resumeYears: number,
  measurable: { count: number },
): CategoryResult => {
  const subgroups = [
    buildSummarySubgroup(resume),
    buildJobLevelSubgroup(jd, resumeYears),
    buildMeasurableSubgroup(measurable),
  ];

  const checks = subgroups.flatMap((s) => s.checks);
  // QUESTION: what it does
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
