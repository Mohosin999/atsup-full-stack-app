import { ResumeContent } from "../types";
import { CategoryResult, CheckStatus } from "./types";
import { CATEGORY_WEIGHTS } from "./constants";
import { scoreFromChecks, deriveFeedback } from "./utils";

export const buildFormatting = (
  resume: ResumeContent,
  atsFriendliness: number,
): CategoryResult => {
  const summaryWords = (resume.summary || "")
    .split(/\s+/)
    .filter(Boolean).length;

  const hasExperience = (resume.experience || []).length > 0;
  const hasEducation = (resume.education || []).length > 0;
  const skillCount = (resume.skills || []).length;

  // NOTE: for formatting, maybe I don't need this structuralChecks
  const structuralChecks = [
    {
      label: "Standard sections present",
      status: (hasExperience && hasEducation && skillCount > 0
        ? "passed"
        : hasExperience || hasEducation
          ? "partial"
          : "failed") as CheckStatus,
      detail:
        hasExperience && hasEducation && skillCount > 0
          ? "Education, experience & skills sections detected."
          : "Add standard sections.",
      weight: 40,
    },
    {
      label: "Summary section",
      status: (summaryWords >= 30
        ? "passed"
        : summaryWords > 0
          ? "partial"
          : "failed") as CheckStatus,
      detail:
        summaryWords >= 30
          ? "Professional summary present."
          : summaryWords > 0
            ? "Summary present but short."
            : "No summary section.",
      weight: 10,
    },
    {
      label: "Skills section (5+)",
      status: (skillCount >= 5
        ? "passed"
        : skillCount > 0
          ? "partial"
          : "failed") as CheckStatus,
      detail:
        skillCount >= 5
          ? `${skillCount} skills listed.`
          : skillCount > 0
            ? `Only ${skillCount} skills listed.`
            : "No dedicated skills section.",
      weight: 30,
    },
    {
      label: "Work experience present",
      status: (hasExperience ? "passed" : "failed") as CheckStatus,
      detail: hasExperience
        ? "Work experience section detected."
        : "Work experience section missing.",
      weight: 20,
    },
  ];

  const fileChecks = [
    {
      label: "ATS-friendly fonts",
      status: "na" as CheckStatus,
      detail: "Requires original file analysis.",
      weight: 0,
    },
    {
      label: "No tables / text boxes",
      status: "na" as CheckStatus,
      detail: "Requires original file analysis.",
      weight: 0,
    },
    {
      label: "No icons / graphics",
      status: "na" as CheckStatus,
      detail: "Requires original file analysis.",
      weight: 0,
    },
    {
      label: "No profile photo",
      status: "na" as CheckStatus,
      detail: "Requires original file analysis.",
      weight: 0,
    },
  ];

  const checks = [...structuralChecks, ...fileChecks];
  const { strengths, improvements } = deriveFeedback(checks);

  return {
    key: "formatting",
    title: "Formatting / Layout",
    score: scoreFromChecks(checks),
    weight: CATEGORY_WEIGHTS.formatting,
    summary: `Structure is ${atsFriendliness >= 80 ? "clean" : atsFriendliness >= 60 ? "acceptable" : "weak"}. File-level layout needs original PDF.`,
    checks,
    strengths,
    improvements,
  };
};
