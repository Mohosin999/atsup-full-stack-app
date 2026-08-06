import {
  HARD_SKILLS_DICTIONARY,
  HARD_SKILL_STOPWORDS,
} from "../dictionaries/hard-skills.dictionary";
import { SOFT_SKILLS_DICTIONARY } from "../dictionaries/soft-skills.dictionary";
import { ACTION_VERBS_DICTIONARY } from "../dictionaries/action-verbs.dictionary";
import {
  DEGREE_KEYWORDS,
  FIELD_OF_STUDY_KEYWORDS,
  EDUCATION_LEVELS,
} from "../dictionaries/education.dictionary";
import {
  countWords,
  DATE_RANGE_RE,
  extractEmail,
  extractGithub,
  extractLinkedIn,
  extractMeasurableResults,
  extractPhone,
  extractPortfolio,
  NORMAL_DATE_RE,
} from "../dictionaries/regex-helpers";
import { matchDictionary } from "../dictionaries/matcher";
import { splitResumeSections, ResumeSection } from "./resumeSections";
import { ParsedPdfResult } from "../pdf/pdfParser.service";
import { ResumeContent } from "../../../shared/types";

/** The resume.json shape returned to the client (mirrors root resume.json). */
export interface DictionaryResumeJson {
  personal_info: {
    fullName: string;
    jobTitle: string;
    contact: {
      address: string;
      email: string;
      phone: string;
      links: {
        linkedin: string;
        portfolio: string;
        github: string;
      };
    };
  };
  summary: string;
  experience: Array<{
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    responsibilities: string[];
  }>;
  education: Array<{
    degree: string;
    field: string;
    education_level: string;
    startDate: string;
    endDate: string;
  }>;
  skills: {
    hardSkills: string[];
    softSkills: string[];
  };
  projects: Array<{
    name: string;
    description: string[];
    link: string;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    date: string;
    link: string;
  }>;
  yearsOfExperience: string;
  measurableResults: string[];
  resumeTone: string;
  wordCount: string;
  educationSection: boolean;
  experienceSection: boolean;
  workHistory: boolean;
  dateFormatting: boolean;
  layout: ParsedPdfResult["layout"];
  fontCheck: ParsedPdfResult["fontCheck"];
}

export interface ResumeParseOutput {
  json: DictionaryResumeJson;
  content: ResumeContent;
}

const cleanLine = (l: string): string => l.trim();

const sanitizeName = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return "";
  // A full-name line: 2-4 words, letters only (allow periods, hyphens, apostrophes).
  const words = trimmed.split(/\s+/);
  if (words.length < 2 || words.length > 4) return "";
  if (!words.every((w) => /^[A-Za-z][A-Za-z.'-]*$/.test(w))) return "";
  // Reject when it's clearly an email/phone/link/section heading.
  if (/@/.test(trimmed) || /linkedin|github|http|www\./i.test(trimmed)) return "";
  if (/^(summary|experience|education|skills|projects|certification|objective|profile)$/i.test(trimmed)) return "";
  return trimmed;
};

const detectJobTitle = (text: string): string => {
  const candidates = [
    /(?:^|\n)\s*([A-Z][A-Za-z+.#\-\s]{2,40}(?:Engineer|Developer|Designer|Manager|Analyst|Architect|Scientist|Consultant|Lead|Director|Specialist|Administrator|Coordinator|Officer|Executive|Head|Principal|Intern|Trainee|Researcher|Writer|Tester|Support|Recruiter))\s*(?:\||$|\n)/,
  ];
  for (const re of candidates) {
    const m = text.match(re);
    if (m && m[1]) return m[1].trim();
  }
  return "";
};

const extractExperienceYears = (text: string): number => {
  const m = text.match(
    /(?:^|\W)(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)(?:\W|$)/i,
  );
  return m ? Math.round(parseFloat(m[1])) : 0;
};

const detectSectionPresence = (
  sections: ResumeSection[],
  key: string,
): boolean => sections.some((s) => s.key === key);

const isDateOnly = (s: string): boolean => NORMAL_DATE_RE.test(s.trim());

export const parseResumeByDictionary = (
  pdf: ParsedPdfResult,
): ResumeParseOutput => {
  const text = pdf.text;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const sections = splitResumeSections(text);

  const sectionLines = (key: string): string[] =>
    sections.find((s) => s.key === key)?.lines ?? [];

  const allText = text;

  // ---- Personal info (header block = lines before first section) ----
  const firstSectionIndex = sections.length > 0 ? sections[0].startIndex : 0;
  const headerLines = lines.slice(0, firstSectionIndex);

  const headerText = headerLines.join(" ");

  const fullName = sanitizeName(headerLines[0] ?? "");
  const email = extractEmail(headerText);
  const phone = extractPhone(headerText);
  const linkedin = extractLinkedIn(headerText);
  const github = extractGithub(headerText);
  const portfolio = extractPortfolio(headerText);

  // Address = remaining header line that contains a city/division word.
  const address = headerLines
    .filter(
      (l) =>
        !l.includes("@") &&
        !/\+?\d{7,}/.test(l) &&
        !/linkedin|github|http/i.test(l),
    )
    .find(
      (l) =>
        /(Dhaka|Chittagong|Khulna|Rajshahi|Sylhet|Barishal|Barisal|Rangpur|Mymensingh|Bangladesh|New York|London|San Francisco|Toronto|Sydney|Berlin|India|USA|UK|Dubai|California|Texas)/i.test(
          l,
        ),
    ) ?? "";

  // Job title: try header, then summary.
  let jobTitle = detectJobTitle(headerText) || detectJobTitle(sectionLines("summary").join("\n") || allText);

  // ---- Summary ----
  const summary = sectionLines("summary").join(" ");

  // ---- Experience ----
  const experienceLines = sectionLines("experience");
  const experience = parseExperience(experienceLines);

  // ---- Projects ----
  const projectLines = sectionLines("projects");
  const projects = parseProjects(projectLines);

  // ---- Education ----
  const educationLines = sectionLines("education");
  const education = parseEducation(educationLines);

  // ---- Certifications ----
  const certLines = sectionLines("certifications");
  const certifications = parseCertifications(certLines);

  // ---- Skills ----
  const skillsSectionText = sectionLines("skills").join("\n");
  const skillsAllText = skillsSectionText || allText;
  const hardSkills = matchDictionary(skillsAllText, HARD_SKILLS_DICTIONARY)
    .filter((s) => !HARD_SKILL_STOPWORDS.has(s.toLowerCase()));
  const softSkills = matchDictionary(skillsAllText, SOFT_SKILLS_DICTIONARY);

  // ---- Derived metrics ----
  const wordCount = countWords(allText);
  const measurableResults = extractMeasurableResults(allText);
  const actionVerbs = matchDictionary(allText, ACTION_VERBS_DICTIONARY);
  const yearsOfExperience = extractExperienceYears(allText);

  const educationSection = detectSectionPresence(sections, "education");
  const experienceSection = detectSectionPresence(sections, "experience");
  const workHistory = experience.length > 0;

  // Date formatting check across experience lines.
  const dateFormatting = detectDateFormatting(experienceLines);

  const resumeTone = inferTone(allText, actionVerbs.length, measurableResults.length);

  const json: DictionaryResumeJson = {
    personal_info: {
      fullName,
      jobTitle,
      contact: {
        address,
        email,
        phone,
        links: { linkedin, portfolio, github },
      },
    },
    summary,
    experience,
    education,
    skills: { hardSkills, softSkills },
    projects,
    certifications,
    yearsOfExperience: yearsOfExperience ? `${yearsOfExperience} years` : "",
    measurableResults,
    resumeTone,
    wordCount: String(wordCount),
    educationSection,
    experienceSection,
    workHistory,
    dateFormatting,
    layout: pdf.layout,
    fontCheck: pdf.fontCheck,
  };

  const content: ResumeContent = mapToResumeContent(json);

  return { json, content };
};

// ============================================================================
// Experience parsing
// ============================================================================

interface RawExperience {
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  responsibilities: string[];
}

const parseExperience = (lines: string[]): RawExperience[] => {
  const entries: RawExperience[] = [];
  let current: RawExperience | null = null;

  const startNew = (role: string, company: string, location: string, start: string, end: string) => {
    if (current) entries.push(current);
    current = { role, company, location, startDate: start, endDate: end, responsibilities: [] };
  };

  for (const rawLine of lines) {
    const line = cleanLine(rawLine);
    if (!line) continue;

    const bullet = /^[•·▪o*\-–—•]+\s*/;
    const isBullet = bullet.test(line) || /^\d+[.)]\s+/.test(line);

    // Try to detect a role/company header line.
    const header = parseRoleHeader(line);
    if (header && !isBullet) {
      startNew(header.role, header.company, header.location, header.startDate, header.endDate);
      continue;
    }

    // If we have an active entry and this isn't a bullet, treat as continuation of last bullet or role info.
    if (!current) {
      current = {
        role: line,
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        responsibilities: [],
      };
      continue;
    }

    // Pure date-range line (e.g. "Jan 2021 - Present", "2018 - 2020") sets dates.
    if (!isBullet) {
      const rangeMatch = line.match(DATE_RANGE_RE);
      if (rangeMatch) {
        current.startDate = current.startDate || rangeMatch[1];
        current.endDate = current.endDate || rangeMatch[2];
        continue;
      }
    }

    // Date-only line updates dates.
    if (isDateOnly(line) && !isBullet) {
      const parts = line.split(/[-–—]/).map((p) => p.trim());
      if (parts[0]) current.startDate = current.startDate || parts[0];
      if (parts[1]) current.endDate = current.endDate || parts[1];
      else if (/(present|current|now|ongoing)/i.test(line)) current.endDate = parts[0];
      continue;
    }

    if (isBullet) {
      current.responsibilities.push(line.replace(bullet, "").trim());
    } else if (!current.role && line.length < 60) {
      current.role = line;
    } else {
      current.responsibilities.push(line);
    }
  }

  if (current) entries.push(current);
  return entries;
};

const parseRoleHeader = (
  line: string,
): { role: string; company: string; location: string; startDate: string; endDate: string } | null => {
  const cleaned = line.replace(/^[•·▪o*\-–—•\s]+/, "");
  if (!cleaned || cleaned.length > 140) return null;
  // Requires an uppercase word near start to be a heading, not a sentence.
  if (!/^[A-Z]/.test(cleaned)) return null;

  // A role header must contain at least two words or a separator/date range,
  // otherwise a wrapped continuation word (e.g. "PostgreSQL") is treated as a role.
  const wordCount = cleaned.split(/\s+/).length;
  if (
    wordCount < 2 &&
    !/[-–—|,|]|\s+at\s+|\s+@\s+|\d{4}/i.test(cleaned)
  ) {
    return null;
  }

  const result = { role: "", company: "", location: "", startDate: "", endDate: "" };

  // Split date range "Mar 2019 - Present" or "2020 - 2022" off the end.
  const dateMatch = cleaned.match(
    /\s+[-–—|]\s+((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{0,4}|present|current|now|ongoing))\s*$/i,
  );
  let body = cleaned;
  if (dateMatch) {
    const afterDate = cleaned.slice(0, dateMatch.index).trim();
    const rangeStart = afterDate.match(
      /(?:^|[\s|])((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{0,4}))\s*$/i,
    );
    if (rangeStart) {
      result.startDate = rangeStart[1];
      result.endDate = dateMatch[1];
      body = afterDate.slice(0, rangeStart.index).trim();
    } else {
      result.startDate = "";
      result.endDate = dateMatch[1];
      body = afterDate;
    }
  }

  // Split on " | " or " at " or " , " separators.
  const parts = body.split(/\s+[|,]\s+|\s+at\s+|\s+@\s+/i).map((p) => p.trim().replace(/[|,]$/, "").trim()).filter(Boolean);
  if (parts.length >= 1) result.role = parts[0];
  if (parts.length >= 2) {
    // Second part is company or location; guess by keyword.
    const second = parts[1];
    if (/\b(?:remote|hybrid|onsite|on-site|bangladesh|dhaka|usa|uk|germany|india|australia|canada)\b/i.test(second) || /\b(?:city|district|division)\b/i.test(second)) {
      result.location = second;
    } else {
      result.company = second;
    }
  }
  if (parts.length >= 3) result.location = parts[2];

  if (!result.role) return null;
  return result;
};

// ============================================================================
// Projects
// ============================================================================

const parseProjects = (lines: string[]): DictionaryResumeJson["projects"] => {
  const projects: DictionaryResumeJson["projects"] = [];
  let current: DictionaryResumeJson["projects"][number] | null = null;

  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!line) continue;
    const bullet = /^[•·▪o*\-–—]+\s*/;
    const isBullet = bullet.test(line) || /^\d+[.)]\s+/.test(line);

    if (isBullet) {
      if (!current) {
        current = { name: "Project", description: [], link: "" };
        projects.push(current);
      }
      current.description.push(line.replace(bullet, "").trim());
    } else {
      current = { name: line.slice(0, 80), description: [], link: "" };
      projects.push(current);
    }
  }
  return projects;
};

// ============================================================================
// Education
// ============================================================================

const parseEducation = (lines: string[]): DictionaryResumeJson["education"] => {
  const education: DictionaryResumeJson["education"] = [];

  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!line || line.length > 160) continue;

    const degree =
      matchDictionary(line, DEGREE_KEYWORDS).find((d) => d.toLowerCase() !== "certification") || "";
    const field =
      matchDictionary(line, FIELD_OF_STUDY_KEYWORDS)[0] || "";
    const educationLevel =
      matchDictionary(line, EDUCATION_LEVELS)[0] || "";

    // Dates: "2013 - 2017"
    const dates = line.match(
      /(?<start>(?:\d{4})|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{0,4})|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\s*[-–—]\s*(?<end>(?:\d{4})|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{0,4})|present|current)/i,
    );

    if (degree || field || educationLevel) {
      education.push({
        degree,
        field,
        education_level: educationLevel,
        startDate: dates ? dates.groups?.start || "" : "",
        endDate: dates ? dates.groups?.end || "" : "",
      });
    }
  }
  return education;
};

// ============================================================================
// Certifications
// ============================================================================

const parseCertifications = (lines: string[]): DictionaryResumeJson["certifications"] => {
  const certs: DictionaryResumeJson["certifications"] = [];
  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!line || line.length > 120) continue;
    const bullet = /^[•·▪o*\-–—]+\s*/;
    const name = line.replace(bullet, "").trim();
    const issuerMatch = name.match(/^(.*?)\s*[-–|]\s*(.*)$/);
    certs.push({
      name: issuerMatch ? issuerMatch[1] : name,
      issuer: issuerMatch ? issuerMatch[2] : "",
      date: "",
      link: "",
    });
  }
  return certs;
};

// ============================================================================
// Helpers
// ============================================================================

const detectDateFormatting = (experienceLines: string[]): boolean => {
  const text = experienceLines.join("\n");
  const dateMatches = text.match(
    /\b((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})|(?:present|current))\b/gi,
  );
  if (!dateMatches || dateMatches.length === 0) return true; // no dates to validate
  return dateMatches.every((d) => /present|current/i.test(d) || /^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/.test(d) || /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}/i.test(d));
};

const inferTone = (text: string, actionVerbCount: number, measurableCount: number): string => {
  const wordCount = countWords(text);
  if (actionVerbCount >= 5 && measurableCount >= 3) return "good";
  if (actionVerbCount >= 3 || measurableCount >= 1) return "professional";
  if (wordCount < 100) return "weak";
  return "bad";
};

const mapToResumeContent = (json: DictionaryResumeJson): ResumeContent => {
  const addressParts = (json.personal_info.contact.address || "")
    .split(/[,|-]/)
    .map((p) => p.trim())
    .filter(Boolean);

  return {
    personalInfo: {
      fullName: json.personal_info.fullName || undefined,
      jobTitle: json.personal_info.jobTitle || undefined,
      contact: {
        email: json.personal_info.contact.email || undefined,
        phone: json.personal_info.contact.phone || undefined,
        linkedIn: json.personal_info.contact.links.linkedin || undefined,
        address:
          addressParts.length === 1
            ? { city: addressParts[0] }
            : addressParts.length > 1
              ? { city: addressParts[0], division: addressParts[addressParts.length - 1] }
              : undefined,
        socialLinks: {
          github: json.personal_info.contact.links.github || undefined,
          portfolio: json.personal_info.contact.links.portfolio || undefined,
        },
      },
    },
    summary: json.summary || undefined,
    experience: json.experience.map((exp) => ({
      company: exp.company || "",
      title: exp.role || "",
      location: exp.location || undefined,
      startDate: exp.startDate || "",
      endDate: exp.endDate || undefined,
      current: /present|current/i.test(exp.endDate),
      highlights: exp.responsibilities || [],
    })),
    education: json.education.map((edu) => ({
      institution: edu.field || "",
      degree: edu.degree || edu.education_level || "",
      date: [edu.startDate, edu.endDate].filter(Boolean).join(" - "),
    })),
    skills: [...json.skills.hardSkills, ...json.skills.softSkills],
    hardSkills: json.skills.hardSkills,
    softSkills: json.skills.softSkills,
    projects: json.projects.map((p) => ({
      name: p.name,
      highlights: p.description,
      links: p.link ? { live: p.link } : undefined,
    })),
    certifications: json.certifications.map((c) => ({
      name: c.name,
      issuer: c.issuer || undefined,
    })),
    measurableResults: json.measurableResults,
    actionVerbs: matchDictionary(json.summary + " " + json.experience.map((e) => e.responsibilities.join(" ")).join(" "), ACTION_VERBS_DICTIONARY),
  };
};
