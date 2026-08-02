import {
  extractKeywords,
  matchSkillList,
  matchActionVerbs,
} from "../analysis/keywordExtractor";
import {
  SOFT_SKILLS,
  KEYWORDS,
  type SkillList,
} from "../analysis/skillDefinitions";

export interface StructuredJD {
  jobTitle: string;
  company: string;
  location: string;
  hardSkills: string[];
  softSkills: string[];
  actionVerbs: string[];
  // Combined degree + field in one string, e.g. "Science|Bachelor of Science (BS)"
  educationRequirement: string | null;
  experienceYearsRequired: number;
}

export const extractHardSoftSkills = (
  text: string,
): { hardSkills: string[]; softSkills: string[] } => {
  const extracted = extractKeywords(text);

  const hardSkills = [...new Set(extracted.technical.keywords)];

  const softSkills = matchSkillList(text.toLowerCase(), SOFT_SKILLS);

  return { hardSkills, softSkills };
};

const DEGREE_PATTERNS: Array<{ label: string; regex: RegExp }> = [
  { label: "Bachelor's degree", regex: /bachelor(?:'s| of)?/i },
  { label: "Master's degree", regex: /master(?:'s| of)?/i },
  { label: "PhD", regex: /ph\.?d\.?/i },
  { label: "Doctorate", regex: /doctorate/i },
  { label: "B.Sc", regex: /b\.?sc\.?(?!\w)/i },
  { label: "M.Sc", regex: /m\.?sc\.?(?!\w)/i },
  { label: "B.Tech", regex: /b\.?tech\.?/i },
  { label: "M.Tech", regex: /m\.?tech\.?/i },
  { label: "B.E", regex: /\bb\.?e\.?\b/i },
  { label: "M.E", regex: /\bm\.?e\.?\b/i },
  { label: "Diploma", regex: /diploma/i },
  { label: "Associate degree", regex: /associate(?: degree)?/i },
];

const FIELD_PATTERNS: Array<{ label: string; regex: RegExp }> = [
  { label: "Computer Science", regex: /computer science/i },
  { label: "Software Engineering", regex: /software engineering/i },
  { label: "Engineering", regex: /\bengineering\b/i },
  { label: "Information Technology", regex: /information technology/i },
  { label: "Information Systems", regex: /information systems/i },
  { label: "Data Science", regex: /data science/i },
  { label: "Business Administration", regex: /business administration/i },
  { label: "Finance", regex: /\bfinance\b/i },
  { label: "Accounting", regex: /\baccounting\b/i },
  { label: "Marketing", regex: /\bmarketing\b/i },
  { label: "Cybersecurity", regex: /cybersecurity|security/i },
  { label: "Mathematics", regex: /\bmathematics\b|\bmath\b/i },
  { label: "Statistics", regex: /\bstatistics\b/i },
];

const TITLE_KEYWORDS =
  /\b(engineer|developer|manager|director|lead|senior|junior|intern|analyst|consultant|architect|designer|specialist|scientist|officer|executive|head|chief|vp|associate|full[\s-]*stack|front[\s-]*end|back[\s-]*end|data|devops|sre|qa|product|programmer|software|hardware|cloud|network|security|support|administrator|coordinator|tester|researcher)\b/i;

export const parseJobDescriptionToStructured = (
  rawText: string,
): StructuredJD => {
  const text = rawText || "";
  const textLower = text.toLowerCase();
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const { hardSkills, softSkills } = extractHardSoftSkills(text);

  const keywords = extractKeywordsList(textLower, hardSkills, softSkills);

  return {
    jobTitle: detectJobTitle(lines),
    company: detectCompany(text),
    location: detectLocation(text),
    hardSkills: [...new Set([...hardSkills, ...keywords])],
    softSkills,
    actionVerbs: matchActionVerbs(text),
    educationRequirement: detectEducation(text),
    experienceYearsRequired: detectYears(textLower),
  };
};

export const extractKeywordsFromText = (
  text: string,
  hardSkills: string[],
  softSkills: string[],
): string[] => extractKeywordsList(text.toLowerCase(), hardSkills, softSkills);

const extractKeywordsList = (
  textLower: string,
  hardSkills: string[],
  softSkills: string[],
): string[] => {
  const excluded = new Set(
    [...hardSkills, ...softSkills].map((s) => s.toLowerCase()),
  );

  const allTerms = Object.values(KEYWORDS).reduce<SkillList>(
    (acc, terms) => [...acc, ...terms],
    [],
  );

  return matchSkillList(textLower, allTerms)
    .filter((k) => !excluded.has(k.toLowerCase()))
    .slice(0, 25);
};

const stripTitlePrefix = (s: string): string =>
  s
    .replace(
      /^(?:job\s*)?(?:title|position|role|designation|post(?:ing|ed)?|vacancy|opening|apply(?:ing)?\s*(?:for|as)?|hiring(?:ing)?\s*(?:for|as)?)(?:\s*[::\-–—]\s*)?/i,
      "",
    )
    .trim();

const detectJobTitle = (lines: string[]): string => {
  for (const line of lines) {
    // 1. Explicit label: Job Title: X  /  Position: X  /  Role: X
    const m = line.match(
      /^(?:job\s*)?(?:title|position|role)\s*[::\-–—]\s*(.+)$/i,
    );
    if (m && m[1]) {
      const t = stripTitlePrefix(m[1])
        .split(/[|•]/)[0]
        .trim()
        .replace(/^\s*(?:a|an|the)\s+/i, "")
        .replace(/\s+at\s+[A-Z][A-Za-z0-9&.' -]*$/i, "")
        .trim();
      if (t) return t.slice(0, 100);
    }

    // 2. Boilerplate phrase (no colon needed):
    //    we are looking for X  /  we're looking for X  /  we're seeking X
    //    we're hiring X  /  we are hiring X
    const p = line.match(
      /\b(?:we are looking for|we're looking for|we're seeking|we're hiring|we are hiring)\s+(.+?)(?:[.;]|\s+responsibilit|\s+requirement|$)/i,
    );
    if (p && p[1]) {
      const t = stripTitlePrefix(p[1])
        .split(/[|•]/)[0]
        .trim()
        .replace(/^\s*(?:a|an|the)\s+/i, "")
        .replace(/\s+at\s+[A-Z][A-Za-z0-9&.' -]*$/i, "")
        .trim();
      if (t) return t.slice(0, 100);
    }
  }
  return "";
};

const detectCompany = (text: string): string => {
  const patterns = [
    /company\s*:\s*([^\n\r.]+)/i,
    /\bat\s+([A-Z][A-Za-z0-9&.' -]{2,40})/,
    /\bjoin\s+([A-Z][A-Za-z0-9&.' -]{2,40})/,
    /\b([A-Z][A-Za-z0-9&.' -]{2,40})\s+is\s+(?:hiring|looking|seeking)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const candidate = match[1].trim().replace(/[,.;].*$/, "");
      if (candidate.split(/\s+/).length <= 5) return candidate;
    }
  }
  return "";
};

const detectLocation = (text: string): string => {
  const locationMatch = text.match(
    /(?:location|based in|office|work from)\s*:?\s*([A-Z][A-Za-z ,-]{2,40})/i,
  );
  if (locationMatch && locationMatch[1]) {
    return locationMatch[1].trim().replace(/[,.;].*$/, "");
  }
  if (/\bremote\b/i.test(text)) return "Remote";
  return "";
};

const detectEducation = (text: string): string | null => {
  const degreeMatch = DEGREE_PATTERNS.find((p) => p.regex.test(text));
  if (!degreeMatch) return null;

  const fieldMatch = FIELD_PATTERNS.find((p) => p.regex.test(text));

  if (fieldMatch) {
    return `${fieldMatch.label}|${degreeMatch.label}`;
  }

  return degreeMatch.label;
};

const detectYears = (textLower: string): number => {
  const match = textLower.match(
    /(\d+)\+?\s*(years?|yrs?)(?:\s*(?:of|more)\s*)?(?:experience)?/i,
  );
  return match ? parseInt(match[1], 10) : 0;
};
