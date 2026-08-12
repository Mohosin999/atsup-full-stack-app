import { ResumeContent } from "../types";
import { CategoryResult, CategoryCheck, CategorySubgroup } from "./types";
import { CATEGORY_WEIGHTS } from "./constants";
import { scoreFromChecks, scoreFromSubgroups, deriveFeedback } from "./utils";

const check = (
  available: boolean,
  passed: boolean,
  passDetail: string,
  failDetail: string,
): { status: "passed" | "failed" | "not-applicable"; detail: string } => {
  if (!available) return { status: "not-applicable", detail: "Requires original file analysis." };
  return passed
    ? { status: "passed", detail: passDetail }
    : { status: "failed", detail: failDetail };
};

// ============================================================
// Layout
// ============================================================
const buildLayoutSubgroup = (resume: ResumeContent): CategorySubgroup => {
  const layout = resume.layout;

  const checks: CategoryCheck[] = [
    {
      label: "Single column layout",
      ...check(
        !!layout,
        layout?.isSingleColumn === true,
        "Single column layout detected.",
        "Use a single column layout for best ATS parsing.",
      ),
      weight: 32,
    },
    {
      label: "No multi-column layout",
      ...check(
        !!layout,
        layout?.hasMultiColumn !== true,
        "No multi-column layout detected.",
        "Avoid multi-column layout; ATS may misread the content.",
      ),
      weight: 18,
    },
    {
      label: "No tables / text boxes",
      ...check(
        !!layout,
        layout?.hasTables === false,
        "No tables or text boxes detected.",
        "Remove tables and text boxes; they break ATS parsing.",
      ),
      weight: 30,
    },
    {
      label: "No images / photos",
      ...check(
        !!layout,
        layout?.hasImages === false,
        "No images or photos detected.",
        "Remove images/photos; they are not parsed by ATS.",
      ),
      weight: 10,
    },
    {
      label: "No icons / graphics",
      ...check(
        !!layout,
        layout?.hasIcons === false,
        "No icons or graphics detected.",
        "Remove icons/graphics; they are not parsed by ATS.",
      ),
      weight: 10,
    },
  ];

  const passed = checks.filter((c) => c.status === "passed").length;
  return {
    key: "layout",
    title: "Layout",
    score: scoreFromChecks(checks),
    weight: 60,
    summary:
      passed === checks.length
        ? "Clean single-column layout."
        : `${passed} of ${checks.length} layout checks passed.`,
    checks,
  };
};

// ============================================================
// Font
// ============================================================
const buildFontSubgroup = (resume: ResumeContent): CategorySubgroup => {
  const font = resume.fontCheck;

  const checks: CategoryCheck[] = [
    {
      label: "ATS-friendly font",
      ...check(
        !!font,
        font?.isStandardFont === true,
        font?.fontName
          ? `Standard font detected (${font.fontName}).`
          : "Standard/ATS-friendly font detected.",
        "Use a standard ATS-friendly font (Arial, Calibri, Times New Roman, etc.).",
      ),
      weight: 50,
    },
    {
      label: "Font name identified",
      ...check(
        !!font,
        !!font?.fontName,
        font?.fontName
          ? `Font name identified (${font.fontName}).`
          : "Font name identified.",
        "Font name could not be identified from the resume.",
      ),
      weight: 20,
    },
    {
      label: "Readable font size",
      ...check(
        !!font,
        font?.isReadableSize === true,
        "Readable font size detected.",
        "Use a readable font size (10-12pt body, 14-16pt headings).",
      ),
      weight: 30,
    },
  ];

  const passed = checks.filter((c) => c.status === "passed").length;
  return {
    key: "font",
    title: "Font",
    score: scoreFromChecks(checks),
    weight: 40,
    summary:
      passed === checks.length
        ? "ATS-friendly fonts used."
        : `${passed} of ${checks.length} font checks passed.`,
    checks,
  };
};

// ============================================================
// Build
// ============================================================
export const buildFormatting = (
  resume: ResumeContent,
  atsFriendliness: number,
): CategoryResult => {
  const subgroups = [buildLayoutSubgroup(resume), buildFontSubgroup(resume)];

  const checks = subgroups.flatMap((s) => s.checks);
  const { strengths, improvements } = deriveFeedback(checks);

  return {
    key: "formatting",
    title: "Formatting",
    score: scoreFromSubgroups(subgroups),
    weight: CATEGORY_WEIGHTS.formatting,
    summary: `Structure is ${atsFriendliness >= 80 ? "clean" : atsFriendliness >= 60 ? "acceptable" : "weak"}. Layout and font analysis based on resume file.`,
    checks,
    subgroups,
    strengths,
    improvements,
  };
};