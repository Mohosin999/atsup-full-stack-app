/**
 * Splits raw resume text into labeled sections by recognized heading keywords
 * (dictionary-based, no LLM).
 */

import { ResumeSection } from "../unlimitedAts.types";



const SECTION_KEYWORDS: Array<{ key: string; title: string; patterns: RegExp[] }> = [
  {
    key: "contact",
    title: "Contact",
    patterns: [/^contact\s*$/i, /^contact information\s*$/i, /^personal details\s*$/i, /^personal information\s*$/i],
  },
  {
    key: "summary",
    title: "Summary",
    patterns: [/^summary\s*$/i, /^professional summary\s*$/i, /^career summary\s*$/i, /^profile\s*$/i, /^objective\s*$/i, /^about me\s*$/i, /^executive summary\s*$/i],
  },
  {
    key: "experience",
    title: "Experience",
    patterns: [/^experience\s*$/i, /^work experience\s*$/i, /^professional experience\s*$/i, /^employment history\s*$/i, /^work history\s*$/i, /^career history\s*$/i, /^relevant experience\s*$/i, /^experience history\s*$/i],
  },
  {
    key: "projects",
    title: "Projects",
    patterns: [/^projects\s*$/i, /^personal projects\s*$/i, /^key projects\s*$/i, /^academic projects\s*$/i, /^project experience\s*$/i, /^featured projects\s*$/i],
  },
  {
    key: "education",
    title: "Education",
    patterns: [/^education\s*$/i, /^academic background\s*$/i, /^academic qualifications\s*$/i, /^educational background\s*$/i, /^qualifications\s*$/i],
  },
  {
    key: "skills",
    title: "Skills",
    patterns: [/^skills\s*$/i, /^technical skills\s*$/i, /^core competencies\s*$/i, /^core skills\s*$/i, /^key skills\s*$/i, /^skill set\s*$/i, /^technologies\s*$/i, /^tech stack\s*$/i, /^areas of expertise\s*$/i],
  },
  {
    key: "certifications",
    title: "Certifications",
    patterns: [/^certifications\s*$/i, /^certification\s*$/i, /^licenses\s*$/i, /^licenses & certifications\s*$/i, /^licenses and certifications\s*$/i, /^professional certifications\s*$/i, /^courses\s*$/i, /^training\s*$/i],
  },
  {
    key: "achievements",
    title: "Achievements",
    patterns: [/^achievements\s*$/i, /^awards\s*$/i, /^honors\s*$/i, /^accomplishments\s*$/i, /^awards & honors\s*$/i, /^awards and honors\s*$/i, /^honors & awards\s*$/i],
  },
  {
    key: "languages",
    title: "Languages",
    patterns: [/^languages\s*$/i, /^language\s*$/i],
  },
  {
    key: "interests",
    title: "Interests",
    patterns: [/^interests\s*$/i, /^hobbies\s*$/i, /^activities\s*$/i, /^volunteering\s*$/i],
  },
  {
    key: "references",
    title: "References",
    patterns: [/^references\s*$/i, /^reference\s*$/i],
  },
];

const isLikelySectionHeading = (line: string): { key: string; title: string } | null => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.length > 40) return null;

  // Require the line to be mostly the heading (all caps common, or short title-case).
  if (!/^[A-Za-z&\/+.,\s-]+$/.test(trimmed)) return null;
  if (/\b(?:and|with|at|in|of|to|for)\b/.test(trimmed) && trimmed.length > 20) return null;

  for (const def of SECTION_KEYWORDS) {
    for (const re of def.patterns) {
      if (re.test(trimmed)) {
        return { key: def.key, title: def.title };
      }
    }
  }
  return null;
};

/**
 * Split the resume text into ordered sections.
 * The header block (personal info) is everything before the first section.
 */
export const splitResumeSections = (text: string): ResumeSection[] => {
  const lines = text.split("\n").map((l) => l.trim());
  const headings: Array<{ lineIndex: number; key: string; title: string }> = [];

  for (let i = 0; i < lines.length; i++) {
    const match = isLikelySectionHeading(lines[i]);
    if (match) headings.push({ lineIndex: i, ...match });
  }

  const sections: ResumeSection[] = [];
  for (let h = 0; h < headings.length; h++) {
    const current = headings[h];
    const next = headings[h + 1];
    const startIndex = current.lineIndex;
    const endIndex = next ? next.lineIndex : lines.length;
    sections.push({
      key: current.key,
      title: current.title,
      lines: lines.slice(startIndex + 1, endIndex).filter(Boolean),
      startIndex,
      endIndex,
    });
  }

  return sections;
};
