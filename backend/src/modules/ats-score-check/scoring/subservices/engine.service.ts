// import { ResumeContent } from "../../../../shared/types";
// import { StructuredJD } from "../../atsScoreCheck.types";
// import {
//   extractSkillsFromResume,
//   getSkillVariants,
//   countVariantsInText,
//   matchActionVerbs,
//   countActionVerbInText,
// } from "./keyword.service";

// export interface LocalSectionScore {
//   score: number;
//   feedback: string;
// }

// export interface LocalSpellingError {
//   type: "spelling" | "grammar" | "punctuation" | "formatting" | "redundancy";
//   message: string;
//   suggestion: string;
// }

// export type MatchStatus = "matched" | "partial" | "missing";

// export interface MatchItemResult {
//   item: string;
//   status: MatchStatus;
//   jdCount: number;
//   resumeCount: number;
// }

// export interface MatchCategoryResult {
//   score: number;
//   matched: string[];
//   partial: string[];
//   missing: string[];
//   items: MatchItemResult[];
// }

// // ============================================================================
// // 5-category ATS scoring (Searchability 30% / Hard Skills 35% / Soft Skills
// // 15% / Recruiter Tips 10% / Formatting 10%)
// // ============================================================================

// export type CheckStatus = "passed" | "partial" | "failed" | "na";

// export interface CategoryCheck {
//   label: string;
//   status: CheckStatus;
//   detail: string;
//   weight: number;
// }

// export interface CategoryResult {
//   key: string;
//   title: string;
//   score: number;
//   weight: number;
//   summary: string;
//   checks: CategoryCheck[];
//   strengths: string[];
//   improvements: string[];
//   subgroups?: CategorySubgroup[];
//   matched?: string[];
//   missing?: string[];
// }

// export interface CategorySubgroup {
//   key: string;
//   title: string;
//   score: number;
//   weight: number;
//   summary: string;
//   checks: CategoryCheck[];
// }

// export interface CategoriesResult {
//   searchability: CategoryResult;
//   hardSkills: CategoryResult;
//   softSkills: CategoryResult;
//   recruiterTips: CategoryResult;
//   formatting: CategoryResult;
// }

// export const CATEGORY_WEIGHTS = {
//   searchability: 30,
//   hardSkills: 35,
//   softSkills: 15,
//   recruiterTips: 10,
//   formatting: 10,
// };

// export interface LocalAtsResult {
//   overallScore: number;
//   categories: CategoriesResult;
//   sectionScores: {
//     summary: LocalSectionScore & { wordCount?: number };
//     experience: LocalSectionScore;
//     projects: LocalSectionScore;
//     skills: LocalSectionScore;
//     contactInfo: LocalSectionScore & { hasContactInfo: boolean };
//     measurableResults: LocalSectionScore & { count: number; found: string[] };
//   };
//   spellingGrammar: {
//     score: number;
//     errors: LocalSpellingError[];
//   };
//   atsFriendliness: number;
//   suggestions: string[];
//   matchBreakdown?: {
//     hardSkills: MatchCategoryResult;
//     softSkills: MatchCategoryResult;
//     actionVerbs: MatchCategoryResult;
//   };
// }

// const toResumeText = (resume: ResumeContent): string => {
//   const parts: string[] = [];

//   if (resume.personalInfo?.fullName) parts.push(resume.personalInfo.fullName);
//   if (resume.personalInfo?.jobTitle) parts.push(resume.personalInfo.jobTitle);
//   if (resume.summary) parts.push(resume.summary);

//   (resume.experience || []).forEach((exp) => {
//     parts.push(`${exp.title || ""} at ${exp.company || ""}`);
//     parts.push((exp.highlights || []).join(" "));
//   });

//   parts.push((resume.skills || []).join(" "));
//   if (resume.hardSkills?.length) parts.push(resume.hardSkills.join(" "));
//   if (resume.softSkills?.length) parts.push(resume.softSkills.join(" "));
//   if (resume.keywords?.length) parts.push(resume.keywords.join(" "));
//   if (resume.actionVerbs?.length) parts.push(resume.actionVerbs.join(" "));

//   (resume.projects || []).forEach((proj) => {
//     parts.push(`${proj.name || ""}: ${(proj.highlights || []).join(" ")}`);
//   });

//   (resume.education || []).forEach((edu) => {
//     parts.push(`${edu.degree || ""} from ${edu.institution || ""}`);
//   });

//   return parts.filter(Boolean).join("\n");
// };

// const buildMatchCategory = (
//   resumeText: string,
//   items: string[],
//   isPresent: (text: string, item: string) => boolean,
// ): MatchCategoryResult => {
//   if (!items || items.length === 0) {
//     return { score: 0, matched: [], partial: [], missing: [], items: [] };
//   }

//   const results = items.map((item) => {
//     const present = isPresent(resumeText, item);
//     const status: MatchStatus = present ? "matched" : "missing";
//     return {
//       item,
//       status,
//       jdCount: 1,
//       resumeCount: present ? 1 : 0,
//       itemScore: present ? 100 : 0,
//     };
//   });

//   const score = Math.round(
//     results.reduce((sum, r) => sum + r.itemScore, 0) / results.length,
//   );

//   return {
//     score,
//     matched: results.filter((r) => r.status === "matched").map((r) => r.item),
//     partial: [],
//     missing: results.filter((r) => r.status === "missing").map((r) => r.item),
//     items: results.map(({ item, status, jdCount, resumeCount }) => ({
//       item,
//       status,
//       jdCount,
//       resumeCount,
//     })),
//   };
// };

// const educationScore = (
//   resume: ResumeContent,
//   educationRequirement: StructuredJD["educationRequirement"],
// ): number => {
//   const eduText = (resume.education || [])
//     .map((edu) => `${edu.degree} ${edu.institution}`)
//     .join(" ")
//     .toLowerCase();

//   if (!educationRequirement) return 70;

//   const parts = educationRequirement
//     .split("|")
//     .map((p) => p.trim().toLowerCase())
//     .filter(Boolean);

//   if (parts.length === 0) return 70;

//   let matchedParts = 0;
//   parts.forEach((part) => {
//     const keywords = part
//       .replace(/['’]s\b/g, "")
//       .split(/\s+/)
//       .filter((word) => word.length > 2);

//     if (keywords.length === 0) {
//       if (eduText.includes(part)) matchedParts++;
//       return;
//     }

//     if (keywords.some((word) => eduText.includes(word))) matchedParts++;
//   });

//   if (matchedParts >= parts.length) return 100;
//   if (matchedParts >= 1) return 70;
//   return 30;
// };

// const calculateYearsOfExperience = (resume: ResumeContent): number => {
//   let totalMonths = 0;
//   (resume.experience || []).forEach((exp) => {
//     if (!exp.startDate) return;
//     const start = new Date(exp.startDate);
//     const end =
//       exp.current || !exp.endDate ? new Date() : new Date(exp.endDate);
//     if (isNaN(start.getTime()) || isNaN(end.getTime())) return;
//     totalMonths += Math.max(
//       0,
//       (end.getFullYear() - start.getFullYear()) * 12 +
//         (end.getMonth() - start.getMonth()),
//     );
//   });
//   return Math.round(totalMonths / 12);
// };

// const experienceYearsScore = (
//   resumeYears: number,
//   requiredYears: number,
// ): number => {
//   if (requiredYears <= 0) return 70;
//   if (resumeYears >= requiredYears) return 100;
//   if (resumeYears >= requiredYears * 0.8) return 80;
//   if (resumeYears >= requiredYears * 0.6) return 60;
//   if (resumeYears >= requiredYears * 0.4) return 40;
//   return 20;
// };

// const countMeasurableResults = (
//   resume: ResumeContent,
// ): { count: number; found: string[] } => {
//   const highlights = (resume.experience || [])
//     .flatMap((exp) => exp.highlights || [])
//     .filter((h: string) => /\d+%|\d+x|\$|\d+\s*(?:hours?|hrs?|days?|weeks?|months?|years?)/i.test(h));

//   const found = highlights.slice(0, 5);
//   return { count: highlights.length, found };
// };

// const measurableResultsScore = (count: number): number => {
//   if (count >= 5) return 100;
//   return Math.round((count / 5) * 100);
// };

// const checkSpellingGrammar = (text: string): { score: number; errors: LocalSpellingError[] } => {
//   const errors: LocalSpellingError[] = [];

//   const repeated = text.match(/\b([a-zA-Z]{3,})\s+\1\b/g);
//   if (repeated) {
//     repeated.slice(0, 10).forEach((match) => {
//       errors.push({
//         type: "grammar",
//         message: `Repeated word detected: "${match}"`,
//         suggestion: "Remove the duplicated word.",
//       });
//     });
//   }

//   const doubleSpaces = text.match(/[.!?]\s{3,}[A-Z]/g);
//   if (doubleSpaces) {
//     doubleSpaces.slice(0, 5).forEach(() => {
//       errors.push({
//         type: "punctuation",
//         message: "Multiple consecutive spaces found after punctuation.",
//         suggestion: "Use a single space after punctuation.",
//       });
//     });
//   }

//   return {
//     score: errors.length === 0 ? 100 : Math.max(60, 100 - errors.length * 8),
//     errors,
//   };
// };

// // ============================================================================
// // 5-category builders
// // ============================================================================

// const scoreFromChecks = (checks: CategoryCheck[]): number => {
//   let earned = 0;
//   let total = 0;
//   checks.forEach((c) => {
//     if (c.status === "na" || c.weight <= 0) return;
//     total += c.weight;
//     if (c.status === "passed") earned += c.weight;
//     else if (c.status === "partial") earned += c.weight * 0.5;
//   });
//   return total === 0 ? 0 : Math.round((earned / total) * 100);
// };

// const deriveFeedback = (checks: CategoryCheck[]) => {
//   const strengths: string[] = [];
//   const improvements: string[] = [];
//   checks.forEach((c) => {
//     if (c.status === "na") return;
//     if (c.status === "passed") strengths.push(c.detail);
//     else improvements.push(`${c.label}: ${c.detail}`);
//   });
//   return { strengths, improvements };
// };

// const TITLE_STOPWORDS = new Set([
//   "the", "and", "for", "with", "of", "in", "on", "at", "to", "a", "an",
//   "is", "role", "position", "opportunity", "job", "engineer", "developer",
//   "specialist", "lead", "senior", "junior", "entry", "level",
// ]);

// // Role nouns that show up in job descriptions but are not action verbs.
// const ROLE_NOUNS = /\b(engineer|developer|designer|manager|director|specialist|analyst|consultant|architect|scientist|researcher|writer|tester|coordinator|administrator|officer|executive|lead)\b/i;

// const ATS_DATE_RE =
//   /^(present|current|now|ongoing|\d{1,2}\/\d{2}(\d{2})?|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s?\d{4})$/i;

// const collectResumeDates = (resume: ResumeContent): string[] => {
//   const dates: string[] = [];
//   const push = (raw?: string) => {
//     if (!raw) return;
//     raw
//       .split(/\s*(?:–|-|to)\s*/i)
//       .map((p) => p.trim())
//       .filter(Boolean)
//       .forEach((p) => dates.push(p));
//   };
//   (resume.experience || []).forEach((exp) => {
//     push(exp.startDate);
//     if (!exp.current) push(exp.endDate);
//   });
//   (resume.projects || []).forEach((proj) => {
//     push(proj.startDate);
//     if (!proj.current) push(proj.endDate);
//   });
//   (resume.education || []).forEach((edu) => push((edu as any).date));
//   return dates;
// };

// // ============================================================================
// // Searchability sub-groups (Contact Information / Section Headings / Job Title
// // Match / Date Formatting / Education Match). Each sub-group is worth a share
// // of the 100 Searchability points; a sub-group scores 100 when every check
// // inside it passes.
// // ============================================================================

// const scoreFromSubgroups = (subgroups: CategorySubgroup[]): number => {
//   let earned = 0;
//   let total = 0;
//   subgroups.forEach((s) => {
//     total += s.weight;
//     earned += (s.score / 100) * s.weight;
//   });
//   return total === 0 ? 0 : Math.round((earned / total) * 100);
// };

// const buildContactInfoSubgroup = (resume: ResumeContent): CategorySubgroup => {
//   const contact = resume.personalInfo?.contact || {};
//   const address: any = contact.address;
//   const hasEmail = !!contact.email;
//   const hasPhone = !!contact.phone || !!(resume.personalInfo as any)?.phone;
//   const hasAddress =
//     typeof address === "string"
//       ? address.trim().length > 0
//       : !!(address && (address.city || address.division || address.zipCode));

//   const checks: CategoryCheck[] = [
//     {
//       label: "Physical address",
//       status: hasAddress ? "passed" : "failed",
//       detail: hasAddress
//         ? "You provided your physical address. Recruiters use your address to validate your location for job matches."
//         : "No physical address found. Add your city and region so recruiters can validate your location for job matches.",
//       weight: 10,
//     },
//     {
//       label: "Email address",
//       status: hasEmail ? "passed" : "failed",
//       detail: hasEmail
//         ? "You provided your email. Recruiters use your email to contact you for job matches."
//         : "No email address found. Recruiters use your email to contact you for job matches.",
//       weight: 10,
//     },
//     {
//       label: "Phone number",
//       status: hasPhone ? "passed" : "failed",
//       detail: hasPhone
//         ? "You provided your phone number."
//         : "No phone number found. Recruiters use your phone number to contact you for job matches.",
//       weight: 10,
//     },
//   ];

//   const passed = checks.filter((c) => c.status === "passed").length;
//   return {
//     key: "contactInfo",
//     title: "Contact Information",
//     score: scoreFromChecks(checks),
//     weight: 30,
//     summary:
//       passed === 3
//         ? "Full contact information — physical address, email and phone number all provided."
//         : `${passed} of 3 contact details provided (physical address, email, phone number).`,
//     checks,
//   };
// };

// const buildSectionHeadingsSubgroup = (resume: ResumeContent): CategorySubgroup => {
//   const educationCount = (resume.education || []).length;
//   const experienceCount = (resume.experience || []).length;
//   const hasEducation = educationCount > 0;
//   const hasExperience = experienceCount > 0;

//   const checks: CategoryCheck[] = [
//     {
//       label: "Education section",
//       status: hasEducation ? "passed" : "failed",
//       detail: hasEducation
//         ? `We found ${educationCount} education entr${educationCount === 1 ? "y" : "ies"} in your resume.`
//         : 'We couldn\'t find an "Education" section in your resume. Ensure your resume includes an education section labeled as "Education" to ensure ATS can accurately recognize your academic qualifications.',
//       weight: 10,
//     },
//     {
//       label: "Experience section heading",
//       status: hasExperience ? "passed" : "failed",
//       detail: hasExperience
//         ? 'Your experience section is named "Work History" or "Professional Experience" so ATS can recognize work sections.'
//         : 'Name your experience section "Work History" or "Professional Experience" for ATS to recognize work sections.',
//       weight: 10,
//     },
//     {
//       label: "Work history found",
//       status: hasExperience ? "passed" : "failed",
//       detail: hasExperience
//         ? `We found work history in your resume (${experienceCount} position${experienceCount === 1 ? "" : "s"}).`
//         : "We couldn't find any work history in your resume.",
//       weight: 10,
//     },
//   ];

//   const passed = checks.filter((c) => c.status === "passed").length;
//   return {
//     key: "sectionHeadings",
//     title: "Section Headings",
//     score: scoreFromChecks(checks),
//     weight: 30,
//     summary:
//       passed === 3
//         ? "All standard section headings recognized — education and work history."
//         : `${passed} of 3 section checks passed.`,
//     checks,
//   };
// };

// const buildJobTitleSubgroup = (
//   resume: ResumeContent,
//   resumeText: string,
//   jd: StructuredJD | null,
// ): CategorySubgroup => {
//   let status: CheckStatus;
//   let detail: string;
//   let title = "";
//   if (!jd?.jobTitle) {
//     status = "na";
//     detail = "No job title could be detected from the job description — job title match not evaluated.";
//   } else {
//     title = jd.jobTitle;
//     const hasExactTitle = resumeText.includes(title);
//     if (hasExactTitle) {
//       status = "passed";
//       detail = `Your resume includes the job title "${title}".`;
//     } else {
//       status = "failed";
//       detail = `The job title '${title}' from the job description was not found in your resume. We recommend having the exact title of the job for which you're applying in your resume. This ensures you'll be found when a recruiter searches by job title. If you haven't held this position before, include it as part of your summary statement.`;
//     }
//   }

//   const checks: CategoryCheck[] = [
//     { label: "Job title match", status, detail, weight: 20 },
//   ];

//   const score = scoreFromChecks(checks);
//   return {
//     key: "jobTitleMatch",
//     title: "Job Title Match",
//     score,
//     weight: 20,
//     summary:
//       status === "passed"
//         ? `Your resume contains the job title "${title}".`
//         : status === "na"
//           ? "Job title match not evaluated (no job title detected in the job description)."
//           : `The job title "${title}" from the job description was not found in your resume.`,
//     checks,
//   };
// };

// const buildDateFormattingSubgroup = (resume: ResumeContent): CategorySubgroup => {
//   const dates = collectResumeDates(resume);
//   const bad = dates.filter((d) => !ATS_DATE_RE.test(d));
//   let status: CheckStatus;
//   let detail: string;
//   if (dates.length === 0) {
//     status = "failed";
//     detail = 'ATS and recruiters prefer specific date formatting for your work experience. Please use the following formats: "MM/YY or MM/YYYY or Month YYYY" (e.g. 03/19, 03/2019, Mar 2019 or March 2019). No dates were found to validate.';
//   } else if (bad.length === 0) {
//     status = "passed";
//     detail = "Your work experience dates use ATS-friendly formats such as MM/YY, MM/YYYY or Month YYYY.";
//   } else {
//     status = "partial";
//     detail = `ATS and recruiters prefer specific date formatting for your work experience. Please use the following formats: "MM/YY or MM/YYYY or Month YYYY" (e.g. 03/19, 03/2019, Mar 2019 or March 2019). ${bad.length} of ${dates.length} date(s) need updating (e.g. "${bad[0]}").`;
//   }

//   const checks: CategoryCheck[] = [
//     { label: "Date formatting", status, detail, weight: 10 },
//   ];

//   return {
//     key: "dateFormatting",
//     title: "Date Formatting",
//     score: scoreFromChecks(checks),
//     weight: 10,
//     summary:
//       status === "passed"
//         ? `All ${dates.length} date(s) use ATS-preferred formats.`
//         : status === "partial"
//           ? `Some dates (e.g. "${bad[0]}") are not in an ATS-friendly format.`
//           : "Work dates are missing or not in an ATS-friendly format.",
//     checks,
//   };
// };

// const buildEducationMatchSubgroup = (
//   jd: StructuredJD | null,
//   eduScore: number,
// ): CategorySubgroup => {
//   let status: CheckStatus;
//   let detail: string;
//   let requirementLabel = "";
//   if (!jd?.educationRequirement) {
//     status = "na";
//     detail = "No education requirement listed in the job description.";
//   } else {
//     requirementLabel = jd.educationRequirement.replace("|", ", ");
//     if (eduScore >= 80) {
//       status = "passed";
//       detail = `Your education matches the preferred (${requirementLabel}) education listed in the job description.`;
//     } else if (eduScore >= 50) {
//       status = "partial";
//       detail = `Your education partially matches the preferred (${requirementLabel}) education listed in the job description.`;
//     } else {
//       status = "failed";
//       detail = `Your education doesn't match the preferred (${requirementLabel}) education listed in the job description.`;
//     }
//   }

//   const checks: CategoryCheck[] = [
//     { label: "Education match", status, detail, weight: 10 },
//   ];

//   return {
//     key: "educationMatch",
//     title: "Education Match",
//     score: scoreFromChecks(checks),
//     weight: 10,
//     summary:
//       status === "passed"
//         ? `Your education matches the preferred (${requirementLabel}) education listed in the job description.`
//         : status === "na"
//           ? "Education match not evaluated (no education requirement in the job description)."
//           : `Your education doesn't meet the preferred (${requirementLabel}) education listed in the job description.`,
//     checks,
//   };
// };

// const buildSearchability = (
//   resume: ResumeContent,
//   resumeText: string,
//   jd: StructuredJD | null,
//   eduScore: number,
// ): CategoryResult => {
//   const subgroups = [
//     buildContactInfoSubgroup(resume),
//     buildSectionHeadingsSubgroup(resume),
//     buildJobTitleSubgroup(resume, resumeText, jd),
//     buildDateFormattingSubgroup(resume),
//     buildEducationMatchSubgroup(jd, eduScore),
//   ];

//   const checks = subgroups.flatMap((s) => s.checks);
//   const { strengths, improvements } = deriveFeedback(checks);
//   const active = checks.filter((c) => c.status !== "na");
//   const passed = active.filter((c) => c.status === "passed").length;

//   return {
//     key: "searchability",
//     title: "Searchability",
//     score: scoreFromSubgroups(subgroups),
//     weight: CATEGORY_WEIGHTS.searchability,
//     summary: `Recruiters & ATS can find your resume — ${passed} of ${active.length} searchability checks passed.`,
//     checks,
//     subgroups,
//     strengths,
//     improvements,
//   };
// };

// const buildHardSkills = (
//   resume: ResumeContent,
//   resumeHardSkills: string[],
//   jd: StructuredJD | null,
//   hardSkillsMatch: MatchCategoryResult,
// ): CategoryResult => {
//   let checks: CategoryCheck[];
//   let matched: string[] = [];
//   let missing: string[] = [];
//   let summary: string;
//   let score: number;

//   if (jd && hardSkillsMatch.items.length > 0) {
//     matched = hardSkillsMatch.matched;
//     missing = hardSkillsMatch.missing;
//     score = hardSkillsMatch.score;
//     const total = matched.length + missing.length;
//     checks = [
//       {
//         label: "Required hard skills matched",
//         status: missing.length === 0 ? "passed" : score >= 50 ? "partial" : "failed",
//         detail: `${matched.length} of ${total} required technical skills found.`,
//         weight: 100,
//       },
//       ...(missing.length > 0
//         ? [
//             {
//               label: "Missing hard skills",
//               status: "failed" as CheckStatus,
//               detail: `Add: ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? "…" : ""}.`,
//               weight: 0,
//             },
//           ]
//         : []),
//     ];
//     summary = `${matched.length} of ${total} required technical skills matched the job description.`;
//   } else if (jd) {
//     score = 0;
//     matched = [];
//     missing = jd.hardSkills;
//     checks = [
//       {
//         label: "Required hard skills matched",
//         status: "failed",
//         detail: "No job-required technical skills detected on the resume.",
//         weight: 100,
//       },
//     ];
//     summary = "No required technical skills from the job description were found.";
//   } else {
//     score = resumeHardSkills.length > 0 ? Math.min(100, 55 + resumeHardSkills.length * 3) : 20;
//     checks = [
//       {
//         label: "Technical skills present",
//         status: resumeHardSkills.length >= 5 ? "passed" : resumeHardSkills.length > 0 ? "partial" : "failed",
//         detail: `${resumeHardSkills.length} technical skill(s) identified on resume.`,
//         weight: 100,
//       },
//     ];
//     summary = `${resumeHardSkills.length} technical skills identified. Add more relevant tools & technologies.`;
//   }

//   const { strengths, improvements } = deriveFeedback(checks);
//   return {
//     key: "hardSkills",
//     title: "Hard Skills",
//     score,
//     weight: CATEGORY_WEIGHTS.hardSkills,
//     summary,
//     checks,
//     strengths,
//     improvements,
//     matched,
//     missing,
//   };
// };

// const buildSoftSkills = (
//   resume: ResumeContent,
//   jd: StructuredJD | null,
//   softSkillsMatch: MatchCategoryResult,
// ): CategoryResult => {
//   let checks: CategoryCheck[];
//   let matched: string[] = [];
//   let missing: string[] = [];
//   let summary: string;
//   let score: number;

//   if (jd && softSkillsMatch.items.length > 0) {
//     matched = softSkillsMatch.matched;
//     missing = softSkillsMatch.missing;
//     score = softSkillsMatch.score;
//     const total = matched.length + missing.length;
//     checks = [
//       {
//         label: "Soft skills matched",
//         status: missing.length === 0 ? "passed" : score >= 50 ? "partial" : "failed",
//         detail: `${matched.length} of ${total} soft skills from the job description found.`,
//         weight: 100,
//       },
//     ];
//     summary = `${matched.length} of ${total} expected soft skills found (e.g. communication, leadership).`;
//   } else if (jd) {
//     score = 0;
//     matched = [];
//     missing = jd.softSkills;
//     checks = [
//       {
//         label: "Soft skills matched",
//         status: "failed",
//         detail: "No soft skills from the job description detected.",
//         weight: 100,
//       },
//     ];
//     summary = "No soft skills from the job description were detected on the resume.";
//   } else {
//     const resumeSoft = (resume.softSkills || []).filter(Boolean);
//     score = resumeSoft.length > 0 ? Math.min(100, 60 + resumeSoft.length * 5) : 70;
//     checks = [
//       {
//         label: "Soft skills highlighted",
//         status: resumeSoft.length > 0 ? "passed" : "partial",
//         detail: resumeSoft.length > 0
//           ? `${resumeSoft.length} soft skill(s) highlighted (${resumeSoft.slice(0, 5).join(", ")}).`
//           : "No explicit soft skills section. Consider adding communication, teamwork, leadership.",
//         weight: 100,
//       },
//     ];
//     summary = resumeSoft.length > 0
//       ? `${resumeSoft.length} soft skill(s) highlighted on the resume.`
//       : "Soft skills not explicitly listed — add a soft skills section.";
//   }

//   const { strengths, improvements } = deriveFeedback(checks);
//   return {
//     key: "softSkills",
//     title: "Soft Skills",
//     score,
//     weight: CATEGORY_WEIGHTS.softSkills,
//     summary,
//     checks,
//     strengths,
//     improvements,
//     matched,
//     missing,
//   };
// };

// // ============================================================================
// // Recruiter Tips sub-groups (Summary / Job Level Match / Measurable Results /
// // Action Verbs). Each sub-group is worth a share of the 100 Recruiter Tips
// // points; a sub-group scores 100 when every check inside it passes.
// // ============================================================================

// const buildSummarySubgroup = (resume: ResumeContent): CategorySubgroup => {
//   const summaryWords = (resume.summary || "").split(/\s+/).filter(Boolean).length;

//   const checks: CategoryCheck[] = [
//     {
//       label: "Summary section",
//       status:
//         summaryWords >= 30 ? "passed" : summaryWords > 0 ? "partial" : "failed",
//       detail:
//         summaryWords >= 30
//           ? "We found a summary section on your resume. Good job! The summary provides a quick overview of the candidate's qualifications, helping recruiters and hiring managers promptly grasp the value the candidate can offer in the position."
//           : summaryWords > 0
//             ? `We found a summary section on your resume, but it is only ${summaryWords} words. Expand it to at least 30 words so recruiters and hiring managers can promptly grasp the value you can offer in the position.`
//             : "We couldn't find a summary section on your resume. Consider adding a summary that provides a quick overview of your qualifications, helping recruiters and hiring managers promptly grasp the value you can offer in the position.",
//       weight: 30,
//     },
//   ];

//   return {
//     key: "summary",
//     title: "Summary",
//     score: scoreFromChecks(checks),
//     weight: 30,
//     summary:
//       summaryWords >= 30
//         ? `Summary present (${summaryWords} words).`
//         : summaryWords > 0
//           ? `Summary too short (${summaryWords} words) — expand to 30+.`
//           : "No summary section found.",
//     checks,
//   };
// };

// const buildJobLevelSubgroup = (
//   jd: StructuredJD | null,
//   resumeYears: number,
// ): CategorySubgroup => {
//   let status: CheckStatus;
//   let detail: string;
//   if (jd && jd.experienceYearsRequired > 0) {
//     if (resumeYears >= jd.experienceYearsRequired) {
//       status = "passed";
//       detail = "Your years of experience align with the role's requirements. This is a positive start, but remember to carefully review all other job criteria to ensure you're a strong overall match before applying.";
//     } else if (resumeYears >= jd.experienceYearsRequired * 0.6) {
//       status = "partial";
//       detail = `Your years of experience (${resumeYears} yrs) are close to the role's requirement of ${jd.experienceYearsRequired}+ yrs. Remember to carefully review all other job criteria to ensure you're a strong overall match before applying.`;
//     } else {
//       status = "failed";
//       detail = `Your years of experience (${resumeYears} yrs) don't align with the role's requirement of ${jd.experienceYearsRequired}+ yrs. Consider highlighting transferable experience or relevant projects to strengthen your candidacy.`;
//     }
//   } else {
//     status = resumeYears >= 1 ? "passed" : "failed";
//     detail =
//       resumeYears >= 1
//         ? `Your years of experience (${resumeYears} yrs) show relevant work history. This is a positive start.`
//         : "We couldn't verify your years of experience. Add clear dates to your work experience so recruiters can validate your job level.";
//   }

//   const checks: CategoryCheck[] = [
//     { label: "Job level match", status, detail, weight: 30 },
//   ];

//   return {
//     key: "jobLevelMatch",
//     title: "Job Level Match",
//     score: scoreFromChecks(checks),
//     weight: 30,
//     summary:
//       status === "passed"
//         ? "Your experience aligns with the role's requirements."
//         : status === "partial"
//           ? "Your experience is close to the role's requirements."
//           : "Your experience doesn't align with the role's requirements.",
//     checks,
//   };
// };

// const buildMeasurableSubgroup = (
//   measurable: { count: number },
// ): CategorySubgroup => {
//   const checks: CategoryCheck[] = [
//     {
//       label: "Measurable results (5+)",
//       status:
//         measurable.count >= 5
//           ? "passed"
//           : measurable.count > 0
//             ? "partial"
//             : "failed",
//       detail:
//         measurable.count >= 5
//           ? `We found ${measurable.count} mentions of measurable results in your resume. Great job! Specific achievements like time saved or increases in sales help recruiters see the impact you can bring.`
//           : measurable.count > 0
//             ? `We found ${measurable.count} mentions of measurable results in your resume. Consider adding at least 5 specific achievements or impact you had in your job (e.g. time saved, increase in sales, etc).`
//             : "We found 0 mentions of measurable results in your resume. Consider adding at least 5 specific achievements or impact you had in your job (e.g. time saved, increase in sales, etc).",
//       weight: 20,
//     },
//   ];

//   return {
//     key: "measurableResults",
//     title: "Measurable Results",
//     score: scoreFromChecks(checks),
//     weight: 20,
//     summary:
//       measurable.count >= 5
//         ? `${measurable.count} measurable results found.`
//         : measurable.count > 0
//           ? `${measurable.count} of 5+ measurable results found.`
//           : "No measurable results found.",
//     checks,
//   };
// };

// const buildActionVerbsSubgroup = (actionVerbCount: number): CategorySubgroup => {
//   const checks: CategoryCheck[] = [
//     {
//       label: "Action verbs",
//       status:
//         actionVerbCount >= 5
//           ? "passed"
//           : actionVerbCount > 0
//             ? "partial"
//             : "failed",
//       detail:
//         actionVerbCount >= 5
//           ? `We found ${actionVerbCount} strong action verbs in your resume (e.g. led, built, optimized). Starting bullets with action verbs helps recruiters quickly understand your responsibilities and impact.`
//           : actionVerbCount > 0
//             ? `We found only ${actionVerbCount} action verbs in your resume. Use at least 5 strong action verbs (e.g. led, built, optimized, launched) to start each bullet and make your experience more impactful.`
//             : "We found no action verbs in your resume. Use at least 5 strong action verbs (e.g. led, built, optimized, launched) to start each bullet and make your experience more impactful.",
//       weight: 20,
//     },
//   ];

//   return {
//     key: "actionVerbs",
//     title: "Action Verbs",
//     score: scoreFromChecks(checks),
//     weight: 20,
//     summary:
//       actionVerbCount >= 5
//         ? `${actionVerbCount} strong action verbs found.`
//         : actionVerbCount > 0
//           ? `Only ${actionVerbCount} action verbs found — use 5+.`
//           : "No action verbs found.",
//     checks,
//   };
// };

// const buildRecruiterTips = (
//   resume: ResumeContent,
//   jd: StructuredJD | null,
//   resumeYears: number,
//   measurable: { count: number },
//   actionVerbCount: number,
// ): CategoryResult => {
//   const subgroups = [
//     buildSummarySubgroup(resume),
//     buildJobLevelSubgroup(jd, resumeYears),
//     buildMeasurableSubgroup(measurable),
//     buildActionVerbsSubgroup(actionVerbCount),
//   ];

//   const checks = subgroups.flatMap((s) => s.checks);
//   const { strengths, improvements } = deriveFeedback(checks);
//   const score = scoreFromSubgroups(subgroups);

//   return {
//     key: "recruiterTips",
//     title: "Recruiter Tips",
//     score,
//     weight: CATEGORY_WEIGHTS.recruiterTips,
//     summary: `From a recruiter's view, your resume is ${score >= 80 ? "very compelling" : score >= 50 ? "decent but improvable" : "missing key hooks"}.`,
//     checks,
//     subgroups,
//     strengths,
//     improvements,
//   };
// };

// const buildFormatting = (
//   resume: ResumeContent,
//   atsFriendliness: number,
// ): CategoryResult => {
//   const summaryWords = (resume.summary || "").split(/\s+/).filter(Boolean).length;
//   const hasExperience = (resume.experience || []).length > 0;
//   const hasEducation = (resume.education || []).length > 0;
//   const skillCount = (resume.skills || []).length;
//   const contact = resume.personalInfo?.contact || {};
//   const hasContact = !!(
//     contact.email ||
//     contact.phone ||
//     contact.linkedIn ||
//     (resume.personalInfo as any)?.phone
//   );

//   const structuralChecks: CategoryCheck[] = [
//     {
//       label: "Standard sections present",
//       status: hasExperience && hasEducation && skillCount > 0 ? "passed" : hasExperience || hasEducation ? "partial" : "failed",
//       detail:
//         hasExperience && hasEducation && skillCount > 0
//           ? "Education, experience & skills sections all detected."
//           : "Add standard sections (experience, education, skills) that ATS parsers look for.",
//       weight: 40,
//     },
//     {
//       label: "Summary section",
//       status: summaryWords >= 30 ? "passed" : summaryWords > 0 ? "partial" : "failed",
//       detail:
//         summaryWords >= 30
//           ? "Professional summary present (30+ words)."
//           : summaryWords > 0
//             ? "Summary present but short."
//             : "No summary section — add a 30+ word opening summary.",
//       weight: 20,
//     },
//     {
//       label: "Skills section (5+)",
//       status: skillCount >= 5 ? "passed" : skillCount > 0 ? "partial" : "failed",
//       detail: skillCount >= 5
//         ? `${skillCount} skills listed — good keyword coverage.`
//         : skillCount > 0
//           ? `Only ${skillCount} skills listed — add at least 5.`
//           : "No dedicated skills section found.",
//       weight: 20,
//     },
//     {
//       label: "Work experience present",
//       status: hasExperience ? "passed" : "failed",
//       detail: hasExperience ? "Work experience section detected." : "Work experience section missing.",
//       weight: 20,
//     },
//   ];

//   // File-level layout checks cannot be verified from parsed text.
//   const fileChecks: CategoryCheck[] = [
//     { label: "ATS-friendly fonts", status: "na", detail: "Requires original file (PDF) analysis to verify fonts.", weight: 0 },
//     { label: "No tables / text boxes", status: "na", detail: "Requires original file analysis to detect layout elements.", weight: 0 },
//     { label: "No icons / graphics", status: "na", detail: "Requires original file analysis to detect images & icons.", weight: 0 },
//     { label: "No profile photo", status: "na", detail: "Requires original file analysis to detect a profile image.", weight: 0 },
//   ];

//   const checks = [...structuralChecks, ...fileChecks];
//   const { strengths, improvements } = deriveFeedback(checks);
//   return {
//     key: "formatting",
//     title: "Formatting / Layout",
//     score: scoreFromChecks(checks),
//     weight: CATEGORY_WEIGHTS.formatting,
//     summary: `Structure is ${atsFriendliness >= 80 ? "clean" : atsFriendliness >= 60 ? "acceptable" : "weak"}. File-level layout (fonts/tables/images) needs the original PDF for a full check.`,
//     checks,
//     strengths,
//     improvements,
//   };
// };

// // ============================================================================

// export const calculateLocalMatchScore = (
//   resume: ResumeContent,
//   structuredJD?: StructuredJD | null,
// ): LocalAtsResult => {
//   const jd = structuredJD || null;

//   const resumeText = toResumeText(resume);
//   const resumeSkills = extractSkillsFromResume(resume);
//   const resumeHardSkills =
//     resume.hardSkills && resume.hardSkills.length > 0
//       ? resume.hardSkills
//       : resumeSkills;
//   const resumeYears = calculateYearsOfExperience(resume);

//   const suggestions: string[] = [];

//   const measurable = countMeasurableResults(resume);
//   const resumeActionVerbs = matchActionVerbs(resumeText);

//   let matchBreakdown: LocalAtsResult["matchBreakdown"];

//   let hardSkillsMatch: MatchCategoryResult = {
//     score: 0,
//     matched: [],
//     partial: [],
//     missing: [],
//     items: [],
//   };
//   let softSkillsMatch: MatchCategoryResult = {
//     score: 0,
//     matched: [],
//     partial: [],
//     missing: [],
//     items: [],
//   };

//   if (jd) {
//     const isSkillPresent = (text: string, item: string) =>
//       countVariantsInText(text, getSkillVariants(item)) > 0;
//     const isActionVerbPresent = (text: string, item: string) =>
//       countActionVerbInText(text, item) > 0;

//     hardSkillsMatch = buildMatchCategory(
//       resumeText,
//       jd.hardSkills,
//       isSkillPresent,
//     );
//     softSkillsMatch = buildMatchCategory(
//       resumeText,
//       jd.softSkills,
//       isSkillPresent,
//     );
//     const actionVerbsMatch = buildMatchCategory(
//       resumeText,
//       jd.actionVerbs,
//       isActionVerbPresent,
//     );

//     matchBreakdown = {
//       hardSkills: hardSkillsMatch,
//       softSkills: softSkillsMatch,
//       actionVerbs: actionVerbsMatch,
//     };

//     if (hardSkillsMatch.missing.length > 0) {
//       suggestions.push(
//         `Add missing required skills: ${hardSkillsMatch.missing.slice(0, 5).join(", ")}`,
//       );
//     }

//     if (softSkillsMatch.missing.length > 0) {
//       suggestions.push(
//         `Highlight soft skills the job expects: ${softSkillsMatch.missing.slice(0, 5).join(", ")}.`,
//       );
//     }

//     if (actionVerbsMatch.missing.length > 0) {
//       const meaningfulVerbs = actionVerbsMatch.missing.filter(
//         (v) => !ROLE_NOUNS.test(v),
//       );
//       if (meaningfulVerbs.length > 0) {
//         suggestions.push(
//           `Use action verbs the job description emphasizes: ${meaningfulVerbs.slice(0, 5).join(", ")}.`,
//         );
//       }
//     }

//     if (jd.experienceYearsRequired > 0 && resumeYears < jd.experienceYearsRequired) {
//       suggestions.push(
//         `Job requires ${jd.experienceYearsRequired}+ years; your resume shows ${resumeYears} years.`,
//       );
//     }
//   } else {
//     if ((resume.experience || []).length === 0) {
//       suggestions.push("Add work experience with detailed descriptions.");
//     }
//   }

//   if ((resume.skills || []).length < 5) {
//     suggestions.push("Add a dedicated skills section with at least 5 technical skills.");
//   }
//   if (measurable.count < 5) {
//     suggestions.push(
//       `Add at least ${5 - measurable.count} more measurable results to your work experience (e.g. "reduced load time by 40%", "increased sales by 30%", "saved 10 hours/week").`,
//     );
//   }
//   if (resumeActionVerbs.length < 5) {
//     suggestions.push(
//       `Use at least ${5 - resumeActionVerbs.length} more action verbs (e.g. "developed", "implemented", "led", "optimized") when describing your experience.`,
//     );
//   }
//   if (!resume.summary || resume.summary.split(/\s+/).length < 30) {
//     suggestions.push("Add a professional summary of at least 30 words.");
//   }
//   if ((resume.projects || []).length === 0) {
//     suggestions.push("Add a projects section to showcase practical work.");
//   }

//   const summaryWords = (resume.summary || "").split(/\s+/).filter(Boolean).length;
//   const summaryScore =
//     summaryWords >= 50 ? 90 : summaryWords >= 30 ? 75 : summaryWords > 0 ? 55 : 20;

//   const experienceCount = (resume.experience || []).length;

//   const projectCount = (resume.projects || []).length;
//   const projectsScore =
//     projectCount >= 2 ? 85 : projectCount === 1 ? 70 : 40;

//   const contact = resume.personalInfo?.contact || {};
//   const hasContactInfo = !!(
//     contact.email ||
//     (resume.personalInfo as any)?.phone ||
//     contact.phone ||
//     contact.linkedIn
//   );
//   const contactScore = hasContactInfo
//     ? contact.email
//       ? 90
//       : 70
//     : 40;

//   const spellingGrammar = checkSpellingGrammar(resumeText);

//   const structureFactors = [
//     summaryWords >= 30,
//     (resume.skills || []).length >= 5,
//     experienceCount > 0,
//     (resume.education || []).length > 0,
//     hasContactInfo,
//   ];
//   const presentCount = structureFactors.filter(Boolean).length;
//   const atsFriendliness = Math.round(40 + presentCount * 12);

//   // ---- 5-category scoring ----
//   const eduScore = educationScore(resume, jd?.educationRequirement ?? null);

//   const categories: CategoriesResult = {
//     searchability: buildSearchability(resume, resumeText, jd, eduScore),
//     hardSkills: buildHardSkills(resume, resumeHardSkills, jd, hardSkillsMatch),
//     softSkills: buildSoftSkills(resume, jd, softSkillsMatch),
//     recruiterTips: buildRecruiterTips(
//       resume,
//       jd,
//       resumeYears,
//       measurable,
//       resumeActionVerbs.length,
//     ),
//     formatting: buildFormatting(resume, atsFriendliness),
//   };

//   const overallScore = Math.round(
//     (categories.searchability.score * CATEGORY_WEIGHTS.searchability +
//       categories.hardSkills.score * CATEGORY_WEIGHTS.hardSkills +
//       categories.softSkills.score * CATEGORY_WEIGHTS.softSkills +
//       categories.recruiterTips.score * CATEGORY_WEIGHTS.recruiterTips +
//       categories.formatting.score * CATEGORY_WEIGHTS.formatting) /
//       100,
//   );

//   // Add targeted suggestions from category checks (deduplicated, avoids
//   // repeating "missing skills" style feedback that is already listed above).
//   const searchChecks = categories.searchability.checks;
//   const titleCheck = searchChecks.find((c) => c.label === "Job title match");
//   if (
//     titleCheck &&
//     (titleCheck.status === "partial" || titleCheck.status === "failed")
//   ) {
//     suggestions.push(titleCheck.detail);
//   }
//   const dateCheck = searchChecks.find((c) => c.label === "Date formatting");
//   if (
//     dateCheck &&
//     (dateCheck.status === "partial" || dateCheck.status === "failed")
//   ) {
//     suggestions.push(dateCheck.detail);
//   }
//   const eduCheck = searchChecks.find((c) => c.label === "Education match");
//   if (
//     eduCheck &&
//     (eduCheck.status === "partial" || eduCheck.status === "failed")
//   ) {
//     suggestions.push(eduCheck.detail);
//   }

//   const experienceSectionScore =
//     experienceCount >= 2
//       ? Math.max(70, categories.recruiterTips.score >= 80 ? 80 : 70)
//       : experienceCount === 1
//         ? Math.max(55, categories.recruiterTips.score >= 80 ? 65 : 55)
//         : 25;

//   const skillSectionScore = jd
//     ? Math.round(
//         (categories.hardSkills.score + categories.softSkills.score) / 2,
//       )
//     : resumeHardSkills.length > 0
//       ? Math.min(100, 55 + resumeHardSkills.length * 3)
//       : 20;

//   return {
//     overallScore,
//     categories,
//     sectionScores: {
//       summary: {
//         score: summaryScore,
//         feedback:
//           summaryWords >= 30
//             ? `Summary present with ${summaryWords} words.`
//             : summaryWords > 0
//               ? "Summary is too short. Expand to at least 30 words."
//               : "No professional summary found.",
//         wordCount: summaryWords,
//       },
//       experience: {
//         score: experienceSectionScore,
//         feedback:
//           experienceCount > 0
//             ? `${experienceCount} position(s), ${resumeYears} year(s) total.`
//             : "No work experience listed.",
//       },
//       projects: {
//         score: projectsScore,
//         feedback:
//           projectCount > 0
//             ? `${projectCount} project(s) found.`
//             : "No projects section found.",
//       },
//       skills: {
//         score: skillSectionScore,
//         feedback: jd
//           ? `${jd.hardSkills.length} required hard skills from the job description matched.`
//           : `${resumeHardSkills.length} hard skills identified on resume.`,
//       },
//       contactInfo: {
//         score: contactScore,
//         feedback: hasContactInfo
//           ? "Contact information found."
//           : "Contact information is missing.",
//         hasContactInfo,
//       },
//       measurableResults: {
//         score: measurableResultsScore(measurable.count),
//         count: measurable.count,
//         found: measurable.found,
//         feedback:
//           measurable.count >= 5
//             ? `${measurable.count} measurable results found. Great impact evidence!`
//             : measurable.count > 0
//               ? `${measurable.count} of 5+ recommended measurable results found in work experience.`
//               : "No measurable results found. Quantify achievements with numbers (e.g. %, $, time saved).",
//       },
//     },
//     spellingGrammar,
//     atsFriendliness,
//     suggestions: [...new Set(suggestions)].slice(0, 8),
//     ...(matchBreakdown ? { matchBreakdown } : {}),
//   };
// };
