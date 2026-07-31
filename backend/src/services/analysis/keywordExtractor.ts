export interface ExtractedKeywords {
  technical: KeywordGroup;
  soft: KeywordGroup;
  action: KeywordGroup;
  industry: KeywordGroup;
  all: string[];
}

export interface KeywordGroup {
  keywords: string[];
  categories: Record<string, string[]>;
  frequency: Record<string, number>;
}

/**
 * Comprehensive skill taxonomy for categorization
 */
export const SKILL_TAXONOMY = {
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
    "scala",
    "r",
    "matlab",
    "sql",
    "html",
    "css",
    "dart",
    "shell",
    "bash",
    "perl",
    "lua",
  ],
  frontendFrameworks: [
    "react",
    "angular",
    "vue",
    "svelte",
    "next.js",
    "nuxt",
    "gatsby",
    "remix",
    "solid",
    "qwik",
    "ember",
    "backbone",
  ],
  backendFrameworks: [
    "express",
    "fastify",
    "nestjs",
    "django",
    "flask",
    "fastapi",
    "spring",
    "rails",
    "laravel",
    "symfony",
    "asp.net",
    "gin",
    "fiber",
  ],
  databases: [
    "mongodb",
    "postgresql",
    "mysql",
    "redis",
    "sqlite",
    "elasticsearch",
    "dynamodb",
    "cassandra",
    "mariadb",
    "oracle",
    "mssql",
    "firebase",
    "supabase",
    "prisma",
    "mongoose",
    "sequelize",
    "typeorm",
  ],
  cloudPlatforms: [
    "aws",
    "azure",
    "gcp",
    "digitalocean",
    "heroku",
    "vercel",
    "netlify",
    "cloudflare",
    "linode",
    "vultr",
    "ibm cloud",
    "oracle cloud",
  ],
  devopsTools: [
    "docker",
    "kubernetes",
    "jenkins",
    "gitlab ci",
    "github actions",
    "circleci",
    "travis ci",
    "ansible",
    "terraform",
    "puppet",
    "chef",
    "prometheus",
    "grafana",
    "datadog",
    "new relic",
  ],
  testingTools: [
    "jest",
    "mocha",
    "cypress",
    "playwright",
    "selenium",
    "vitest",
    "testing library",
    "jasmine",
    "pytest",
    "junit",
    "postman",
  ],
  versionControl: ["git", "github", "gitlab", "bitbucket", "svn", "mercurial"],
  methodologies: [
    "agile",
    "scrum",
    "kanban",
    "lean",
    "devops",
    "ci/cd",
    "tdd",
    "bdd",
    "microservices",
    "serverless",
    "event-driven",
    "rest",
    "graphql",
  ],
  softSkills: [
    "leadership",
    "communication",
    "teamwork",
    "problem solving",
    "critical thinking",
    "time management",
    "adaptability",
    "collaboration",
    "mentoring",
    "presentation",
    "negotiation",
    "conflict resolution",
  ],
};

/**
 * Action verbs commonly used in job descriptions
 */
export const ACTION_VERBS = [
  // Technical Actions
  "developed",
  "designed",
  "implemented",
  "architected",
  "engineered",
  "programmed",
  "coded",
  "debugged",
  "tested",
  "deployed",

  // Leadership Actions
  "led",
  "managed",
  "directed",
  "supervised",
  "mentored",
  "coordinated",
  "facilitated",
  "guided",
  "trained",
  "delegated",

  // Improvement Actions
  "optimized",
  "improved",
  "enhanced",
  "refactored",
  "streamlined",
  "automated",
  "modernized",
  "upgraded",
  "migrated",

  // Creation Actions
  "created",
  "built",
  "established",
  "founded",
  "initiated",
  "launched",
  "introduced",
  "pioneered",
  "conceptualized",

  // Analysis Actions
  "analyzed",
  "evaluated",
  "assessed",
  "investigated",
  "researched",
  "identified",
  "diagnosed",
  "audited",

  // Communication Actions
  "communicated",
  "presented",
  "documented",
  "reported",
  "collaborated",
  "negotiated",
  "persuaded",
  "influenced",

  // Achievement Actions
  "achieved",
  "delivered",
  "exceeded",
  "accomplished",
  "attained",
  "secured",
  "won",
  "earned",
];

/**
 * Industry-specific terms by domain
 */
export const INDUSTRY_TERMS = {
  softwareDevelopment: [
    "sdlc",
    "code review",
    "version control",
    "branching",
    "merging",
    "pull request",
    "continuous integration",
    "continuous deployment",
    "api",
    "microservice",
    "monolith",
    "serverless",
    "cloud-native",
  ],
  webDevelopment: [
    "responsive",
    "spa",
    "ssr",
    "ssg",
    "pwa",
    "seo",
    "accessibility",
    "wcag",
    "cross-browser",
    "mobile-first",
    "performance optimization",
  ],
  dataEngineering: [
    "etl",
    "data pipeline",
    "data warehouse",
    "data lake",
    "big data",
    "streaming",
    "batch processing",
    "data modeling",
    "data governance",
  ],
  machineLearning: [
    "machine learning",
    "deep learning",
    "neural network",
    "nlp",
    "cv",
    "model training",
    "feature engineering",
    "hyperparameter tuning",
  ],
  cybersecurity: [
    "security",
    "encryption",
    "authentication",
    "authorization",
    "oauth",
    "jwt",
    "ssl",
    "tls",
    "penetration testing",
    "vulnerability assessment",
  ],
  projectManagement: [
    "stakeholder",
    "roadmap",
    "milestone",
    "deliverable",
    "sprint",
    "backlog",
    "retrospective",
    "standup",
    "planning",
    "estimation",
  ],
};

/**
 * Extract keywords from text
 */
export function extractKeywords(text: string): ExtractedKeywords {
  const textLower = text.toLowerCase();

  const result: ExtractedKeywords = {
    technical: { keywords: [], categories: {}, frequency: {} },
    soft: { keywords: [], categories: {}, frequency: {} },
    action: { keywords: [], categories: {}, frequency: {} },
    industry: { keywords: [], categories: {}, frequency: {} },
    all: [],
  };

  // Extract technical skills
  Object.entries(SKILL_TAXONOMY).forEach(([category, skills]) => {
    if (category === "softSkills") return;

    const matchedSkills = skills.filter((skill) => {
      const escaped = escapeRegex(skill);
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      return regex.test(textLower);
    });

    if (matchedSkills.length > 0) {
      result.technical.categories[category] = matchedSkills;
      result.technical.keywords.push(...matchedSkills);
      matchedSkills.forEach((skill) => {
        result.technical.frequency[skill] = countOccurrences(textLower, skill);
      });
    }
  });

  // Extract soft skills
  const matchedSoftSkills = SKILL_TAXONOMY.softSkills.filter((skill) => {
    const escaped = escapeRegex(skill);
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(textLower);
  });

  if (matchedSoftSkills.length > 0) {
    result.soft.keywords = matchedSoftSkills;
    result.soft.categories["interpersonal"] = matchedSoftSkills;
    matchedSoftSkills.forEach((skill) => {
      result.soft.frequency[skill] = countOccurrences(textLower, skill);
    });
  }

  // Extract action verbs
  const matchedVerbs = ACTION_VERBS.filter((verb) => {
    const escaped = escapeRegex(verb);
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    return regex.test(textLower);
  });

  if (matchedVerbs.length > 0) {
    result.action.keywords = matchedVerbs;
    matchedVerbs.forEach((verb) => {
      result.action.frequency[verb] = countOccurrences(textLower, verb);
    });
  }

  // Extract industry terms
  Object.entries(INDUSTRY_TERMS).forEach(([domain, terms]) => {
    const matchedTerms = terms.filter((term) => {
      const escaped = escapeRegex(term);
      const regex = new RegExp(`\\b${escaped}\\b`, "i");
      return regex.test(textLower);
    });

    if (matchedTerms.length > 0) {
      result.industry.categories[domain] = matchedTerms;
      result.industry.keywords.push(...matchedTerms);
      matchedTerms.forEach((term) => {
        result.industry.frequency[term] = countOccurrences(textLower, term);
      });
    }
  });

  // Combine all keywords
  result.all = [
    ...result.technical.keywords,
    ...result.soft.keywords,
    ...result.action.keywords,
    ...result.industry.keywords,
  ];

  return result;
}

/**
 * Extract skills specifically from resume content
 */
export function extractSkillsFromResume(resume: any): string[] {
  const skills: Set<string> = new Set();

  // Explicit skills section
  if (Array.isArray(resume.skills)) {
    resume.skills.forEach((skill: string) => {
      if (skill && typeof skill === "string") {
        skills.add(skill.toLowerCase().trim());
      }
    });
  }

  // Extract from experience descriptions
  if (Array.isArray(resume.experience)) {
    resume.experience.forEach((exp: any) => {
      const expText = (exp.highlights || []).join(" ");
      if (expText) {
        const extracted = extractKeywords(expText);
        extracted.technical.keywords.forEach((s) => skills.add(s));
      }
      if (Array.isArray(exp.technologies)) {
        exp.technologies.forEach((t: string) =>
          skills.add(t.toLowerCase().trim()),
        );
      }
    });
  }

  // Extract from projects
  if (Array.isArray(resume.projects)) {
    resume.projects.forEach((proj: any) => {
      const projText = (proj.highlights || []).join(" ");
      if (projText) {
        const extracted = extractKeywords(projText);
        extracted.technical.keywords.forEach((s) => skills.add(s));
      }
      if (Array.isArray(proj.technologies)) {
        proj.technologies.forEach((t: string) =>
          skills.add(t.toLowerCase().trim()),
        );
      }
    });
  }

  return Array.from(skills);
}

/**
 * Parse job description into structured format
 */
export function parseJobDescription(jdText: string): {
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
  actionVerbs: string[];
  experienceYears: number;
} {
  const keywords = extractKeywords(jdText);
  const allSkills = [...keywords.technical.keywords, ...keywords.soft.keywords];

  // Try to identify required vs preferred skills
  const requiredSkills: string[] = [];
  const preferredSkills: string[] = [];

  const requiredPatterns = [
    /must have[:\s]+([^.]+)/gi,
    /required[:\s]+([^.]+)/gi,
    /essential[:\s]+([^.]+)/gi,
    /\b(\d+)\+?\s*years?\b/gi,
  ];

  const preferredPatterns = [
    /nice to have[:\s]+([^.]+)/gi,
    /preferred[:\s]+([^.]+)/gi,
    /bonus[:\s]+([^.]+)/gi,
    /familiarity with/gi,
  ];

  requiredPatterns.forEach((pattern) => {
    const matches = jdText.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        const extracted = extractKeywords(match);
        requiredSkills.push(...extracted.technical.keywords);
      });
    }
  });

  preferredPatterns.forEach((pattern) => {
    const matches = jdText.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        const extracted = extractKeywords(match);
        preferredSkills.push(...extracted.technical.keywords);
      });
    }
  });

  // If no clear distinction, split by common patterns
  if (requiredSkills.length === 0 && preferredSkills.length === 0) {
    // Assume first 60% are required, rest are preferred
    const splitIndex = Math.floor(allSkills.length * 0.6);
    requiredSkills.push(...allSkills.slice(0, splitIndex));
    preferredSkills.push(...allSkills.slice(splitIndex));
  }

  // Extract years of experience
  const yearsMatch = jdText.match(/(\d+)\+?\s*(years?|yrs?)/i);
  const experienceYears = yearsMatch ? parseInt(yearsMatch[1]) : 0;

  return {
    requiredSkills: [...new Set(requiredSkills)],
    preferredSkills: [...new Set(preferredSkills)],
    keywords: keywords.all,
    actionVerbs: keywords.action.keywords,
    experienceYears,
  };
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countOccurrences(text: string, substring: string): number {
  const escaped = escapeRegex(substring);
  const regex = new RegExp(escaped, "gi");
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}
