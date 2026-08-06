import { ResumeContent, StructuredJD } from "../types";
import { CategoryResult, CheckStatus, MatchCategoryResult } from "./types";
import { CATEGORY_WEIGHTS } from "./constants";
import { scoreFromChecks, deriveFeedback } from "./utils";

export const buildHardSkills = (
  resume: ResumeContent,
  resumeHardSkills: string[],
  jd: StructuredJD | null,
  hardSkillsMatch: MatchCategoryResult,
): CategoryResult => {
  let checks = [
    {
      label: "Technical skills present",
      status:
        resumeHardSkills.length >= 5
          ? ("passed" as CheckStatus)
          : resumeHardSkills.length > 0
            ? ("partial" as CheckStatus)
            : ("failed" as CheckStatus),
      detail: `${resumeHardSkills.length} technical skill(s) identified.`,
      weight: 100,
    },
  ];
  let summary = `${resumeHardSkills.length} technical skills identified.`;
  let score =
    resumeHardSkills.length > 0
      ? Math.min(100, 55 + resumeHardSkills.length * 3)
      : 20;
  let matched: string[] = [];
  let missing: string[] = [];

  if (jd && hardSkillsMatch.items.length > 0) {
    matched = hardSkillsMatch.matched;
    missing = hardSkillsMatch.missing;
    score = hardSkillsMatch.score;
    const total = matched.length + missing.length;
    checks = [
      {
        label: "Required hard skills matched",
        status:
          missing.length === 0 ? "passed" : score >= 50 ? "partial" : "failed",
        detail: `${matched.length} of ${total} required technical skills found.`,
        weight: 100,
      },
      ...(missing.length > 0
        ? [
            {
              label: "Missing hard skills",
              status: "failed" as CheckStatus,
              detail: `Add: ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? "…" : ""}.`,
              weight: 0,
            },
          ]
        : []),
    ];
    summary = `${matched.length} of ${total} required technical skills matched.`;
  } else if (jd) {
    score = 0;
    missing = jd.hardSkills;
    checks = [
      {
        label: "Required hard skills matched",
        status: "failed" as CheckStatus,
        detail: "No job-required technical skills detected.",
        weight: 100,
      },
    ];
    summary = "No required technical skills found.";
  }

  const { strengths, improvements } = deriveFeedback(checks);
  return {
    key: "hardSkills",
    title: "Hard Skills",
    score,
    weight: CATEGORY_WEIGHTS.hardSkills,
    summary,
    checks,
    strengths,
    improvements,
    matched,
    missing,
  };
};

export const buildSoftSkills = (
  resume: ResumeContent,
  jd: StructuredJD | null,
  softSkillsMatch: MatchCategoryResult,
): CategoryResult => {
  const resumeSoft = (resume.softSkills || []).filter(Boolean);
  let checks = [
    {
      label: "Soft skills highlighted",
      status:
        resumeSoft.length > 0
          ? ("passed" as CheckStatus)
          : ("partial" as CheckStatus),
      detail:
        resumeSoft.length > 0
          ? `${resumeSoft.length} soft skill(s) highlighted.`
          : "No explicit soft skills section.",
      weight: 100,
    },
  ];
  let summary =
    resumeSoft.length > 0
      ? `${resumeSoft.length} soft skill(s) highlighted.`
      : "Soft skills not explicitly listed.";
  let score =
    resumeSoft.length > 0 ? Math.min(100, 60 + resumeSoft.length * 5) : 70;
  let matched: string[] = [];
  let missing: string[] = [];

  if (jd && softSkillsMatch.items.length > 0) {
    matched = softSkillsMatch.matched;
    missing = softSkillsMatch.missing;
    score = softSkillsMatch.score;
    const total = matched.length + missing.length;
    checks = [
      {
        label: "Soft skills matched",
        status:
          missing.length === 0 ? "passed" : score >= 50 ? "partial" : "failed",
        detail: `${matched.length} of ${total} soft skills found.`,
        weight: 100,
      },
    ];
    summary = `${matched.length} of ${total} expected soft skills found.`;
  } else if (jd) {
    score = 0;
    missing = jd.softSkills;
    checks = [
      {
        label: "Soft skills matched",
        status: "failed" as CheckStatus,
        detail: "No soft skills detected.",
        weight: 100,
      },
    ];
    summary = "No soft skills from JD detected.";
  }

  const { strengths, improvements } = deriveFeedback(checks);
  return {
    key: "softSkills",
    title: "Soft Skills",
    score,
    weight: CATEGORY_WEIGHTS.softSkills,
    summary,
    checks,
    strengths,
    improvements,
    matched,
    missing,
  };
};
