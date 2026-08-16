import {
  CategoryResult,
  CategoryCheck,
  CategorySubgroup,
  CheckStatus,
} from "./types";
import { CATEGORY_WEIGHTS, ATS_DATE_RE } from "./constants";
import { jobTitleMatches } from "./keywords";
import {
  scoreFromChecks,
  scoreFromSubgroups,
  deriveFeedback,
  collectResumeDates,
} from "./utils";
import { ResumeContent, StructuredJD } from "../types";

// ============================================================
// Contact Info
// ============================================================
const buildContactInfoSubgroup = (resume: ResumeContent): CategorySubgroup => {
  const contact = resume.personalInfo?.contact || {};
  const address = contact.address;
  const hasEmail = !!contact.email;
  const hasPhone = !!contact.phone || !!(resume.personalInfo as any)?.phone;
  const hasAddress =
    typeof address === "string"
      ? address.trim().length > 0
      : !!(address?.city || address?.state);

  const checks: CategoryCheck[] = [
    {
      label: "Physical address",
      status: hasAddress ? "passed" : "failed",
      detail: hasAddress
        ? "Your physical address is included, allowing recruiters to verify your location eligibility for role requirements."
        : "No physical address found. Adding your city and state helps recruiters assess location fit for your role.",
      weight: 10,
    },
    {
      label: "Email address",
      status: hasEmail ? "passed" : "failed",
      detail: hasEmail
        ? "You provided your email. Recruiters use your email to contact you for job matches."
        : "No email address found. This is a critical missing field—without it, recruiters cannot reach you for opportunities.",
      weight: 10,
    },
    {
      label: "Phone number",
      status: hasPhone ? "passed" : "failed",
      detail: hasPhone
        ? "You provided your phone number."
        : "No phone number found. You should include it.",
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

// ============================================================
// Section Headings
// ============================================================
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
        ? `Your resume includes an education section heading, which helps ATS systems properly identify and parse your academic credentials for better job matching.`
        : `Your resume is missing an education section heading. ATS systems rely on standard section labels to categorize your information correctly.`,
      weight: 10,
    },
    {
      label: "Experience section heading",
      status: hasExperience ? "passed" : "failed",
      detail: hasExperience
        ? `Your resume includes a recognized experience section heading, which helps ATS properly identify your work history.`
        : `Your resume is missing a recognized experience section heading. ATS systems rely on standard section labels to categorize your information correctly.`,
      weight: 10,
    },
    {
      label: "Work history found",
      status: hasExperience ? "passed" : "failed",
      detail: hasExperience
        ? `We found work history in your resume.`
        : "No work history found in your resume.",
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

// ============================================================
// Job title match
// ============================================================
const buildJobTitleSubgroup = (
  resumeText: string,
  jd: StructuredJD | null,
): CategorySubgroup => {
  const title = jd?.jobTitle || "";
  let status: CheckStatus;
  let detail = "";

  if (!title) {
    status = "failed";
    detail =
      "No job title detected from job description. Add a job title at the top of your provided job description.";
  } else {
    const hasMatch = jobTitleMatches(resumeText, title);
    status = hasMatch ? "passed" : "failed";
    detail = hasMatch
      ? `The job title "${title}" from the job description was found in your resume, indicating a strong match with the role you're applying for.`
      : `The job title "${title}" from the job description was not found in your resume. We recommend having the exact title of the job for which you're applying in your resume.`;
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
        : `Job title "${title}" not found.`,
    checks,
  };
};

// ============================================================
// Date Formatting
// ============================================================
const buildDateFormattingSubgroup = (
  resume: ResumeContent,
): CategorySubgroup => {
  const dates = collectResumeDates(resume);
  const bad = dates.filter((d) => !ATS_DATE_RE.test(d));

  let status: CheckStatus;
  let detail: string;
  if (!dates.length) {
    status = "failed";
    detail =
      "No dates found to check for ATS-friendly formats (e.g. 03/26, 03/2026, Mar 2026 or March 2026).";
  } else if (!bad.length) {
    status = "passed";
    detail =
      "All dates are properly formatted in ATS-friendly format (e.g. 03/26, 03/2026, Mar 2026 or March 2026).";
  } else {
    status = "failed";
    detail = `ATS and recruiters prefer specific date formatting for your work experience. Please use the following formats: “MM/YY or MM/YYYY or Month YYYY” (e.g. 03/26, 03/2026, Mar 2026 or March 2026).`;
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
        : "Dates missing or not ATS-friendly.",
    checks,
  };
};

// ============================================================
// Education Match
// ============================================================
const buildEducationMatchSubgroup = (
  jd: StructuredJD | null,
  eduScore: number,
): CategorySubgroup => {
  let status: CheckStatus = "not-applicable";
  let detail = "No education requirement listed.";

  if (jd?.education?.education_level) {
    if (eduScore >= 80) {
      status = "passed";
      detail = `Your education matches the preferred (Bachelor's, ged) education listed in the job description.`;
    } else {
      status = "failed";
      detail = `Your education doesn't match the preferred (Bachelor's, ged) education listed in the job description.`;
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
        : status === "not-applicable"
          ? "Not evaluated."
          : "Education doesn't meet JD requirements.",
    checks,
  };
};

// ============================================================
// Build
// ============================================================
export const buildSearchability = (
  resume: ResumeContent,
  resumeText: string,
  jd: StructuredJD | null,
  eduScore: number,
): CategoryResult => {
  const subgroups = [
    buildContactInfoSubgroup(resume),
    buildSectionHeadingsSubgroup(resume),
    buildJobTitleSubgroup(resumeText, jd),
    buildDateFormattingSubgroup(resume),
    buildEducationMatchSubgroup(jd, eduScore),
  ];

  const checks = subgroups.flatMap((s) => s.checks);
  const { strengths, improvements } = deriveFeedback(checks);
  const active = checks.filter((c) => c.status !== "not-applicable");
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
