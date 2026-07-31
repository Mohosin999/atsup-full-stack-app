import { GoogleGenerativeAI } from "@google/generative-ai";
import { ResumeContent, AnalysisResult } from "../../types";
import { experienceText, projectText } from "../../utils";
import { env } from "../../config/env";

const COMPREHENSIVE_KEYWORDS = {
  programmingLanguages: [
    "javascript",
    "typescript",
    "python",
    "java",
    "c++",
    "c#",
    "ruby",
    "go",
    "rust",
    "php",
    "swift",
    "kotlin",
  ],
  frameworks: [
    "react",
    "angular",
    "vue",
    "svelte",
    "nextjs",
    "next.js",
    "nuxt",
    "nuxtjs",
    "express",
    "fastify",
    "nestjs",
    "nest",
    "django",
    "flask",
    "fastapi",
    "spring",
    "spring boot",
    "rails",
    "laravel",
    "symfony",
    "codeigniter",
    "asp.net",
    ".net",
    "dotnet",
    "flutter",
    "react native",
    "ionic",
    "tailwind",
    "bootstrap",
    "material ui",
    "mui",
    "chakra ui",
    "redux",
    "context api",
    "react query",
    "graphql",
    "apollo",
  ],
  databases: [
    "mongodb",
    "postgresql",
    "mysql",
    "redis",
    "sqlite",
    "dynamodb",
    "firebase",
    "supabase",
    "prisma",
    "mongoose",
    "graphql",
  ],
  tools: [
    "git",
    "github",
    "gitlab",
    "swagger",
    "jest",
    "mocha",
    "cypress",
    "unittest",
    "vitest",
    "rtl",
    "testing library",
  ],
  devops: [
    "docker",
    "kubernetes",
    "k8s",
    "jenkins",
    "github actions",
    "ci/cd",
    "cicd",
  ],
  softSkills: [
    "leadership",
    "communication",
    "team work",
    "problem solving",
    "project management",
    "time management",
    "critical thinking",
  ],
};

const RECOMMENDED_KEYWORDS = [
  "docker",
  "ci/cd",
  "cicd",
  "rest api",
  "restful api",
  "microservices",
  "testing",
  "unit testing",
  "integration testing",
  "agile",
  "github actions",
  "kubernetes",
  "aws",
  "cloud",
  "CI/CD pipeline",
  "api integration",
  "websocket",
  "graphql",
  "microservices architecture",
  "system design",
  "performance optimization",
  "code review",
  "clean code",
];

const calculateKeywordMatchingScore = (
  resumeText: string,
  jdKeywords: string[],
  resumeSkills: string[] = [],
): { score: number; found: string[]; missing: string[] } => {
  const resumeLower = resumeText.toLowerCase();
  const found: string[] = [];
  const missing: string[] = [];

  const resumeSkillsNormalized = resumeSkills.map((s) =>
    s.toLowerCase().trim(),
  );

  // Prioritize JD keywords but also check resume skills for density
  const allKeywordsToCheck = [...new Set(jdKeywords)];

  for (const keyword of allKeywordsToCheck) {
    if (!keyword || keyword.length < 2) continue;

    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Use more flexible matching with word boundaries and partial matches
    const variations = [
      new RegExp(`\\b${escaped}\\b`, "i"),
      new RegExp(`\\b${escaped.replace(/\s+/g, "[- ]?")}\\b`, "i"),
      new RegExp(`\\b${keyword.replace(/\.js$/i, "js")}\\b`, "i"),
      new RegExp(`\\b${keyword.replace(/js$/i, ".js")}\\b`, "i"),
    ];

    let keywordFound = false;
    for (const regex of variations) {
      if (regex.test(resumeLower)) {
        keywordFound = true;
        break;
      }
    }

    if (keywordFound) {
      found.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  // Calculate score with density consideration
  let score = 0;
  if (allKeywordsToCheck.length > 0) {
    const baseScore = (found.length / allKeywordsToCheck.length) * 100;

    // Bonus for keyword density (multiple occurrences)
    let densityBonus = 0;
    for (const keyword of found) {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const occurrences = (resumeLower.match(new RegExp(escaped, "gi")) || [])
        .length;
      if (occurrences > 1) {
        densityBonus += Math.min(5, (occurrences - 1) * 2);
      }
    }

    score = Math.min(100, Math.round(baseScore + densityBonus));
  } else {
    score = 50;
  }

  return { score, found, missing };
};

const calculateSkillsMatchScore = (
  resumeSkills: string[],
  jdSkills: string[],
): { score: number; matched: string[]; missing: string[] } => {
  const resumeSkillsLower = resumeSkills
    .map((s) => s.toLowerCase().trim())
    .filter((s) => s.length > 0);
  const jdSkillsLower = jdSkills
    .map((s) => s.toLowerCase().trim())
    .filter((s) => s.length > 0);

  const matched: string[] = [];
  const missing: string[] = [];

  // Enhanced skill aliases for better matching
  const skillAliases: Record<string, string[]> = {
    react: [
      "reactjs",
      "react.js",
      "reactjs/react",
      "react hooks",
      "react.js/react",
    ],
    reactjs: ["react", "react.js"],
    "react.js": ["react", "reactjs"],
    "react native": ["reactnative", "react-native", "rn"],
    "node.js": ["nodejs", "node", "node.js", "node.js/express"],
    nodejs: ["node.js", "node", "nodejs"],
    typescript: ["ts", "typescript", "type script", "ts/js"],
    javascript: ["js", "javascript", "es6", "es5", "es2015", "vanilla js"],
    python: ["python3", "python 3", "python2"],
    postgresql: ["postgres", "postgresql", "psql", "pg"],
    mongodb: ["mongo", "mongodb", "mongoose", "mongo db"],
    docker: ["docker", "docker container", "dockerization"],
    kubernetes: ["k8s", "kubernetes", "k8s/docker"],
    aws: ["amazon web services", "aws", "amazon ws", "aws cloud"],
    "rest api": ["restapi", "rest", "restful api", "restful", "rest apis"],
    restful: ["rest", "rest api", "restful api", "rest apis"],
    microservices: [
      "microservice",
      "micro services",
      "micro-service",
      "microservice architecture",
    ],
    graphql: ["gql", "graphql", "graph ql", "graphql api"],
    "next.js": ["nextjs", "next.js", "next", "next.js/react"],
    nestjs: ["nestjs", "nest", "nest.js", "nestjs framework"],
    vue: ["vue", "vue.js", "vuejs", "vue 3"],
    angular: ["angular", "angularjs", "angular 2+"],
    express: ["express", "express.js", "expressjs", "express/next.js"],
    mysql: ["mysql", "my sql", "mysql database"],
    redis: ["redis", "redis cache", "redis db"],
    git: ["git", "git version control"],
    cicd: ["cicd", "ci/cd", "ci cd", "ci/cd pipeline"],
    "ci/cd": ["cicd", "ci/cd", "ci cd", "continuous integration"],
    jest: ["jest", "jest testing", "jsdom"],
    testing: ["testing", "unit testing", "integration testing", "e2e testing"],
  };

  const normalizeSkill = (skill: string): string => {
    const lower = skill.toLowerCase().trim();
    // Check if this skill is an alias of another canonical skill
    for (const [canonical, aliases] of Object.entries(skillAliases)) {
      if (aliases.includes(lower) || lower === canonical) {
        return canonical;
      }
    }
    // Check if this skill has aliases (is a canonical skill itself)
    if (skillAliases[lower]) {
      return lower;
    }
    return lower;
  };

  // Normalize skills from both resume and JD
  const normalizedResume = resumeSkillsLower.map(normalizeSkill);
  const normalizedJD = jdSkillsLower.map(normalizeSkill);

  // Match JD skills against resume skills
  for (let i = 0; i < normalizedJD.length; i++) {
    const jdSkill = normalizedJD[i];
    const originalJdSkill = jdSkills[i] || jdSkill;

    // Check for exact match, partial match, or alias match
    const found = normalizedResume.some((rs) => {
      // Exact match
      if (rs === jdSkill) return true;
      // Partial match (one contains the other)
      if (rs.includes(jdSkill) || jdSkill.includes(rs)) return true;
      // Check if they share common aliases
      const jdAliases = skillAliases[jdSkill] || [jdSkill];
      const rsAliases = skillAliases[rs] || [rs];
      return jdAliases.some((a) => rsAliases.includes(a));
    });

    if (found) {
      matched.push(originalJdSkill);
    } else {
      missing.push(originalJdSkill);
    }
  }

  // Calculate score with weighted considerations
  let score = 0;
  if (jdSkills.length > 0) {
    const baseScore = (matched.length / jdSkills.length) * 100;

    // Bonus for having additional relevant skills not in JD
    const extraSkills = normalizedResume.filter(
      (s) => !normalizedJD.includes(s),
    );
    const extraBonus = Math.min(10, extraSkills.length * 2);

    score = Math.min(100, Math.round(baseScore + extraBonus));
  } else {
    // If no JD skills provided, score based on resume skills count
    score = Math.min(100, 50 + resumeSkills.length * 3);
  }

  return { score, matched, missing };
};

const calculateResumeSectionsScore = (
  resume: ResumeContent,
): { score: number; found: string[]; missing: string[] } => {
  const found: string[] = [];
  const missing: string[] = [];

  // Focus on the 4 critical sections: Summary, Skills, Experience, Projects
  const hasSummary = resume.summary && resume.summary.length > 20;
  const hasSkills = resume.skills && resume.skills.length > 3;
  const hasExperience = resume.experience && resume.experience.length > 0;
  const hasProjects = resume.projects && resume.projects.length > 0;

  // Check for Summary section (25% weight of sections score)
  if (hasSummary) {
    found.push("Professional Summary");
  } else {
    missing.push("Professional Summary");
  }

  // Check for Skills section (25% weight of sections score)
  if (hasSkills) {
    found.push("Technical Skills");
  } else {
    missing.push("Technical Skills");
  }

  // Check for Experience section (25% weight of sections score)
  if (hasExperience) {
    found.push("Work Experience");
  } else {
    missing.push("Work Experience");
  }

  // Check for Projects section (25% weight of sections score)
  if (hasProjects) {
    found.push("Projects");
  } else {
    missing.push("Projects");
  }

  // Calculate score based on the 4 critical sections
  const score = Math.round((found.length / 4) * 100);

  return { score, found, missing };
};

const calculateExperienceRelevanceScore = (
  resume: ResumeContent,
  jobTitle: string,
  jdKeywords: string[],
): { score: number; details: string } => {
  if (!resume.experience || resume.experience.length === 0) {
    return { score: 0, details: "No work experience found in resume" };
  }

  let totalRelevanceScore = 0;
  const experienceDetails: string[] = [];

  for (const exp of resume.experience) {
    const expText =
      `${exp.title} ${exp.company} ${experienceText(exp)}`.toLowerCase();

    // Count how many JD keywords appear in this experience
    let keywordMatchCount = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of jdKeywords) {
      const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      if (regex.test(expText)) {
        keywordMatchCount++;
        matchedKeywords.push(keyword);
      }
    }

    // Calculate relevance for this experience entry
    const entryRelevance =
      jdKeywords.length > 0
        ? (keywordMatchCount / jdKeywords.length) * 100
        : 50;

    totalRelevanceScore += entryRelevance;

    if (keywordMatchCount > 0) {
      experienceDetails.push(
        `${exp.title} at ${exp.company}: ${keywordMatchCount} matching keywords`,
      );
    }
  }

  // Average relevance across all experiences
  const relevanceScore = Math.round(
    totalRelevanceScore / resume.experience.length,
  );

  // Additional scoring for years of experience
  let yearsOfExp = 0;
  const resumeText = JSON.stringify(resume).toLowerCase();

  const dateRangeMatches =
    resumeText.match(/(\d{4})\s*[-–to]+\s*(\d{4}|present|current)/gi) || [];
  if (dateRangeMatches.length > 0) {
    const years: number[] = [];
    for (const match of dateRangeMatches) {
      const yearsMatch = match.match(/(\d{4})/g);
      if (yearsMatch && yearsMatch.length >= 2) {
        const startYear = parseInt(yearsMatch[0]);
        const endYear =
          yearsMatch[1].toLowerCase().includes("present") ||
          yearsMatch[1].toLowerCase().includes("current")
            ? new Date().getFullYear()
            : parseInt(yearsMatch[1]);
        years.push(Math.max(0, endYear - startYear));
      }
    }
    if (years.length > 0) {
      yearsOfExp = Math.max(...years);
    }
  }

  // Bonus for sufficient experience (2+ years)
  let experienceBonus = 0;
  if (yearsOfExp >= 5) experienceBonus = 15;
  else if (yearsOfExp >= 3) experienceBonus = 10;
  else if (yearsOfExp >= 2) experienceBonus = 5;

  const finalScore = Math.min(100, relevanceScore + experienceBonus);

  const details =
    relevanceScore > 0
      ? `${Math.round(relevanceScore)}% average relevance across ${resume.experience.length} role(s). ${yearsOfExp > 0 ? `${yearsOfExp} years of experience.` : ""}`
      : "Experience content does not match job requirements";

  return { score: finalScore, details };
};

const calculateJobMatchingScore = (
  resume: ResumeContent,
  jobDescription: string,
  jdKeywords: string[],
  jdSkills: string[],
): {
  overallScore: number;
  breakdown: AnalysisResult["jobMatchingBreakdown"];
} => {
  const resumeText = JSON.stringify(resume).toLowerCase();
  const jdText = jobDescription.toLowerCase();

  const resumeSkills = extractSkillsFromResume(resume);
  const resumeSkillsLower = resumeSkills.map((s) => s.toLowerCase());

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  const skillVariations: Record<string, string[]> = {
    react: ["react", "reactjs", "react.js", "reactjs/react"],
    reactjs: ["react", "reactjs", "react.js"],
    node: ["node", "node.js", "nodejs"],
    "node.js": ["node", "node.js", "nodejs"],
    typescript: ["typescript", "ts", "type script"],
    javascript: ["javascript", "js", "es6", "es5"],
    python: ["python", "python3", "python 3"],
    postgresql: ["postgresql", "postgres", "psql"],
    mongodb: ["mongodb", "mongo", "mongoose"],
    docker: ["docker", "docker container"],
    kubernetes: ["kubernetes", "k8s"],
    aws: ["aws", "amazon web services"],
    rest: ["rest", "rest api", "restful", "restful api"],
    "rest api": ["rest", "rest api", "restful", "restful api"],
    microservices: ["microservices", "microservice"],
    graphql: ["graphql", "gql"],
    "next.js": ["next.js", "nextjs", "next"],
    nestjs: ["nestjs", "nest", "nest.js"],
    vue: ["vue", "vue.js", "vuejs"],
    angular: ["angular", "angularjs"],
    express: ["express", "express.js", "expressjs"],
    mysql: ["mysql", "my sql"],
    redis: ["redis"],
    git: ["git", "github", "gitlab"],
    cicd: ["cicd", "ci/cd", "ci cd"],
    "ci/cd": ["cicd", "ci/cd", "ci cd"],
    linux: ["linux", "ubuntu", "debian"],
  };

  const isSkillMatch = (skill: string, jdTextCheck: string): boolean => {
    const skillLower = skill.toLowerCase();
    const jdLower = jdTextCheck.toLowerCase();

    if (jdLower.includes(skillLower)) return true;

    const variations = skillVariations[skillLower] || [skillLower];
    for (const variant of variations) {
      if (jdLower.includes(variant)) return true;
    }

    return false;
  };

  for (const skill of resumeSkillsLower) {
    if (isSkillMatch(skill, jdText)) {
      matchedSkills.push(skill);
    }
  }

  for (const jdSkill of jdSkills) {
    const jdSkillLower = jdSkill.toLowerCase();
    const found = resumeSkillsLower.some(
      (rs) =>
        rs.includes(jdSkillLower) ||
        jdSkillLower.includes(rs) ||
        rs === jdSkillLower ||
        isSkillMatch(rs, jdSkill),
    );
    if (!found) {
      missingSkills.push(jdSkill);
    }
  }

  const totalJD = jdSkills.length;
  const matchedCount = matchedSkills.length;
  const matchPercentage = totalJD > 0 ? (matchedCount / totalJD) * 100 : 0;

  const baseScore = totalJD > 0 ? Math.round(matchPercentage) : 70;
  const bonusForPartial =
    matchPercentage >= 30 && matchPercentage < 50 ? 10 : 0;

  const requiredSkillsMatch = {
    score: Math.min(100, baseScore + bonusForPartial),
    details: `${matchedCount} skills matched out of ${totalJD} required`,
  };

  let relevantWorkExperience = { score: 0, details: "" };
  if (resume.experience && resume.experience.length > 0) {
    let relevantRoles = 0;
    for (const exp of resume.experience) {
      const expText = `${exp.title} ${experienceText(exp)}`.toLowerCase();
      const matchCount = jdKeywords.filter((k) =>
        expText.includes(k.toLowerCase()),
      ).length;
      if (matchCount > 0) relevantRoles++;
    }
    relevantWorkExperience = {
      score: Math.round((relevantRoles / resume.experience.length) * 100),
      details: `${relevantRoles} of ${resume.experience.length} roles match job requirements`,
    };
  } else {
    relevantWorkExperience = { score: 0, details: "No work experience found" };
  }

  const resumeTechFromExp = extractTechFromText(
    resume.experience?.map(experienceText).join(" ") || "",
  );
  const resumeTechFromProjects = extractTechFromText(
    resume.projects?.map(projectText).join(" ") || "",
  );
  const allResumeTech = [
    ...new Set([...resumeTechFromExp, ...resumeTechFromProjects]),
  ];

  const jdTech = extractTechFromText(jobDescription);
  const techIntersection = jdTech.filter((t) =>
    allResumeTech.some(
      (rt) =>
        rt.toLowerCase().includes(t.toLowerCase()) ||
        t.toLowerCase().includes(rt.toLowerCase()),
    ),
  );

  const technologiesUsed = {
    score:
      jdTech.length > 0
        ? Math.round((techIntersection.length / jdTech.length) * 100)
        : 50,
    details: `${techIntersection.length} of ${jdTech.length} technologies from JD found in resume`,
  };

  const toolsInJD = jdKeywords.filter((k) =>
    [
      "git",
      "jira",
      "docker",
      "jenkins",
      "aws",
      "azure",
      "kubernetes",
      "linux",
      "jenkins",
      "github",
    ].some((t) => k.toLowerCase().includes(t)),
  );
  const toolsInResume = allResumeTech.filter((t) =>
    [
      "git",
      "jira",
      "docker",
      "jenkins",
      "aws",
      "azure",
      "kubernetes",
      "linux",
      "github",
    ].some((t) => t.toLowerCase().includes(t)),
  );

  const toolsFrameworks = {
    score:
      toolsInJD.length > 0
        ? Math.round((toolsInResume.length / toolsInJD.length) * 100)
        : 70,
    details:
      toolsInResume.length > 0
        ? `Found ${toolsInResume.length} relevant tools`
        : "Add tool experience to your resume",
  };

  const industryTerms = [
    "agile",
    "scrum",
    "software",
    "engineering",
    "development",
    "programming",
    "developer",
    "engineer",
  ];
  const industryMatches = industryTerms.filter(
    (term) => jdText.includes(term) && resumeText.includes(term),
  );

  const industryRelevance = {
    score: Math.round((industryMatches.length / industryTerms.length) * 100),
    details:
      industryMatches.length > 3
        ? "Resume aligns well with the industry"
        : "Tailor resume to match industry terminology",
  };

  let yearsExp = 0;
  if (resume.experience && resume.experience.length > 0) {
    const yearMatches =
      resumeText.match(/(\d+)\+?\s*(years?|yrs?|experience)/gi) || [];
    if (yearMatches.length > 0) {
      yearsExp = Math.max(
        ...yearMatches.map((m) => {
          const numMatch = m.match(/(\d+)/);
          return numMatch ? parseInt(numMatch[1]) : 0;
        }),
      );
    }

    if (yearsExp === 0) {
      const dateRangeMatches =
        resumeText.match(/(\d{4})\s*[-–to]+\s*(\d{4}|present|current)/gi) || [];
      if (dateRangeMatches.length > 0) {
        const years: number[] = [];
        for (const match of dateRangeMatches) {
          const yearsMatch = match.match(/(\d{4})/g);
          if (yearsMatch && yearsMatch.length >= 2) {
            const startYear = parseInt(yearsMatch[0]);
            const endYear =
              yearsMatch[1].toLowerCase().includes("present") ||
              yearsMatch[1].toLowerCase().includes("current")
                ? new Date().getFullYear()
                : parseInt(yearsMatch[1]);
            years.push(endYear - startYear);
          }
        }
        if (years.length > 0) {
          yearsExp = Math.max(...years);
        }
      }
    }
  }

  const jdYearsMatch =
    jdText.match(/(\d+)\+?\s*(years?|yrs?|experience)/gi) || [];
  let jdYears = 0;
  if (jdYearsMatch.length > 0) {
    jdYears = Math.max(
      ...jdYearsMatch.map((m) => {
        const numMatch = m.match(/(\d+)/);
        return numMatch ? parseInt(numMatch[1]) : 0;
      }),
    );
  }

  if (jdYears === 0) {
    const jdNumMatch = jdText.match(/(\d+)\s*\+\s*years/gi) || [];
    if (jdNumMatch.length > 0) {
      jdYears = parseInt(jdNumMatch[0].match(/(\d+)/)?.[1] || "0");
    }
  }

  let yearsScore = 50;
  let yearsDetails = "Unable to determine years of experience requirement";

  if (jdYears > 0 && yearsExp > 0) {
    if (yearsExp >= jdYears) {
      yearsScore = 100;
      yearsDetails = `Meets ${jdYears}+ years requirement (${yearsExp} years found)`;
    } else if (yearsExp >= jdYears * 0.7) {
      yearsScore = 70;
      yearsDetails = `Close to ${jdYears}+ years requirement (${yearsExp} years found)`;
    } else {
      yearsScore = 40;
      yearsDetails = `Below ${jdYears}+ years requirement (${yearsExp} years found)`;
    }
  } else if (yearsExp > 0 && jdYears === 0) {
    yearsScore = 80;
    yearsDetails = `${yearsExp} years of experience found (JD experience not specified)`;
  } else if (jdYears > 0 && yearsExp === 0) {
    yearsScore = 30;
    yearsDetails = `Resume does not clearly state years of experience (JD requires ${jdYears}+ years)`;
  }

  const yearsExperienceAlignment = { score: yearsScore, details: yearsDetails };

  const jdActionVerbs =
    jdText.match(
      /\b(managed|led|developed|designed|implemented|created|built|optimized|improved|increased)\b/gi,
    ) || [];
  const resumeActionVerbs =
    resumeText.match(
      /\b(managed|led|developed|designed|implemented|created|built|optimized|improved|increased)\b/gi,
    ) || [];
  const verbSimilarity =
    jdActionVerbs.length > 0
      ? Math.round(
          (resumeActionVerbs.length / jdActionVerbs.length) *
            Math.min(100, resumeActionVerbs.length * 10),
        )
      : 50;

  const roleResponsibilitySimilarity = {
    score: Math.min(100, verbSimilarity + 20),
    details:
      resumeActionVerbs.length > 0
        ? "Responsibilities align with job description"
        : "Use more action verbs matching job requirements",
  };

  const breakdown = {
    requiredSkillsMatch: requiredSkillsMatch as any,
    relevantWorkExperience,
    technologiesUsed,
    toolsFrameworks,
    industryRelevance,
    yearsExperienceAlignment,
    roleResponsibilitySimilarity,
  };

  const weights = {
    requiredSkillsMatch: 0.25,
    relevantWorkExperience: 0.2,
    technologiesUsed: 0.15,
    toolsFrameworks: 0.15,
    industryRelevance: 0.1,
    yearsExperienceAlignment: 0.1,
    roleResponsibilitySimilarity: 0.05,
  };

  const overallScore = Math.round(
    requiredSkillsMatch.score * weights.requiredSkillsMatch +
      relevantWorkExperience.score * weights.relevantWorkExperience +
      technologiesUsed.score * weights.technologiesUsed +
      toolsFrameworks.score * weights.toolsFrameworks +
      industryRelevance.score * weights.industryRelevance +
      yearsExperienceAlignment.score * weights.yearsExperienceAlignment +
      roleResponsibilitySimilarity.score * weights.roleResponsibilitySimilarity,
  );

  return { overallScore, breakdown };
};

export const analyzeResume = async (
  resume: ResumeContent,
  jobDescription: string,
): Promise<AnalysisResult> => {
  const apiKey = env.geminiApiKey;

  if (!apiKey) {
    console.warn("GEMINI_API_KEY not set, using fallback analysis");
    return fallbackAnalysis(resume, jobDescription);
  }

  try {
    const resumeText = JSON.stringify(resume, null, 2);
    const jdLower = jobDescription.toLowerCase();

    const jdKeywords = extractTechFromText(jobDescription);
    const jdSkills = extractSkillsFromText(jobDescription);

    const resumeSkills = extractSkillsFromResume(resume);
    const resumeSkillsLower = resumeSkills.map((s) => s.toLowerCase());

    // Calculate individual scores with improved algorithms
    const keywordMatching = calculateKeywordMatchingScore(
      resumeText,
      jdKeywords,
      resumeSkills,
    );

    const skillsMatchResult = calculateSkillsMatchScore(resumeSkills, jdSkills);
    const skillsMatch = {
      score: skillsMatchResult.score,
      matched: skillsMatchResult.matched,
      missing: skillsMatchResult.missing,
    };

    const resumeSections = calculateResumeSectionsScore(resume);
    const experienceRelevance = calculateExperienceRelevanceScore(
      resume,
      "",
      jdKeywords,
    );

    let jobMatchingScore = 0;
    let jobMatchingBreakdown: AnalysisResult["jobMatchingBreakdown"];

    if (jobDescription && jobDescription.trim()) {
      const jobMatchResult = calculateJobMatchingScore(
        resume,
        jobDescription,
        jdKeywords,
        jdSkills,
      );
      jobMatchingScore = jobMatchResult.overallScore;
      jobMatchResult.breakdown.requiredSkillsMatch = {
        score: jobMatchResult.breakdown.requiredSkillsMatch.score,
        details: `${skillsMatch.matched.length} skills matched`,
      };
      jobMatchingBreakdown = jobMatchResult.breakdown as any;
    } else {
      jobMatchingBreakdown = {
        requiredSkillsMatch: {
          score: 0,
          details: "No job description provided",
        },
        relevantWorkExperience: {
          score: 0,
          details: "No job description provided",
        },
        technologiesUsed: { score: 0, details: "No job description provided" },
        toolsFrameworks: { score: 0, details: "No job description provided" },
        industryRelevance: { score: 0, details: "No job description provided" },
        yearsExperienceAlignment: {
          score: 0,
          details: "No job description provided",
        },
        roleResponsibilitySimilarity: {
          score: 0,
          details: "No job description provided",
        },
      };
    }

    const existingSections = {
      experience:
        resume.experience &&
        resume.experience.length > 0 &&
        resume.experience.some((e) => e.company || e.title),
      education:
        resume.education &&
        resume.education.length > 0 &&
        resume.education.some((e) => e.institution || e.degree),
      skills: resume.skills && resume.skills.length > 0,
      summary: !!(resume.summary && resume.summary.length > 10),
      projects: !!(resume.projects && resume.projects.length > 0),
    };

    const missingKeywords = categorizeMissingKeywords(
      resumeSkills,
      resume,
      jdSkills,
    );

    const suggestions: string[] = [];

    // Priority suggestions based on new scoring criteria
    if (keywordMatching.missing.length > 0) {
      suggestions.push(
        `Add missing keywords: ${keywordMatching.missing.slice(0, 5).join(", ")}`,
      );
    }

    if (skillsMatch.missing.length > 0) {
      suggestions.push(
        `Add missing skills: ${skillsMatch.missing.slice(0, 5).join(", ")}`,
      );
    }

    if (!existingSections.summary) {
      suggestions.push(
        "Add a professional summary to highlight your key qualifications",
      );
    }

    if (!existingSections.projects) {
      suggestions.push(
        "Add a projects section to showcase your practical experience",
      );
    }

    if (!existingSections.experience) {
      suggestions.push(
        "Add relevant work experience to demonstrate your skills",
      );
    }

    if (!existingSections.skills || resume.skills.length < 3) {
      suggestions.push(
        "Expand your technical skills section with relevant technologies",
      );
    }

    if (experienceRelevance.score < 50) {
      suggestions.push(
        "Tailor your experience descriptions to match job requirements and keywords",
      );
    }

    const strengths: string[] = [];
    if (
      existingSections.summary &&
      resume.summary &&
      resume.summary.length > 30
    )
      strengths.push("Professional summary included");
    if (existingSections.skills && resume.skills.length > 5)
      strengths.push(
        `Strong skills section with ${resume.skills.length} technical skills`,
      );
    if (existingSections.experience && resume.experience.length > 0)
      strengths.push("Work experience section present");
    if (existingSections.projects)
      strengths.push("Projects section showcases practical work");
    if (keywordMatching.score >= 60)
      strengths.push("Good keyword matching with job description");
    if (skillsMatch.score >= 60)
      strengths.push("Strong skills alignment with job requirements");

    const weaknesses: string[] = [];
    if (!existingSections.summary)
      weaknesses.push("Missing professional summary");
    if (!existingSections.projects) weaknesses.push("No projects section");
    if (!existingSections.experience)
      weaknesses.push("No work experience listed");
    if (keywordMatching.score < 50)
      weaknesses.push("Low keyword match with job description");
    if (skillsMatch.score < 50) weaknesses.push("Skills gap identified");

    const jobMatchingScoreFinal = Math.max(jobMatchingScore, 30);

    const hasGoodMatch =
      jobMatchingScore >= 60 ||
      (skillsMatch.matched.length > 0 && skillsMatch.missing.length <= 3);
    const bonusForGoodMatch = hasGoodMatch ? 10 : 0;

    const overallScore = jobDescription
      ? Math.min(100, Math.round(jobMatchingScoreFinal) + bonusForGoodMatch)
      : jobMatchingScoreFinal;

    return {
      jobMatchingScore,
      jobMatchingBreakdown: jobMatchingBreakdown || ({} as any),
      score: overallScore,
      feedback: {
        overall: `Overall Score: ${overallScore}% | Job Match: ${jobDescription ? jobMatchingScore + "%" : "N/A"}. ${suggestions[0] || "Good overall profile"}`,
        strengths,
        weaknesses,
        suggestions: suggestions.slice(0, 7),
      },
      sectionScores: {
        skills: {
          score: skillsMatch.score,
          matched: skillsMatch.matched,
          missing: skillsMatch.missing,
        },
        experience: {
          score: experienceRelevance.score,
          details: experienceRelevance.details,
        },
        education: {
          score: resume.education && resume.education.length > 0 ? 75 : 50,
          details:
            resume.education && resume.education.length > 0
              ? "Education section present"
              : "Consider adding education details",
        },
        format: {
          score: Math.round((keywordMatching.score + skillsMatch.score) / 2),
          details: "Resume format evaluated based on content structure",
        },
      },
      keywords: {
        found: keywordMatching.found,
        missing: keywordMatching.missing,
        density: {},
      },
      missingKeywords,
      recommendedKeywords: RECOMMENDED_KEYWORDS,
      howToUseKeywords: [
        'Add Docker inside the "Projects" section by describing containerized deployment',
        "Mention CI/CD inside your experience or project deployment workflow",
        "Use REST API in project descriptions",
        "Add microservices experience if you've worked with distributed systems",
        "Include testing experience in your project or work history",
      ],
      resumeImprovements: suggestions,
      jobMatch: jobDescription
        ? {
            score: jobMatchingScore,
            missingKeywords: skillsMatch.missing,
            suggestions,
          }
        : undefined,
      existingSections,
    };
  } catch (error) {
    console.error("Analysis error:", error);
    return fallbackAnalysis(resume, jobDescription);
  }
};

const extractSkillsFromResume = (resume: ResumeContent): string[] => {
  const allSkills: string[] = [];

  if (resume.skills && Array.isArray(resume.skills)) {
    allSkills.push(...resume.skills.map((s) => s.toLowerCase()));
  }

  if (resume.experience && Array.isArray(resume.experience)) {
    resume.experience.forEach((exp) => {
      const expText = experienceText(exp);
      if (expText) {
        const descSkills = extractTechFromText(expText);
        allSkills.push(...descSkills);
      }
    });
  }

  if (resume.projects && Array.isArray(resume.projects)) {
    resume.projects.forEach((proj) => {
      const projTextValue = projectText(proj);
      if (projTextValue) {
        const projSkills = extractTechFromText(projTextValue);
        allSkills.push(...projSkills);
      }
      if (proj.technologies && Array.isArray(proj.technologies)) {
        allSkills.push(...proj.technologies.map((t) => t.toLowerCase()));
      }
    });
  }

  return [...new Set(allSkills)];
};

const extractTechFromText = (text: string): string[] => {
  const textLower = text.toLowerCase();
  const found: string[] = [];

  const allKeywords = [
    ...COMPREHENSIVE_KEYWORDS.programmingLanguages,
    ...COMPREHENSIVE_KEYWORDS.frameworks,
    ...COMPREHENSIVE_KEYWORDS.databases,
    ...COMPREHENSIVE_KEYWORDS.tools,
    ...COMPREHENSIVE_KEYWORDS.devops,
  ];

  for (const keyword of allKeywords) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(textLower)) {
      found.push(keyword);
    }
  }

  const jobSpecificTerms = extractJobSpecificKeywords(text);
  for (const term of jobSpecificTerms) {
    if (!found.includes(term)) {
      found.push(term);
    }
  }

  return found;
};

const extractJobSpecificKeywords = (text: string): string[] => {
  const textLower = text.toLowerCase();
  const keywords: string[] = [];

  const commonJobTerms = [
    { pattern: /rest[\s-]?api/gi, term: "REST API" },
    { pattern: /restful/gi, term: "RESTful" },
    { pattern: /microservice/gi, term: "microservices" },
    { pattern: /type[\s]?script/gi, term: "typescript" },
    { pattern: /node[\s\.]?js/gi, term: "node.js" },
    { pattern: /express[\s]?js/gi, term: "express" },
    { pattern: /next[\s\.]?js/gi, term: "next.js" },
    { pattern: /react[\s\.]?native/gi, term: "react native" },
    { pattern: /amazon[\s]?web[\s]?services/gi, term: "AWS" },
    { pattern: /ci[\/\s]?cd/gi, term: "CI/CD" },
    { pattern: /agile/gi, term: "agile" },
    { pattern: /scrum/gi, term: "scrum" },
    { pattern: /tdd/gi, term: "TDD" },
    { pattern: /bdd/gi, term: "BDD" },
    { pattern: /oop/gi, term: "OOP" },
    { pattern: /solid/gi, term: "SOLID" },
    { pattern: /crud/gi, term: "CRUD" },
    { pattern: /jwt/gi, term: "JWT" },
    { pattern: /oauth/gi, term: "OAuth" },
    { pattern: /ssl?\/tls/gi, term: "SSL/TLS" },
    { pattern: /http[s]?\s?\/[\d\.]+/g, term: "HTTP" },
    { pattern: /websocket/gi, term: "WebSocket" },
    { pattern: /graphql/gi, term: "GraphQL" },
    { pattern: /mongodb/gi, term: "MongoDB" },
    { pattern: /postgresql/gi, term: "PostgreSQL" },
    { pattern: /mysql/gi, term: "MySQL" },
    { pattern: /redis/gi, term: "Redis" },
    { pattern: /docker/gi, term: "Docker" },
    { pattern: /kubernetes/gi, term: "Kubernetes" },
    { pattern: /k8s/gi, term: "Kubernetes" },
    { pattern: /git/gi, term: "Git" },
    { pattern: /github/gi, term: "GitHub" },
    { pattern: /gitlab/gi, term: "GitLab" },
    { pattern: /aws\s+lambda/gi, term: "AWS Lambda" },
    { pattern: /ec2/gi, term: "EC2" },
    { pattern: /s3/gi, term: "S3" },
    { pattern: /rabbitmq/gi, term: "RabbitMQ" },
    { pattern: /kafka/gi, term: "Kafka" },
    { pattern: /nginx/gi, term: "Nginx" },
    { pattern: /elasticsearch/gi, term: "Elasticsearch" },
    { pattern: /firebase/gi, term: "Firebase" },
    { pattern: /prisma/gi, term: "Prisma" },
    { pattern: /typescript/gi, term: "TypeScript" },
  ];

  for (const { pattern, term } of commonJobTerms) {
    if (pattern.test(textLower)) {
      keywords.push(term);
    }
  }

  return keywords;
};

const extractSkillsFromText = (text: string): string[] => {
  const textLower = text.toLowerCase();
  const found: string[] = [];

  const allSkills = [
    ...COMPREHENSIVE_KEYWORDS.programmingLanguages,
    ...COMPREHENSIVE_KEYWORDS.frameworks,
    ...COMPREHENSIVE_KEYWORDS.databases,
    ...COMPREHENSIVE_KEYWORDS.tools,
    ...COMPREHENSIVE_KEYWORDS.devops,
    ...COMPREHENSIVE_KEYWORDS.softSkills,
  ];

  for (const skill of allSkills) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(textLower)) {
      found.push(skill);
    }
  }

  const jobSpecificTerms = extractJobSpecificKeywords(text);
  for (const term of jobSpecificTerms) {
    if (!found.includes(term)) {
      found.push(term);
    }
  }

  return found;
};

const categorizeMissingKeywords = (
  foundSkills: string[],
  resume: ResumeContent,
  jdSkills: string[] = [],
): AnalysisResult["missingKeywords"] => {
  const foundLower = foundSkills.map((s) => s.toLowerCase().trim());
  const jdSkillsLower = jdSkills.map((s) => s.toLowerCase().trim());

  const missing: AnalysisResult["missingKeywords"] = {
    programmingLanguages: [],
    frameworks: [],
    databases: [],
    tools: [],
    devops: [],
    softSkills: [],
  };

  const allKeywords = [
    ...COMPREHENSIVE_KEYWORDS.programmingLanguages,
    ...COMPREHENSIVE_KEYWORDS.frameworks,
    ...COMPREHENSIVE_KEYWORDS.databases,
    ...COMPREHENSIVE_KEYWORDS.tools,
    ...COMPREHENSIVE_KEYWORDS.devops,
    ...COMPREHENSIVE_KEYWORDS.softSkills,
  ];

  const categorizeSkill = (skill: string): keyof typeof missing => {
    const skillLower = skill.toLowerCase();
    if (
      COMPREHENSIVE_KEYWORDS.programmingLanguages.some(
        (k) =>
          k.toLowerCase() === skillLower ||
          k.toLowerCase().includes(skillLower),
      )
    )
      return "programmingLanguages";
    if (
      COMPREHENSIVE_KEYWORDS.frameworks.some(
        (k) =>
          k.toLowerCase() === skillLower ||
          k.toLowerCase().includes(skillLower),
      )
    )
      return "frameworks";
    if (
      COMPREHENSIVE_KEYWORDS.databases.some(
        (k) =>
          k.toLowerCase() === skillLower ||
          k.toLowerCase().includes(skillLower),
      )
    )
      return "databases";
    if (
      COMPREHENSIVE_KEYWORDS.tools.some(
        (k) =>
          k.toLowerCase() === skillLower ||
          k.toLowerCase().includes(skillLower),
      )
    )
      return "tools";
    if (
      COMPREHENSIVE_KEYWORDS.devops.some(
        (k) =>
          k.toLowerCase() === skillLower ||
          k.toLowerCase().includes(skillLower),
      )
    )
      return "devops";
    if (
      COMPREHENSIVE_KEYWORDS.softSkills.some(
        (k) =>
          k.toLowerCase() === skillLower ||
          k.toLowerCase().includes(skillLower),
      )
    )
      return "softSkills";
    return "tools";
  };

  for (const keyword of allKeywords) {
    const keywordLower = keyword.toLowerCase();
    const isInResume = foundLower.some(
      (fs) => fs.includes(keywordLower) || keywordLower.includes(fs),
    );
    const isInJD = jdSkillsLower.some(
      (js) => js.includes(keywordLower) || keywordLower.includes(js),
    );

    if (isInJD && !isInResume) {
      const category = categorizeSkill(keyword);
      missing[category].push(keyword);
    }
  }

  return missing;
};

const fallbackAnalysis = (
  resume: ResumeContent,
  jobDescription: string,
): AnalysisResult => {
  const resumeSkills = extractSkillsFromResume(resume);
  const jdLower = jobDescription.toLowerCase();
  const jobKeywords = extractTechFromText(jobDescription);

  const matchedSkills = resumeSkills.filter((skill) =>
    jdLower.includes(skill.toLowerCase()),
  );

  const missingFromJD = resumeSkills
    .filter((skill) => !jdLower.includes(skill.toLowerCase()))
    .slice(0, 10);

  // Calculate scores using new criteria
  const keywordMatchingScore =
    jobKeywords.length > 0
      ? Math.round((matchedSkills.length / jobKeywords.length) * 100)
      : 50;

  const skillsScore =
    resumeSkills.length > 0
      ? Math.min(
          100,
          Math.round(
            (matchedSkills.length / Math.max(matchedSkills.length, 1)) * 100,
          ),
        )
      : 50;

  // Section scores based on 4 critical sections
  const hasSummary = resume.summary && resume.summary.length > 20;
  const hasSkills = resume.skills && resume.skills.length > 3;
  const hasExperience = resume.experience && resume.experience.length > 0;
  const hasProjects = resume.projects && resume.projects.length > 0;
  const sectionsScore = Math.round(
    (((hasSummary ? 1 : 0) +
      (hasSkills ? 1 : 0) +
      (hasExperience ? 1 : 0) +
      (hasProjects ? 1 : 0)) /
      4) *
      100,
  );

  const experienceScore = resume.experience?.length > 0 ? 70 : 40;

  // Overall score based on keywords and skills
  const overallScore = Math.round(
    (keywordMatchingScore + skillsScore + sectionsScore + experienceScore) / 4,
  );

  const existingSections = {
    experience:
      resume.experience &&
      resume.experience.length > 0 &&
      resume.experience.some((e) => e.company || e.title),
    education:
      resume.education &&
      resume.education.length > 0 &&
      resume.education.some((e) => e.institution || e.degree),
    skills: resume.skills && resume.skills.length > 0,
    summary: !!(resume.summary && resume.summary.length > 10),
    projects: !!(resume.projects && resume.projects.length > 0),
  };

  const missingKeywords = categorizeMissingKeywords(resumeSkills, resume);

  let jobMatch = undefined;
  if (jobDescription && jobDescription.trim()) {
    const matchScore =
      resumeSkills.length > 0
        ? Math.round(
            (matchedSkills.length /
              Math.max(
                matchedSkills.length + missingFromJD.length,
                resumeSkills.length,
              )) *
              100,
          )
        : 0;
    jobMatch = {
      score: matchScore,
      missingKeywords: missingFromJD,
      suggestions: [
        "Add missing keywords to your skills section",
        "Incorporate job requirements in your project descriptions",
        "Tailor your summary to the specific role",
      ],
    };
  }

  const suggestions: string[] = [];
  if (!existingSections.summary) suggestions.push("Add a professional summary");
  if (!existingSections.projects) suggestions.push("Add a projects section");
  if (!existingSections.experience) suggestions.push("Add work experience");
  if (resume.skills.length < 5) suggestions.push("Expand your skills section");
  if (keywordMatchingScore < 50)
    suggestions.push("Add more keywords from job description");

  return {
    score: overallScore,
    feedback: {
      overall: `Overall Score: ${overallScore}%. ${suggestions[0] || "Good overall profile"}`,
      strengths: matchedSkills.slice(0, 5),
      weaknesses: missingFromJD.slice(0, 5),
      suggestions: [
        "Add missing keywords from the job description",
        "Ensure all 4 critical sections are present (Summary, Skills, Experience, Projects)",
        "Tailor your summary to the specific role",
        "Highlight relevant technical skills",
        "Quantify achievements in experience section",
      ],
    },
    sectionScores: {
      skills: {
        score: skillsScore,
        matched: matchedSkills,
        missing: missingFromJD,
      },
      experience: {
        score: experienceScore,
        details:
          resume.experience?.length > 0
            ? "Professional experience included"
            : "Add relevant work experience",
      },
      education: {
        score: resume.education?.length > 0 ? 75 : 50,
        details:
          resume.education?.length > 0
            ? "Education section is present"
            : "Consider adding education details",
      },
      format: {
        score: Math.round((keywordMatchingScore + skillsScore) / 2),
        details: "Resume format evaluated",
      },
    },
    keywords: {
      found: resumeSkills,
      missing: missingFromJD,
      density: {},
    },
    missingKeywords,
    recommendedKeywords: RECOMMENDED_KEYWORDS,
    howToUseKeywords: [
      'Add Docker inside the "Projects" section by describing containerized deployment',
      "Mention CI/CD inside your experience or project deployment workflow",
      "Use REST API in project descriptions",
      "Add microservices experience if you've worked with distributed systems",
      "Include testing experience in your project or work history",
    ],
    resumeImprovements: [
      "Improve bullet point structure - use action verbs at the start",
      "Add measurable impact - include numbers and percentages where possible",
      "Improve project descriptions with specific technologies used",
      "Ensure consistent formatting throughout the resume",
      "Add quantifiable achievements in experience section",
    ],
    jobMatch,
    existingSections,
    jobMatchingScore: 0,
    jobMatchingBreakdown: {
      requiredSkillsMatch: { score: 0, details: "No job description provided" },
      relevantWorkExperience: {
        score: 0,
        details: "No job description provided",
      },
      technologiesUsed: { score: 0, details: "No job description provided" },
      toolsFrameworks: { score: 0, details: "No job description provided" },
      industryRelevance: { score: 0, details: "No job description provided" },
      yearsExperienceAlignment: {
        score: 0,
        details: "No job description provided",
      },
      roleResponsibilitySimilarity: {
        score: 0,
        details: "No job description provided",
      },
    },
  };
};

export const extractTechFromTextExport = extractTechFromText;
