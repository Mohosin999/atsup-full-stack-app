export const CATEGORY_WEIGHTS = {
  searchability: 30,
  hardSkills: 35,
  softSkills: 15,
  recruiterTips: 10,
  formatting: 10,
} as const;

export const TITLE_STOPWORDS = new Set([
  "the", "and", "for", "with", "of", "in", "on", "at", "to", "a", "an",
  "is", "role", "position", "opportunity", "job", "engineer", "developer",
  "specialist", "lead", "senior", "junior", "entry", "level",
]);

export const ROLE_NOUNS = /\b(engineer|developer|designer|manager|director|specialist|analyst|consultant|architect|scientist|researcher|writer|tester|coordinator|administrator|officer|executive|lead)\b/i;

export const ATS_DATE_RE =
  /^(present|current|now|ongoing|\d{1,2}\/\d{2}(\d{2})?|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s?\d{4})$/i;

export const MEASURABLE_RESULT_RE = /\d+%|\d+x|\$|\d+\s*(?:hours?|hrs?|days?|weeks?|months?|years?)/i;
