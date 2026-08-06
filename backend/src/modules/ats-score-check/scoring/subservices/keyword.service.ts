export interface ExtractedKeywords {
  technical: KeywordGroup;
  soft: KeywordGroup;
  industry: KeywordGroup;
  all: string[];
}

export interface KeywordGroup {
  keywords: string[];
  categories: Record<string, string[]>;
  frequency: Record<string, number>;
}

type SkillEntry = { name: string; aliases: string[] };
type SkillList = (string | string[])[];

function normalizeSkillEntry(entry: string | string[]): SkillEntry {
  if (typeof entry === "string") {
    return { name: entry, aliases: [] };
  }
  const [name, ...aliases] = entry;
  return { name, aliases };
}

function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchSkills(
  textLower: string,
  list: SkillList,
): Array<{ name: string; entry: SkillEntry }> {
  const matched: Array<{ name: string; entry: SkillEntry }> = [];

  list.forEach((item) => {
    const entry = normalizeSkillEntry(item);
    const allForms = [entry.name, ...entry.aliases];
    const found = allForms.some((form) => {
      const escaped = escapeRegex(form);
      return new RegExp(`(?:^|\\b|\\s)${escaped}(?:\\b|\\s|$)`, "i").test(
        textLower,
      );
    });
    if (found) {
      matched.push({ name: entry.name, entry });
    }
  });

  return matched;
}

export function extractKeywords(_text: string): ExtractedKeywords {
  return {
    technical: { keywords: [], categories: {}, frequency: {} },
    soft: { keywords: [], categories: {}, frequency: {} },
    industry: { keywords: [], categories: {}, frequency: {} },
    all: [],
  };
}

export function extractSkillsFromResume(resume: any): string[] {
  const skills: string[] = [];
  if (Array.isArray(resume.skills)) {
    resume.skills.forEach((skill: string) => {
      if (skill && typeof skill === "string") {
        skills.push(skill.toLowerCase().trim());
      }
    });
  }
  return skills;
}

export function matchSkillList(textLower: string, list: SkillList): string[] {
  return matchSkills(textLower, list).map((m) => m.name);
}

export function getSkillVariants(canonical: string): string[] {
  return [canonical];
}

const actionVerbInflections = (base: string): string[] => {
  const forms = new Set<string>([base]);
  forms.add(`${base}s`);
  forms.add(`${base}es`);
  if (base.endsWith("e")) {
    forms.add(`${base}d`);
    forms.add(`${base}ing`);
    forms.add(`${base.slice(0, -1)}ing`);
  } else {
    forms.add(`${base}ed`);
    forms.add(`${base}ing`);
  }
  return Array.from(forms);
};

const isWholeWord = (text: string, word: string): boolean => {
  const escaped = escapeRegex(word);
  return new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, "i").test(text);
};

export function matchActionVerbs(text: string): string[] {
  if (!text || !text.trim()) return [];
  return [];
}

export function countActionVerbInText(_text: string, _canonical: string): number {
  return 0;
}

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

export function countSkillInText(text: string, canonical: string): number {
  return countVariantsInText(text, getSkillVariants(canonical));
}
