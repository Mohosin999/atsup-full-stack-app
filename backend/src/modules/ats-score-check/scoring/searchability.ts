import {
  CategoryResult,
  CategoryCheck,
  CategorySubgroup,
  CheckStatus,
} from "./types";
import { CATEGORY_WEIGHTS, ATS_DATE_RE } from "./constants";
import {
  scoreFromChecks,
  scoreFromSubgroups,
  deriveFeedback,
  collectResumeDates,
} from "./utils";
import { ResumeContent } from "../../../shared/types";
import { StructuredJD } from "../atsScoreCheck.types";

const buildContactInfoSubgroup = (resume: ResumeContent): CategorySubgroup => {
  const contact = resume.personalInfo?.contact || {};
  const address = contact.address;
  const hasEmail = !!contact.email;
  const hasPhone = !!contact.phone || !!(resume.personalInfo as any)?.phone;
  const hasAddress = !!(address?.city || address?.division || address?.zipCode);

  const checks: CategoryCheck[] = [
    {
      label: "Physical address",
      status: hasAddress ? "passed" : "failed",
      detail: hasAddress
        ? "You provided your physical address."
        : "No physical address found.",
      weight: 10,
    },
    {
      label: "Email address",
      status: hasEmail ? "passed" : "failed",
      detail: hasEmail ? "You provided your email." : "No email address found.",
      weight: 10,
    },
    {
      label: "Phone number",
      status: hasPhone ? "passed" : "failed",
      detail: hasPhone
        ? "You provided your phone number."
        : "No phone number found.",
      weight: 10,
    },
  ];

  const passed = checks.filter((c) => c.status === "passed").length;
  return {
    key: "contactInfo",
    title: "Contact Information",
    score: scoreFromChecks(checks),
    weight: 30,
    summary:
      passed === 3
        ? "Full contact information provided."
        : `${passed} of 3 contact details provided.`,
    checks,
  };
};

const buildSectionHeadingsSubgroup = (
  resume: ResumeContent,
): CategorySubgroup => {
  const educationCount = resume.education?.length || 0;
  const experienceCount = resume.experience?.length || 0;
  const hasEducation = educationCount > 0;
  const hasExperience = experienceCount > 0;

  const checks: CategoryCheck[] = [
    {
      label: "Education section",
      status: hasEducation ? "passed" : "failed",
      detail: hasEducation
        ? `${educationCount} education entr${educationCount === 1 ? "y" : "ies"} found.`
        : "No education section found.",
      weight: 10,
    },
    {
      label: "Experience section heading",
      status: hasExperience ? "passed" : "failed",
      detail: hasExperience
        ? "Work history section recognized."
        : "Name your experience section clearly.",
      weight: 10,
    },
    {
      label: "Work history found",
      status: hasExperience ? "passed" : "failed",
      detail: hasExperience
        ? `${experienceCount} position(s) found.`
        : "No work history found.",
      weight: 10,
    },
  ];

  const passed = checks.filter((c) => c.status === "passed").length;
  return {
    key: "sectionHeadings",
    title: "Section Headings",
    score: scoreFromChecks(checks),
    weight: 30,
    summary:
      passed === 3
        ? "All standard section headings recognized."
        : `${passed} of 3 section checks passed.`,
    checks,
  };
};

const buildJobTitleSubgroup = (
  resume: ResumeContent,
  resumeText: string,
  jd: StructuredJD | null,
): CategorySubgroup => {
  const title = jd?.jobTitle || "";
  let status: CheckStatus = "na";
  let detail = "";

  if (!title) {
    detail = "No job title detected from job description.";
  } else if (resumeText.includes(title)) {
    status = "passed";
    detail = `Your resume includes the job title "${title}".`;
  } else {
    status = "failed";
    detail = `The job title "${title}" from the JD was not found in your resume.`;
  }

  const checks: CategoryCheck[] = [
    { label: "Job title match", status, detail, weight: 20 },
  ];
  return {
    key: "jobTitleMatch",
    title: "Job Title Match",
    score: scoreFromChecks(checks),
    weight: 20,
    summary:
      status === "passed"
        ? `Job title "${title}" found.`
        : status === "na"
          ? "Not evaluated."
          : `Job title "${title}" not found.`,
    checks,
  };
};

const buildDateFormattingSubgroup = (
  resume: ResumeContent,
): CategorySubgroup => {
  const dates = collectResumeDates(resume);
  const bad = dates.filter((d) => !ATS_DATE_RE.test(d));

  let status: CheckStatus;
  let detail: string;
  if (!dates.length) {
    status = "failed";
    detail = "No dates found to validate.";
  } else if (!bad.length) {
    status = "passed";
    detail = "All dates use ATS-friendly formats.";
  } else {
    status = "partial";
    detail = `${bad.length} of ${dates.length} date(s) need updating (e.g. "${bad[0]}").`;
  }

  const checks: CategoryCheck[] = [
    { label: "Date formatting", status, detail, weight: 10 },
  ];
  return {
    key: "dateFormatting",
    title: "Date Formatting",
    score: scoreFromChecks(checks),
    weight: 10,
    summary:
      status === "passed"
        ? "All dates ATS-friendly."
        : status === "partial"
          ? `Some dates need updating (e.g. "${bad[0]}").`
          : "Dates missing or not ATS-friendly.",
    checks,
  };
};

const buildEducationMatchSubgroup = (
  jd: StructuredJD | null,
  eduScore: number,
): CategorySubgroup => {
  const requirementLabel = jd?.educationRequirement?.replace("|", ", ") || "";
  let status: CheckStatus = "na";
  let detail = "No education requirement listed.";

  if (jd?.educationRequirement) {
    if (eduScore >= 80) {
      status = "passed";
      detail = `Education matches the preferred (${requirementLabel}).`;
    } else if (eduScore >= 50) {
      status = "partial";
      detail = `Education partially matches (${requirementLabel}).`;
    } else {
      status = "failed";
      detail = `Education doesn't match (${requirementLabel}).`;
    }
  }

  const checks: CategoryCheck[] = [
    { label: "Education match", status, detail, weight: 10 },
  ];
  return {
    key: "educationMatch",
    title: "Education Match",
    score: scoreFromChecks(checks),
    weight: 10,
    summary:
      status === "passed"
        ? "Education matches JD."
        : status === "na"
          ? "Not evaluated."
          : "Education doesn't meet JD requirements.",
    checks,
  };
};

export const buildSearchability = (
  resume: ResumeContent,
  resumeText: string,
  jd: StructuredJD | null,
  eduScore: number,
): CategoryResult => {
  const subgroups = [
    buildContactInfoSubgroup(resume),
    buildSectionHeadingsSubgroup(resume),
    buildJobTitleSubgroup(resume, resumeText, jd),
    buildDateFormattingSubgroup(resume),
    buildEducationMatchSubgroup(jd, eduScore),
  ];

  const checks = subgroups.flatMap((s) => s.checks);
  const { strengths, improvements } = deriveFeedback(checks);
  const active = checks.filter((c) => c.status !== "na");
  const passed = active.filter((c) => c.status === "passed").length;

  return {
    key: "searchability",
    title: "Searchability",
    score: scoreFromSubgroups(subgroups),
    weight: CATEGORY_WEIGHTS.searchability,
    summary: `${passed} of ${active.length} searchability checks passed.`,
    checks,
    subgroups,
    strengths,
    improvements,
  };
};
