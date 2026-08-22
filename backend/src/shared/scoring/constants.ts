export const CATEGORY_WEIGHTS = {
  hardSkills: 40,
  searchability: 25,
  formatting: 15,
  softSkills: 10,
  recruiterTips: 10,
} as const;

// NOTE: maybe engineer and developer should be removed
export const TITLE_STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "of",
  "in",
  "on",
  "at",
  "to",
  "a",
  "an",
  "is",
  "role",
  "position",
  "opportunity",
  "job",
  "engineer",
  "developer",
  "specialist",
  "lead",
  "senior",
  "junior",
  "entry",
  "level",
]);

export const ROLE_NOUNS =
  /\b(engineer|developer|designer|manager|director|specialist|analyst|consultant|architect|scientist|researcher|writer|tester|coordinator|administrator|officer|executive|lead)\b/i;

export const ATS_DATE_RE =
  /^(present|current|now|ongoing|\d{1,2}\/\d{2}(\d{2})?|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s?\d{4})$/i;
