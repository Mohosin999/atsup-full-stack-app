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

import {
  SKILLS,
  SOFT_SKILLS,
  ACTION_VERBS,
  KEYWORDS,
  type SkillList,
} from "./skillDefinitions";

/**
 * Backward-compatible taxonomy combining technical and soft skills.
 * Prefer importing SKILLS / SOFT_SKILLS / ACTION_VERBS / KEYWORDS
 * from skillDefinitions directly.
 */
export const SKILL_TAXONOMY = { ...SKILLS, softSkills: SOFT_SKILLS };



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
  Object.entries(SKILLS).forEach(([category, skills]) => {
    const matchedSkills = matchSkills(textLower, skills);

    if (matchedSkills.length > 0) {
      const names = matchedSkills.map((m) => m.name);
      result.technical.categories[category] = names;
      result.technical.keywords.push(...names);
      matchedSkills.forEach(({ name, entry }) => {
        result.technical.frequency[name] = countSkillOccurrences(textLower, entry);
      });
    }
  });

  // Extract soft skills
  const matchedSoftSkills = matchSkills(textLower, SOFT_SKILLS);

  if (matchedSoftSkills.length > 0) {
    const names = matchedSoftSkills.map((m) => m.name);
    result.soft.keywords = names;
    result.soft.categories["interpersonal"] = names;
    matchedSoftSkills.forEach(({ name, entry }) => {
      result.soft.frequency[name] = countSkillOccurrences(textLower, entry);
    });
  }

  // Extract action verbs
  const matchedVerbs = matchActionVerbs(textLower, ACTION_VERBS);

  if (matchedVerbs.length > 0) {
    result.action.keywords = matchedVerbs;
    matchedVerbs.forEach((verb) => {
      result.action.frequency[verb] = countOccurrences(textLower, verb);
    });
  }

  // Extract industry keywords
  Object.entries(KEYWORDS).forEach(([domain, terms]) => {
    const matchedSkills = matchSkills(textLower, terms);
    const names = matchedSkills.map((m) => m.name);

    if (names.length > 0) {
      result.industry.categories[domain] = names;
      result.industry.keywords.push(...names);
      matchedSkills.forEach(({ name, entry }) => {
        result.industry.frequency[name] = countSkillOccurrences(
          textLower,
          entry,
        );
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

interface SkillEntry {
  name: string;
  aliases: string[];
}

interface MatchedSkill {
  name: string;
  entry: SkillEntry;
}

function normalizeSkillEntry(entry: string | string[]): SkillEntry {
  if (typeof entry === "string") {
    return { name: entry, aliases: [] };
  }
  return { name: entry[0], aliases: entry.slice(1) };
}

function matchSkills(
  textLower: string,
  skills: (string | string[])[],
): MatchedSkill[] {
  const matched: MatchedSkill[] = [];

  skills.forEach((entry) => {
    const normalized = normalizeSkillEntry(entry);
    const isMatch =
      variantRegex(normalized.name, false).test(textLower) ||
      normalized.aliases.some((alias) => variantRegex(alias, true).test(textLower));

    if (isMatch) {
      matched.push({ name: normalized.name, entry: normalized });
    }
  });

  return matched;
}

/**
 * Return canonical names of all entries in `list` whose canonical name or
 * any alias appears in the text.
 */
export function matchSkillList(textLower: string, list: SkillList): string[] {
  return matchSkills(textLower, list).map((m) => m.name);
}

/**
 * Return all action verbs from `verbs` that appear in the text, allowing
 * inflected forms (ed/ing/es/s).
 */
export function matchActionVerbs(textLower: string, verbs: string[]): string[] {
  return verbs.filter((verb) => {
    const escaped = escapeRegex(verb);
    const regex = new RegExp(`\\b${escaped}(?:ed|ing|es|s)?\\b`, "i");
    return regex.test(textLower);
  });
}

/**
 * Find the canonical name + all aliases for a skill across SKILLS,
 * SOFT_SKILLS and KEYWORDS. Falls back to `[canonical]` if unknown.
 */
export function getSkillVariants(canonical: string): string[] {
  const findIn = (list: SkillList): string[] | null => {
    for (const entry of list) {
      if (typeof entry === "string") {
        if (entry === canonical) return [entry];
      } else if (entry[0] === canonical) {
        return entry;
      }
    }
    return null;
  };

  for (const category of Object.values(SKILLS)) {
    const found = findIn(category);
    if (found) return found;
  }
  const softFound = findIn(SOFT_SKILLS);
  if (softFound) return softFound;
  for (const category of Object.values(KEYWORDS)) {
    const found = findIn(category);
    if (found) return found;
  }
  return [canonical];
}

/**
 * Count occurrences of the given variants (canonical first, then aliases)
 * in the text, using the same boundary rules as matching.
 */
export function countVariantsInText(text: string, variants: string[]): number {
  const textLower = text.toLowerCase();
  return variants.reduce((total, variant, index) => {
    const isAlias = index > 0;
    const escaped = escapeRegex(variant);
    const pattern = isAlias
      ? `(?<![\\w.-])${escaped}(?![\\w-])`
      : `\\b${escaped}\\b`;
    const matches = textLower.match(new RegExp(pattern, "gi"));
    return total + (matches ? matches.length : 0);
  }, 0);
}

/**
 * Count how many times a skill (and any of its aliases) appears in the text.
 */
export function countSkillInText(text: string, canonical: string): number {
  return countVariantsInText(text, getSkillVariants(canonical));
}

/**
 * Count how many times an action verb (including inflections) appears in text.
 */
export function countActionVerbInText(text: string, verb: string): number {
  const escaped = escapeRegex(verb);
  const matches = text
    .toLowerCase()
    .match(new RegExp(`\\b${escaped}(?:ed|ing|es|s)?\\b`, "gi"));
  return matches ? matches.length : 0;
}

function variantRegex(variant: string, isAlias: boolean): RegExp {
  const escaped = escapeRegex(variant);
  const pattern = isAlias
    ? `(?<![\\w.-])${escaped}(?![\\w-])`
    : `\\b${escaped}\\b`;
  return new RegExp(pattern, "i");
}

function countVariant(textLower: string, variant: string, isAlias: boolean): number {
  const matches = textLower.match(variantRegex(variant, isAlias));
  return matches ? matches.length : 0;
}

function countSkillOccurrences(textLower: string, entry: SkillEntry): number {
  return (
    countVariant(textLower, entry.name, false) +
    entry.aliases.reduce(
      (total, alias) => total + countVariant(textLower, alias, true),
      0,
    )
  );
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
