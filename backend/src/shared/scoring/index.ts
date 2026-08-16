import { ResumeContent, StructuredJD } from "../types";
import { LocalAtsResult, CategoriesResult, MatchCategoryResult } from "./types";
import { CATEGORY_WEIGHTS } from "./constants";
import {
  toResumeText,
  buildMatchCategory,
  educationScore,
  parseYearsOfExperience,
  countMeasurableResults,
  measurableResultsScore,
  summaryScore as summaryWordsScore,
  extractSkillsFromResume,
  getSkillVariants,
  countVariantsInText,
  countActionVerbs,
  actionVerbsScore,
} from "./utils";
import { buildSearchability } from "./searchability";
import { buildHardSkills, buildSoftSkills } from "./skills";
import { buildRecruiterTips } from "./recruiter-tips";
import { buildFormatting } from "./formatting";

export const calculateLocalMatchScore = (
  resume: ResumeContent,
  structuredJD?: StructuredJD | null,
): LocalAtsResult => {
  console.log("job description", structuredJD);
  console.log("resume", resume);
  const jd = structuredJD || null;
  const resumeText = toResumeText(resume);
  // const resumeSkills = extractSkillsFromResume(resume);
  const resumeHardSkills = resume.skills.hardSkills?.length
    ? resume.skills.hardSkills
    : [];
  const resumeYears = parseYearsOfExperience(resume.yearsOfExperience);
  const measurable = countMeasurableResults(resume);
  const actionVerbs = countActionVerbs(resume);
  const suggestions: string[] = [];

  // =========================================================
  // JD-BASED MATCHING
  // If job description exists, calculate skill matches
  // =========================================================

  let hardSkillsMatch: MatchCategoryResult = {
    score: 0,
    matched: [],
    missing: [],
    items: [],
  };
  let softSkillsMatch: MatchCategoryResult = {
    score: 0,
    matched: [],
    missing: [],
    items: [],
  };
  let matchBreakdown: LocalAtsResult["matchBreakdown"];

  if (jd) {
    // Helper functions for checking presence of skills in text
    const isSkillPresent = (text: string, item: string) =>
      countVariantsInText(text, getSkillVariants(item)) > 0;

    // Build match results for each category
    hardSkillsMatch = buildMatchCategory(
      resumeText,
      jd.skills.hardSkills,
      isSkillPresent,
    );
    softSkillsMatch = buildMatchCategory(
      resumeText,
      jd.skills.softSkills,
      isSkillPresent,
    );
    matchBreakdown = {
      hardSkills: hardSkillsMatch,
      softSkills: softSkillsMatch,
    };

    // =========================================================
    // JD-BASED SUGGESTIONS
    // Generate improvement suggestions from JD mismatches
    // =========================================================
    if (hardSkillsMatch.missing.length)
      suggestions.push(
        "Add missing required hard skills of your resume to better match this job description",
      );
    if (softSkillsMatch.missing.length)
      suggestions.push(
        "Add missing required soft skills of your resume to better match this job description",
      );
    if (
      jd.experienceYearsRequired > 0 &&
      resumeYears < jd.experienceYearsRequired
    )
      suggestions.push(
        `Job requires ${jd.experienceYearsRequired}+ years, but your resume shows ${resumeYears} ${resumeYears === 1 ? "year" : "years"}.`,
      );
  } else if (!resume.experience?.length) {
    suggestions.push("Add work experience with detailed descriptions.");
  }

  // =========================================================
  // GENERAL RESUME SUGGESTIONS
  // Generate improvement suggestions regardless of JD
  // =========================================================
  if ((resume.skills.hardSkills || []).length < 5)
    suggestions.push(
      "Add a dedicated skills section with at least 5 technical skills.",
    );
  if (measurable.count < 3)
    suggestions.push(
      `Add at least ${3 - measurable.count} more measurable results.`,
    );
  if (actionVerbs.count < 3)
    suggestions.push(
      "Use strong action verbs in your experience bullet points (e.g. built, launched, optimized).",
    );
  if (!resume.summary || resume.summary.split(/\s+/).length < 30)
    suggestions.push("Add a professional summary of at least 30 words.");

  // =========================================================
  // SECTION-SCORE CALCULATIONS
  // Calculate individual scores for each resume section
  // =========================================================

  // Summary Score
  const summaryWords = (resume.summary || "")
    .split(/\s+/)
    .filter(Boolean).length;

  const summaryScore = summaryWordsScore(summaryWords);
  // Experience Score
  const experienceCount = resume.experience?.length || 0;

  // Contact Info Score
  const contact = resume.personalInfo?.contact || {};
  const hasContactInfo = !!(contact.email || contact.phone || contact.address);

  const hasEmail = !!contact.email;
  const hasPhone = !!contact.phone;
  const hasAddress = !!contact.address;

  let contactScore = 0;
  if (hasEmail) contactScore += 50;
  if (hasPhone) contactScore += 40;
  if (hasAddress) contactScore += 10;

  // ATS Friendliness Score
  const structureFactors = [
    summaryWords >= 30,
    (resume.skills.hardSkills || []).length >= 5,
    experienceCount > 0,
    (resume.education || []).length > 0,
    hasContactInfo,
  ];

  const atsFriendliness = Math.round(
    structureFactors.filter(Boolean).length * 20,
  );

  // =========================================================
  // CATEGORY SCORES
  // Build individual category scores using specialized builders
  // =========================================================
  const eduScore = educationScore(resume, jd?.education || null);
  const categories: CategoriesResult = {
    searchability: buildSearchability(resume, resumeText, jd, eduScore),
    hardSkills: buildHardSkills(resumeHardSkills, jd, hardSkillsMatch),
    softSkills: buildSoftSkills(resume, jd, softSkillsMatch),
    recruiterTips: buildRecruiterTips(
      resume,
      jd,
      resumeYears,
      measurable,
      actionVerbs,
    ),
    formatting: buildFormatting(resume, atsFriendliness),
  };

  // =============================================
  // OVERALL SCORE CALCULATION
  // Weighted average of all category scores
  // =============================================
  const overallScore = Math.round(
    (categories.searchability.score * CATEGORY_WEIGHTS.searchability +
      categories.hardSkills.score * CATEGORY_WEIGHTS.hardSkills +
      categories.softSkills.score * CATEGORY_WEIGHTS.softSkills +
      categories.recruiterTips.score * CATEGORY_WEIGHTS.recruiterTips +
      categories.formatting.score * CATEGORY_WEIGHTS.formatting) /
      100,
  );

  // =============================================
  // ADDITIONAL SUGGESTIONS FROM SEARCH CHECKS
  // Extract suggestions from searchability checks
  // =============================================
  const searchChecks = categories.searchability.checks;
  ["Job title match", "Date formatting", "Education match"].forEach((label) => {
    const check = searchChecks.find((c) => c.label === label);
    if (check && check.status === "failed") suggestions.push(check.detail);
  });

  // =============================================
  // FINAL SECTION SCORES
  // Calculate final scores for each resume section
  // =============================================
  const experienceSectionScore =
    experienceCount >= 2
      ? Math.max(70, categories.recruiterTips.score >= 80 ? 80 : 70)
      : experienceCount === 1
        ? Math.max(55, categories.recruiterTips.score >= 80 ? 65 : 55)
        : 25;

  const skillSectionScore = jd
    ? Math.round(
        (categories.hardSkills.score + categories.softSkills.score) / 2,
      )
    : resumeHardSkills.length > 0
      ? Math.min(100, 55 + resumeHardSkills.length * 3)
      : 20;

  // =============================================
  // SECTION 10: RETURN RESULT
  // Compile and return complete ATS result object
  // =============================================
  return {
    overallScore,
    categories,
    sectionScores: {
      summary: {
        score: summaryScore,
        feedback:
          summaryWords >= 30
            ? `Summary present with ${summaryWords} words.`
            : summaryWords > 0
              ? "Summary is too short."
              : "No professional summary found.",
      },
      experience: {
        score: experienceSectionScore,
        feedback:
          experienceCount > 0
            ? `${experienceCount} position(s), ${resumeYears} year(s) total.`
            : "No work experience listed.",
      },
      skills: {
        score: skillSectionScore,
        feedback: jd
          ? `${jd.skills.hardSkills.length} required hard skills from JD matched.`
          : `${resumeHardSkills.length} hard skills identified.`,
      },
      contactInfo: {
        score: contactScore,
        feedback: hasContactInfo
          ? "Contact information found."
          : "Contact information is missing.",
        hasContactInfo,
      },
      measurableResults: {
        score: measurableResultsScore(measurable.count),
        count: measurable.count,
        found: measurable.found,
        feedback:
          measurable.count >= 5
            ? `${measurable.count} measurable results found.`
            : measurable.count > 0
              ? `${measurable.count} of 5+ recommended measurable results found.`
              : "No measurable results found.",
      },
      actionVerbs: {
        score: actionVerbsScore(actionVerbs.count),
        count: actionVerbs.count,
        found: actionVerbs.found,
        feedback:
          actionVerbs.count >= 5
            ? `${actionVerbs.count} action verbs found in experience bullets.`
            : actionVerbs.count > 0
              ? `${actionVerbs.count} of 5+ recommended action verbs found.`
              : "No strong action verbs found in experience bullets.",
      },
    },
    atsFriendliness,
    suggestions: [...new Set(suggestions)].slice(0, 8),
    ...(matchBreakdown ? { matchBreakdown } : {}),
  };
};
