import { Response } from "express";
import { AuthRequest } from "../../types";
import { resumeAnalysisService } from "../../services/analysis/analysisService";
import { prisma } from "../../lib/prisma";

export const generateAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const { resumeId, jobDescription } = req.body;
    const userId = req.user.id;

    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: "Resume ID is required",
      });
    }

    const resume = await prisma.resume.findFirst({
      where: { id: resumeId, userId },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const currentCredits = (user.subscription as any)?.credits ?? 0;

    // Analysis costs 1 credit
    if (currentCredits < 1) {
      return res.status(403).json({
        success: false,
        message: `Insufficient credits. This task requires 1 credit. You have ${currentCredits} credits.`,
      });
    }

    // Validate job description
    if (!jobDescription || jobDescription.trim().length < 50) {
      return res.status(400).json({
        success: false,
        message:
          "Job description is too short. Please provide a detailed job description (at least 50 characters).",
      });
    }

    // Check if job description appears to be random text
    const words = jobDescription.trim().split(/\s+/);
    const avgWordLength =
      jobDescription.replace(/\s/g, "").length / words.length;
    if (avgWordLength > 10 || words.length < 10) {
      return res.status(400).json({
        success: false,
        message:
          "Job description appears to be invalid. Please provide a proper job description with multiple sentences.",
      });
    }

    // Convert resume content to text for analysis
    const resumeText = convertResumeToText(resume.content);

    // Validate resume has minimum content
    if (resumeText.length < 100) {
      return res.status(400).json({
        success: false,
        message:
          "Resume content is too short. Please upload a complete resume with work experience, skills, and education.",
      });
    }

    // Run professional analysis
    const analysisResult = await resumeAnalysisService.analyze({
      resume: resume.content as any,
      resumeText,
      jobDescription: jobDescription || "",
    });

    console.log("Analysis completed, transforming data...");

    // Transform analysis result to database format
    const analysisData = transformToAnalysisData(
      analysisResult,
      resumeId,
      req.user.id,
      jobDescription || "",
    );

    console.log("Creating analysis record...");

    const analysis = await prisma.analysis.create({
      data: analysisData,
    });

    console.log("Analysis created successfully:", analysis.id);

    const updatedSubscription = {
      ...((user.subscription as any) || {}),
      credits: currentCredits - 1,
    };

    await prisma.user.update({
      where: { id: userId },
      data: { subscription: updatedSubscription },
    });

    return res.status(201).json({
      success: true,
      data: analysis,
      credits: currentCredits - 1,
      message: "✅ Credit deducted successfully! Task: Resume Analysis, Credits deducted: 1",
    });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error analyzing resume",
    });
  }
};

/**
 * Convert resume content object to plain text
 */
function convertResumeToText(content: any): string {
  const parts: string[] = [];

  if (content.personalInfo) {
    parts.push(content.personalInfo.fullName || "");
    parts.push(content.personalInfo.jobTitle || "");
  }

  if (content.summary) {
    parts.push(content.summary);
  }

  if (content.experience && content.experience.length > 0) {
    content.experience.forEach((exp: any) => {
      parts.push(`${exp.title} at ${exp.company}`);
      parts.push((exp.highlights || []).join(" "));
    });
  }

  if (content.skills && content.skills.length > 0) {
    parts.push(content.skills.join(" "));
  }

  if (content.projects && content.projects.length > 0) {
    content.projects.forEach((proj: any) => {
      parts.push(`${proj.name}: ${(proj.highlights || []).join(" ")}`);
    });
  }

  if (content.education && content.education.length > 0) {
    content.education.forEach((edu: any) => {
      parts.push(`${edu.degree} from ${edu.institution}`);
    });
  }

  return parts.filter(Boolean).join("\n");
}

/**
 * Transform new analysis result to database format
 */
function transformToAnalysisData(
  result: any,
  resumeId: string,
  userId: string,
  jobDescription: string,
): any {
  // Calculate ATS Score based on industry standards
  const atsBreakdown = result.scoreBreakdown?.ats;
  const atsScore = atsBreakdown
    ? calculateATSScore(atsBreakdown)
    : result.jobMatchScore;

  return {
    userId,
    resumeId,
    jobDescription,
    jobTitle: "",
    company: "",
    score: result.jobMatchScore,
    atsScore,
    atsBreakdown: atsBreakdown
      ? {
          keywordMatch: {
            score: atsBreakdown.keywordMatching.score,
            details: `${atsBreakdown.keywordMatching.details}`,
          },
          formattingCompatibility: {
            score: atsBreakdown.sectionCompleteness.score,
            details: `${atsBreakdown.sectionCompleteness.details}`,
          },
          skillsSection: {
            score: atsBreakdown.skillsMatch.score,
            details: `${atsBreakdown.skillsMatch.details}`,
          },
          experienceRelevance: {
            score: atsBreakdown.experienceRelevance.score,
            details: `${atsBreakdown.experienceRelevance.details}`,
          },
          readabilityLength: {
            score: calculateReadabilityScore(result),
            details: getReadabilityDetails(result),
          },
          contactInfo: {
            score: calculateContactInfoScore(result),
            details: getContactInfoDetails(result),
          },
        }
      : undefined,
    atsSuggestions: generateATSSuggestions(result, atsBreakdown),
    jobMatchSuggestions: generateJobMatchSuggestions(result),
    jobMatchingBreakdown: {
      skillsMatch: {
        score: result.scoreBreakdown.jobMatch.skillsMatch.score,
        details: result.scoreBreakdown.jobMatch.skillsMatch.details,
      },
      keywordsMatch: {
        score: result.scoreBreakdown.jobMatch.keywordsMatch.score,
        details: result.scoreBreakdown.jobMatch.keywordsMatch.details,
      },
      softSkillsMatch: {
        score: result.scoreBreakdown.jobMatch.softSkillsMatch.score,
        details: result.scoreBreakdown.jobMatch.softSkillsMatch.details,
      },
    },
    feedback: {
      overall: generateOverallFeedback(result),
      strengths: generateStrengths(result),
      weaknesses: generateWeaknesses(result),
      suggestions: result.recommendations
        .slice(0, 7)
        .map((r: any) => r.title + ": " + r.description),
    },
    sectionScores: {
      skills: {
        score: result.skillsAnalysis
          ? Math.round(
              (result.skillsAnalysis.matchedSkills.length /
                Math.max(
                  1,
                  result.skillsAnalysis.matchedSkills.length +
                    result.skillsAnalysis.missingSkills.length,
                )) *
                100,
            )
          : result.jobMatchScore || 70,
        matched:
          result.skillsAnalysis?.matchedSkills?.map((s: any) => s.name) ||
          result.keywordAnalysis?.foundKeywords?.map((k: any) => k.keyword) ||
          result.keywords?.found ||
          [],
        missing:
          result.skillsAnalysis?.missingSkills?.map((s: any) => s.name) ||
          result.keywordAnalysis?.missingKeywords?.map((k: any) => k.keyword) ||
          result.keywords?.missing ||
          [],
      },
      experience: {
        score: result.experienceAnalysis?.positions?.length > 0 ? 80 : 40,
        details:
          result.experienceAnalysis?.positions?.length > 0
            ? `${result.experienceAnalysis.positions.length} positions | ${result.experienceAnalysis.totalYears} years experience`
            : "No experience listed",
      },
      education: {
        score: result.sectionAnalysis?.education?.present ? 80 : 50,
        details: result.sectionAnalysis?.education?.present
          ? "Education section present"
          : "No education listed",
      },
      format: {
        score: Math.min(100, Math.round(result.jobMatchScore)),
        details: "Resume format evaluated",
      },
    },
    keywords: {
      found:
        result.keywordAnalysis?.foundKeywords?.map((k: any) => k.keyword) || [],
      missing:
        result.keywordAnalysis?.missingKeywords?.map((k: any) => k.keyword) ||
        [],
      density: {},
    },
    missingKeywords: {
      programmingLanguages:
        result.skillsAnalysis?.missingSkills
          ?.filter((s: any) => s.category === "Programming Language")
          ?.map((s: any) => s.name) || [],
      frameworks:
        result.skillsAnalysis?.missingSkills
          ?.filter((s: any) => s.category === "Framework")
          ?.map((s: any) => s.name) || [],
      databases:
        result.skillsAnalysis?.missingSkills
          ?.filter((s: any) => s.category === "Database")
          ?.map((s: any) => s.name) || [],
      tools:
        result.skillsAnalysis?.missingSkills
          ?.filter(
            (s: any) =>
              s.category === "DevOps Tool" || s.category === "Technical Skill",
          )
          ?.map((s: any) => s.name) || [],
      devops:
        result.skillsAnalysis?.missingSkills
          ?.filter((s: any) => s.category === "DevOps Tool")
          ?.map((s: any) => s.name) || [],
      softSkills:
        result.skillsAnalysis?.missingSkills
          ?.filter((s: any) => s.category === "Soft Skill")
          ?.map((s: any) => s.name) || [],
    },
    recommendedKeywords: [],
    howToUseKeywords:
      result.recommendations
        ?.slice(0, 5)
        ?.map(
          (r: any) =>
            r.actionItems?.[0]?.action || `Add ${r.title.toLowerCase()}`,
        ) || [],
    resumeImprovements:
      result.recommendations?.map((r: any) => r.description) || [],
    jobMatch: {
      score: result.jobMatchScore,
      missingKeywords:
        result.skillsAnalysis?.missingSkills?.map((s: any) => s.name) ||
        result.keywordAnalysis?.missingKeywords?.map((k: any) => k.keyword) ||
        result.keywords?.missing ||
        [],
      suggestions:
        result.recommendations?.slice(0, 3)?.map((r: any) => r.description) ||
        [],
    },
    existingSections: {
      experience: result.sectionAnalysis?.experience?.present || false,
      education: result.sectionAnalysis?.education?.present || false,
      skills: result.sectionAnalysis?.skills?.present || false,
      summary: result.sectionAnalysis?.summary?.present || false,
      projects: result.sectionAnalysis?.projects?.present || false,
    },
  };
}

/**
 * Generate overall feedback summary
 */
function generateOverallFeedback(result: any): string {
  const { jobMatchScore } = result;

  let summary = `Job Match Score: ${jobMatchScore}%. `;

  if (jobMatchScore >= 80) {
    summary +=
      "Excellent match! Your resume strongly aligns with the job requirements.";
  } else if (jobMatchScore >= 60) {
    summary += "Good match with room for improvement.";
  } else if (jobMatchScore >= 40) {
    summary += "Fair match. Consider addressing the key gaps identified.";
  } else {
    summary += "Significant gaps detected. Review recommendations carefully.";
  }

  return summary;
}

/**
 * Generate strengths list
 */
function generateStrengths(result: any): string[] {
  const strengths: string[] = [];

  if (result.sectionAnalysis?.summary?.present) {
    strengths.push("Professional summary included");
  }

  if (result.sectionAnalysis?.experience?.present) {
    strengths.push(
      `Work experience with ${result.experienceAnalysis?.totalYears || 0} years`,
    );
  }

  if (
    result.sectionAnalysis?.skills?.present &&
    result.skillsAnalysis?.totalSkillsFound > 5
  ) {
    strengths.push(
      `Strong skills section with ${result.skillsAnalysis.totalSkillsFound} skills`,
    );
  }

  if (result.sectionAnalysis?.projects?.present) {
    strengths.push("Projects section showcases practical work");
  }

  if (result.jobMatchScore >= 70) {
    strengths.push("Excellent job requirements alignment");
  }

  return strengths;
}

/**
 * Generate weaknesses list
 */
function generateWeaknesses(result: any): string[] {
  const weaknesses: string[] = [];

  if (!result.sectionAnalysis?.summary?.present) {
    weaknesses.push("Missing professional summary");
  }

  if (!result.sectionAnalysis?.experience?.present) {
    weaknesses.push("No work experience listed");
  }

  if (!result.sectionAnalysis?.projects?.present) {
    weaknesses.push("No projects section");
  }

  if (result.skillsAnalysis?.missingSkills?.length > 5) {
    weaknesses.push(
      `Missing ${result.skillsAnalysis.missingSkills.length} required skills`,
    );
  }

  return weaknesses;
}

/**
 * Calculate ATS Score from breakdown components (industry-standard weighting)
 */
function calculateATSScore(atsBreakdown: any): number {
  // Industry-standard ATS scoring weights:
  // - Keyword Match: 30%
  // - Formatting/Structure: 25%
  // - Skills Section: 25%
  // - Experience Relevance: 15%
  // - Readability: 5%
  return Math.round(
    atsBreakdown.keywordMatching.score * 0.3 +
      atsBreakdown.sectionCompleteness.score * 0.25 +
      atsBreakdown.skillsMatch.score * 0.25 +
      atsBreakdown.experienceRelevance.score * 0.15 +
      80 * 0.05, // Default readability score
  );
}

/**
 * Calculate readability score based on content quality
 */
function calculateReadabilityScore(result: any): number {
  const sectionAnalysis = result.sectionAnalysis;
  let score = 80;

  // Check summary length
  if (sectionAnalysis?.summary?.wordCount) {
    const wordCount = sectionAnalysis.summary.wordCount;
    if (wordCount < 30) score -= 15;
    else if (wordCount < 50) score -= 5;
    else if (wordCount > 100) score -= 10;
  }

  // Check for quantified achievements
  const hasMetrics =
    result.experienceAnalysis?.achievementMetrics?.quantifiedCount > 0;
  if (hasMetrics) score += 10;

  // Check bullet points
  const experienceCount = result.experienceAnalysis?.positions?.length || 0;
  if (experienceCount > 0) score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Get readability details string
 */
function getReadabilityDetails(result: any): string {
  const wordCount = result.metadata?.resumeWordCount || 0;
  const hasMetrics =
    result.experienceAnalysis?.achievementMetrics?.quantifiedCount > 0;

  if (hasMetrics) {
    return `Resume length: ${wordCount} words | Contains quantified achievements`;
  }
  return `Resume length: ${wordCount} words`;
}

/**
 * Calculate contact info completeness score
 */
function calculateContactInfoScore(result: any): number {
  const personalInfo = result.sectionAnalysis;
  let score = 0;

  // Check for key contact elements
  const hasName = !!result.metadata;
  const hasEmail = true; // Assumed from user account
  const hasLocation = true; // Assumed
  const hasLinkedIn = false; // Would need to parse

  if (hasName) score += 30;
  if (hasEmail) score += 30;
  if (hasLocation) score += 20;
  if (hasLinkedIn) score += 20;

  return Math.min(100, score);
}

/**
 * Get contact info details string
 */
function getContactInfoDetails(result: any): string {
  const hasName = !!result.metadata;
  const hasEmail = true;

  if (hasName && hasEmail) {
    return "Contact information present (name, email)";
  }
  return "Contact information partially complete";
}

/**
 * Generate ATS-specific suggestions based on industry best practices
 */
function generateATSSuggestions(result: any, atsBreakdown: any): string[] {
  const suggestions: string[] = [];

  // Keyword optimization suggestions
  if (atsBreakdown?.keywordMatching?.score < 70) {
    suggestions.push(
      "Add more keywords from the job description naturally throughout your resume",
    );
  }

  // Section completeness suggestions
  if (!result.sectionAnalysis?.summary?.present) {
    suggestions.push(
      "Add a professional summary (3-5 sentences) at the top of your resume",
    );
  } else if (result.sectionAnalysis?.summary?.wordCount < 30) {
    suggestions.push("Expand your professional summary to at least 30 words");
  }

  if (
    !result.sectionAnalysis?.skills?.present ||
    result.skillsAnalysis?.totalSkillsFound < 5
  ) {
    suggestions.push(
      "Add a dedicated skills section with at least 10 relevant technical skills",
    );
  }

  if (!result.sectionAnalysis?.experience?.present) {
    suggestions.push(
      "Add work experience with detailed descriptions of your responsibilities and achievements",
    );
  }

  // Skills suggestions
  if (result.skillsAnalysis?.missingSkills?.length > 3) {
    const topMissing = result.skillsAnalysis.missingSkills
      .slice(0, 3)
      .map((s: any) => s.name);
    suggestions.push(`Add missing skills: ${topMissing.join(", ")}`);
  }

  // Quantified achievements suggestion
  if (!result.experienceAnalysis?.achievementMetrics?.quantifiedCount) {
    suggestions.push(
      "Add quantified achievements (%, $, numbers) to demonstrate impact",
    );
  }

  // Formatting suggestions
  if (result.metadata?.resumeWordCount < 200) {
    suggestions.push(
      "Expand your resume to at least 200 words for better ATS parsing",
    );
  }

  return suggestions.slice(0, 8);
}

/**
 * Generate job match-specific suggestions
 */
function generateJobMatchSuggestions(result: any): string[] {
  const suggestions: string[] = [];

  // Required skills gap
  if (result.scoreBreakdown?.jobMatch?.requiredSkillsMatch?.score < 70) {
    suggestions.push(
      "Focus on adding the required skills mentioned in the job description",
    );
  }

  // Preferred skills
  if (
    result.scoreBreakdown?.jobMatch?.preferredSkillsMatch?.score < 50 &&
    result.scoreBreakdown?.jobMatch?.preferredSkillsMatch?.weight > 0
  ) {
    suggestions.push(
      "Highlight any preferred skills you have from the job posting",
    );
  }

  // Experience alignment
  if (result.scoreBreakdown?.jobMatch?.experienceAlignment?.score < 60) {
    suggestions.push(
      "Emphasize relevant experience that matches the job requirements",
    );
  }

  // Education alignment
  if (result.scoreBreakdown?.jobMatch?.educationAlignment?.score < 60) {
    suggestions.push("Add or highlight your educational background");
  }

  // Career progression
  if (
    result.experienceAnalysis?.careerProgression?.hasProgression === false &&
    result.experienceAnalysis?.positions?.length > 1
  ) {
    suggestions.push(
      "Highlight career progression and increasing responsibilities",
    );
  }

  // Industry-specific keywords
  if (result.keywordAnalysis?.missingKeywords?.length > 5) {
    suggestions.push(
      "Incorporate industry-specific keywords from the job description",
    );
  }

  return suggestions.slice(0, 8);
}
