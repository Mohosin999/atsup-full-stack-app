import { ResumeContent, StructuredJD } from "../types";
import { CategoryResult, CategorySubgroup, CheckStatus } from "./types";
import { CATEGORY_WEIGHTS } from "./constants";
import {
  scoreFromChecks,
  scoreFromSubgroups,
  deriveFeedback,
  toResumeText,
  actionVerbsScore,
  measurableResultsScore,
  summaryScore,
} from "./utils";

// ============================================================
// Summary
// ============================================================
const buildSummarySubgroup = (resume: ResumeContent): CategorySubgroup => {
  const summaryWords = (resume.summary || "")
    .split(/\s+/)
    .filter(Boolean).length;

  const score = summaryScore(summaryWords);
  const status: CheckStatus = score >= 100 ? "passed" : "failed";
  const detail =
    summaryWords >= 30 && summaryWords <= 80
      ? "We found a summary section on your resume. Good job! The summary provides a quick overview of the candidate's qualifications, helping recruiters and hiring managers promptly grasp the value the candidate can offer in the position."
      : summaryWords > 80
        ? `Your summary is too long (${summaryWords} words). Keep it within 30-80 words so it stays scannable.`
        : summaryWords > 0
          ? `We found a summary section on your resume, but it's not enough. Make sure to include 30-80 words in the summary to stand out.`
          : "We couldn't find a summary section on your resume. Make sure to include a summary section in your resume to stand out.";
  const checks = [{ label: "Summary section", status, detail, weight: 20 }];
  return {
    key: "summary",
    title: "Summary",
    score,
    weight: 20,
    summary: detail,
    checks,
  };
};

// ============================================================
// Job Level match - years (2+ years of experience)
// ============================================================
const buildJobLevelSubgroup = (
  jd: StructuredJD | null,
  resumeYears: number,
): CategorySubgroup => {
  let status: CheckStatus;
  let detail: string;

  if (jd && jd.experienceYearsRequired > 0) {
    if (resumeYears >= jd.experienceYearsRequired) {
      status = "passed";
      detail =
        "Your years of experience align with the role's requirements. This is a positive start, but remember to carefully review all other job criteria to ensure you're a strong overall match before applying.";
    } else {
      status = "failed";
      detail = `Your years of experience (${resumeYears} yrs) do not align with the role's requirements (${jd.experienceYearsRequired} yrs). This is a negative start, but remember to carefully review all other job criteria to ensure you're a strong overall match before applying.`;
    }
  } else {
    status = "not-applicable";
    detail =
      "No years of experience requirement listed in the job description.";
  }

  const checks = [{ label: "Job level match", status, detail, weight: 20 }];
  return {
    key: "jobLevelMatch",
    title: "Job Level Match",
    score: scoreFromChecks(checks),
    weight: 20,
    summary: detail,
    checks,
  };
};

// ============================================================
// Measurable results
// ============================================================
const buildMeasurableSubgroup = (measurable: {
  count: number;
}): CategorySubgroup => {
  const score = measurableResultsScore(measurable.count);
  const status: CheckStatus = score >= 60 ? "passed" : "failed";

  const detail =
    measurable.count >= 5
      ? `We found ${measurable.count} measurable results (e.g., generated $100K in sales, managed 15 team members, increased efficiency by 25% etc) in experience section, which is great!`
      : measurable.count > 0
        ? `We found ${measurable.count} measurable results in experience section but it could be better. Use at least 5 measurable results (e.g., generated $100K in sales, managed 15 team members, increased efficiency by 25% etc) to stand out.`
        : "We couldn't find any measurable results in experience section. Use at least 5 measurable results (e.g., generated $100K in sales, managed 15 team members, increased efficiency by 25% etc) in your resume's experience section to stand out.";

  const checks = [
    { label: "Measurable results (5+)", status, detail, weight: 20 },
  ];

  return {
    key: "measurableResults",
    title: "Measurable Results",
    score,
    weight: 20,
    summary: detail,
    checks,
  };
};
// ============================================================
// Action verbs
// ============================================================
const buildActionVerbsSubgroup = (actionVerbs: {
  count: number;
}): CategorySubgroup => {
  const score = actionVerbsScore(actionVerbs.count);
  const status: CheckStatus = score >= 60 ? "passed" : "failed";

  const detail =
    actionVerbs.count >= 5
      ? `We found ${actionVerbs.count} action verbs (e.g. Developed, Implemented, Managed etc) in experience section, which is great!`
      : actionVerbs.count > 0
        ? `We found ${actionVerbs.count} action verbs in experience section but it could be better. Use at least 5 action verbs (e.g. Developed, Implemented, Managed etc) to stand out.`
        : "We couldn't find any action verbs in experience section. Use at least 5 action verbs (e.g. Developed, Implemented, Managed etc) in your resume's experience section to stand out.";

  const checks = [{ label: "Action verbs (5+)", status, detail, weight: 20 }];

  return {
    key: "actionVerbs",
    title: "Action Verbs",
    score,
    weight: 20,
    summary: detail,
    checks,
  };
};

// ============================================================
// Word count
// ============================================================
const countResumeWords = (resume: ResumeContent): number => {
  if (resume.wordCount) return Number(resume.wordCount) || 0;
  return toResumeText(resume).split(/\s+/).filter(Boolean).length;
};

const buildWordCountSubgroup = (wordCount: number): CategorySubgroup => {
  let status: CheckStatus;
  let detail: string;

  if (wordCount >= 100 && wordCount <= 1000) {
    status = "passed";
    detail = `There is ${wordCount} words in your resume, which is under the suggested limit of 1000 words and over the minimum of 100 words.`;
  } else if (wordCount < 100) {
    status = "failed";
    detail = `Resume is too short (${wordCount} words). Aim for at least 100 words so recruiters get enough detail.`;
  } else {
    status = "failed";
    detail = `Resume is too long (${wordCount} words). Keep it under 1000 words so it stays scannable.`;
  }

  const checks = [{ label: "Word count", status, detail, weight: 20 }];
  return {
    key: "wordCount",
    title: "Word Count",
    score: scoreFromChecks(checks),
    weight: 20,
    summary: `${wordCount} words total.`,
    checks,
  };
};

// ============================================================
// Build recruiter tips
// ============================================================
export const buildRecruiterTips = (
  resume: ResumeContent,
  jd: StructuredJD | null,
  resumeYears: number,
  measurable: { count: number },
  actionVerbs: { count: number },
): CategoryResult => {
  const wordCount = countResumeWords(resume);
  const subgroups = [
    buildSummarySubgroup(resume),
    buildJobLevelSubgroup(jd, resumeYears),
    buildMeasurableSubgroup(measurable),
    buildActionVerbsSubgroup(actionVerbs),
    buildWordCountSubgroup(wordCount),
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
