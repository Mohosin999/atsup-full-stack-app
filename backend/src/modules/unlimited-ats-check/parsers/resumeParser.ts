import {
  HARD_SKILLS_DICTIONARY,
  HARD_SKILL_STOPWORDS,
} from "../dictionaries/hard-skills.dictionary";
import { SOFT_SKILLS_DICTIONARY } from "../dictionaries/soft-skills.dictionary";
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
import { ResumeContent } from "../../../shared/types";
import {
  DictionaryResumeJson,
  ResumeParseOutput,
  ResumeSegments,
  Bucket,
  RawExperience,
  LayoutInfo,
  FontCheckInfo,
  ResumeSection,
} from "../unlimitedAts.types";

const DEFAULT_LAYOUT: LayoutInfo = {
  isSingleColumn: true,
  hasTables: false,
  hasImages: false,
  hasIcons: false,
  hasMultiColumn: false,
};

const DEFAULT_FONT_CHECK: FontCheckInfo = {
  isStandardFont: false,
  fontName: "",
  isReadableSize: false,
  hasMixedFonts: false,
};

const cleanLine = (l: string): string => l.trim();

/** True if the line looks like an employment/location continuation rather than a role. */
const isLocationLike = (role: string): boolean => {
  const lower = role.toLowerCase();
  if (
    /^(freelance|self[- ]employed|remote|contract|independent|part[- ]time|full[- ]time)/.test(
      lower,
    )
  )
    return true;
  return /(?:dhaka|chittagong|khulna|rajshahi|sylhet|barishal|rangpur|mymensingh|bangladesh|usa|uk|new york|london|remote)/i.test(
    role,
  );
};

const sanitizeName = (name: string): string => {
  const trimmed = name.trim();
  if (!trimmed) return "";
  // A full-name line: 2-4 words, letters only (allow periods, hyphens, apostrophes).
  const words = trimmed.split(/\s+/);
  if (words.length < 2 || words.length > 4) return "";
  if (!words.every((w) => /^[A-Za-z][A-Za-z.'-]*$/.test(w))) return "";
  // Reject when it's clearly an email/phone/link/section heading.
  if (/@/.test(trimmed) || /linkedin|github|http|www\./i.test(trimmed))
    return "";
  if (
    /^(summary|experience|education|skills|projects|certification|objective|profile)$/i.test(
      trimmed,
    )
  )
    return "";
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

const isTitleCaseLine = (l: string): boolean =>
  l.length <= 45 &&
  !/[.!,?;]+$/.test(l) &&
  /^[A-Z][A-Za-z0-9+#.&/:()-]+\s*([A-Z][A-Za-z0-9+#.&/:()-]+\s*)*$/.test(l);

const isProjectNameLine = (l: string): boolean =>
  isTitleCaseLine(l) &&
  !/^(summary|work experience|professional experience|technical skills|soft skills|education|projects|skills|certifications?|experience|contact|references?|languages|interests|hobbies|achievements?|awards)/i.test(
    l,
  ) &&
  !isEducationLine(l);

// ============================================================================
// Content-based section segmentation.
//
// PDF text extraction often dumps section headings at the very END (or out of
// order), so heading-position parsing is unreliable. Instead we walk the lines
// in order and bucket each line into a logical section using content signals:
// contact info, date ranges, degree keywords, skill lines, bullets, etc.
// ============================================================================

const BULLET_RE = /^(?:[•·▪*\-–—o]|\d+[.)])\s*/;

const isContactLine = (l: string): boolean =>
  /@/.test(l) ||
  /^\+?\d[\d\s.-]{6,}$/.test(l) ||
  /linkedin|github|\.com|http|www\./i.test(l);

const isLocationLine = (l: string): boolean =>
  /(dhaka|chittagong|khulna|rajshahi|sylhet|barishal|barisal|rangpur|mymensingh|bangladesh|usa|uk|new york|london|san francisco|toronto|sydney|berlin|india|dubai|california|texas|remote)/i.test(
    l,
  );

const isEducationLine = (l: string): boolean =>
  /(university|college|school|institute|bachelor|master|degree|science|arts|engineering|gpa|honours|diploma|b\.sc|m\.sc|ph\.?d|hsc|ssc)/i.test(
    l,
  );

const isSectionHeading = (l: string): { key: Bucket } | null => {
  const t = l.toLowerCase().trim();
  if (t.length > 40) return null;
  if (
    /^(professional\s+|career\s+|executive\s+)?summary$|^objective$|^about me$/i.test(
      t,
    )
  )
    return { key: "summary" };
  if (
    /^(work experience|professional experience|relevant experience|employment history|career history|work history|experience|experience history|career experience)$/i.test(
      t,
    )
  )
    return { key: "experience" };
  if (
    /^(technical skills|core competencies|core skills|key skills|skill set|technologies|tech stack|areas of expertise|soft skills|skills|professional skills)$/i.test(
      t,
    )
  )
    return { key: "skills" };
  if (
    /^(education|academic background|academic qualifications|educational background|qualifications)$/i.test(
      t,
    )
  )
    return { key: "education" };
  if (
    /^(projects|personal projects|key projects|academic projects|project experience|featured projects)$/i.test(
      t,
    )
  )
    return { key: "projects" };
  if (
    /^(certifications?|licenses?|licenses & certifications|licenses and certifications|professional certifications|courses|training)$/i.test(
      t,
    )
  )
    return { key: "certifications" };
  return null;
};

const isSummarySentence = (l: string): boolean => {
  if (l.length < 40) return false;
  if (
    /\b(?:responsible|passionate|motivated|graduate|professional|developer|engineer|experience)\b/i.test(
      l,
    )
  )
    return true;
  return false;
};

const pushBucket = (seg: ResumeSegments, key: Bucket, line: string): void => {
  (seg[key] as string[]).push(line);
};

/**
 * Walk resume lines top-to-bottom and bucket each into a section.
 * Handles the common case where headings are missing/out-of-order by relying on
 * content cues. Keeps the document reading order for reliability.
 */
export const segmentResume = (lines: string[]): ResumeSegments => {
  const seg: ResumeSegments = {
    header: [],
    summary: [],
    experience: [],
    skills: [],
    education: [],
    projects: [],
    certifications: [],
  };

  let phase: Bucket = "header";

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i].trim();
    if (!l) continue;

    // A lone section heading switches phase.
    const heading = isSectionHeading(l);
    if (heading) {
      phase = heading.key;
      continue;
    }

    const bullet = BULLET_RE.test(l);

    // --- Header phase: personal info block (until summary sentence). ---
    if (phase === "header") {
      // If this looks like the summary paragraph, move into summary phase.
      if (isSummarySentence(l) && !isContactLine(l)) {
        phase = "summary";
        pushBucket(seg, "summary", l);
        continue;
      }
      // A date range like "Jan 2024 – Feb 2025" signals the experience start.
      if (DATE_RANGE_RE.test(l)) {
        phase = "experience";
        pushBucket(seg, "experience", l);
        continue;
      }
      // Education content appearing early (e.g. degree right under header).
      if (isEducationLine(l) && l.length < 60) {
        phase = "education";
        pushBucket(seg, "education", l);
        continue;
      }
      pushBucket(seg, "header", l);
      continue;
    }

    // --- Summary phase: own the paragraph. ---
    if (phase === "summary") {
      // A short title-case line (role title) ends the summary and starts
      // the experience section. E.g. "Frontend Developer".
      if (
        !bullet &&
        !isContactLine(l) &&
        !DATE_RANGE_RE.test(l) &&
        isTitleCaseLine(l)
      ) {
        phase = "experience";
        pushBucket(seg, "experience", l);
        continue;
      }
      // Summary continues until we hit anything structural.
      if (DATE_RANGE_RE.test(l) || isContactLine(l) || bullet) {
        phase = "experience";
        if (DATE_RANGE_RE.test(l) || bullet) pushBucket(seg, "experience", l);
        continue;
      }
      pushBucket(seg, "summary", l);
      continue;
    }

    // --- Experience phase. ---
    if (phase === "experience") {
      if (isEducationLine(l) && l.length < 60 && !DATE_RANGE_RE.test(l)) {
        phase = "education";
        pushBucket(seg, "education", l);
        continue;
      }
      if (/^projects?\b/i.test(l) && l.length < 30) {
        phase = "projects";
        pushBucket(seg, "projects", l);
        continue;
      }
      pushBucket(seg, "experience", l);
      continue;
    }

    // --- Skills phase. ---
    if (phase === "skills") {
      if (isEducationLine(l) && l.length < 60) {
        phase = "education";
        pushBucket(seg, "education", l);
        continue;
      }
      if (/^projects?\b/i.test(l) && l.length < 30) {
        phase = "projects";
        pushBucket(seg, "projects", l);
        continue;
      }
      if (/^(certifications?|licenses?|courses?|training)$/i.test(l)) {
        phase = "certifications";
        continue;
      }
      pushBucket(seg, "skills", l);
      continue;
    }

    // --- Education phase. ---
    if (phase === "education") {
      // A project name followed by a date/description that has no degree
      // keywords starts the projects section.
      if (
        isProjectNameLine(l) &&
        lines[i + 1] &&
        DATE_RANGE_RE.test(lines[i + 1].trim())
      ) {
        phase = "projects";
        pushBucket(seg, "projects", l);
        continue;
      }
      if (/^(certifications?|licenses?|courses?|training)$/i.test(l)) {
        phase = "certifications";
        continue;
      }
      pushBucket(seg, "education", l);
      continue;
    }

    // --- Projects phase. ---
    if (phase === "projects") {
      if (/^(certifications?|licenses?|courses?|training)$/i.test(l)) {
        phase = "certifications";
        continue;
      }
      pushBucket(seg, "projects", l);
      continue;
    }

    // --- Certifications phase. ---
    pushBucket(seg, "certifications", l);
  }

  return seg;
};

export const parseResumeByDictionary = (text: string): ResumeParseOutput => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const segmented = segmentResume(lines);

  const allText = text;

  // ---- Personal info (header block) ----
  const headerText = segmented.header.join(" ");

  const fullName = sanitizeName(segmented.header[0] ?? "");
  const email = extractEmail(headerText);
  const phone = extractPhone(headerText);
  const linkedin = extractLinkedIn(headerText);
  const github = extractGithub(headerText);
  const portfolio = extractPortfolio(headerText);

  // Address = remaining header line that contains a city/division word.
  const address =
    segmented.header
      .filter(
        (l) =>
          !l.includes("@") &&
          !/\+?\d{7,}/.test(l) &&
          !/linkedin|github|http/i.test(l),
      )
      .find((l) =>
        /(Dhaka|Chittagong|Khulna|Rajshahi|Sylhet|Barishal|Barisal|Rangpur|Mymensingh|Bangladesh|New York|London|San Francisco|Toronto|Sydney|Berlin|India|USA|UK|Dubai|California|Texas)/i.test(
          l,
        ),
      ) ?? "";

  // Job title: try header, then summary.
  const headerTitleLine =
    segmented.header
      .slice(1)
      .find(
        (l) => !isContactLine(l) && !isLocationLine(l) && isTitleCaseLine(l),
      ) || "";
  let jobTitle =
    headerTitleLine ||
    detectJobTitle(headerText) ||
    detectJobTitle(segmented.summary.join("\n") || allText);

  // ---- Summary ----
  const summary = segmented.summary.join(" ");

  // ---- Experience ----
  const experience = parseExperience(segmented.experience);

  // ---- Projects ----
  const projects = parseProjects(segmented.projects);

  // ---- Education ----
  const education = parseEducation(segmented.education);

  // ---- Skills ----
  const skillsSectionText = segmented.skills.join("\n");
  const skillsAllText = skillsSectionText || allText;
  const hardSkills = matchDictionary(
    skillsAllText,
    HARD_SKILLS_DICTIONARY,
  ).filter((s) => !HARD_SKILL_STOPWORDS.has(s.toLowerCase()));
  const softSkills = matchDictionary(skillsAllText, SOFT_SKILLS_DICTIONARY);

  // ---- Derived metrics ----
  const wordCount = countWords(allText);
  const measurableResults = extractMeasurableResults(allText);
  const yearsOfExperience = extractExperienceYears(allText);

  const educationSection = segmented.education.length > 0;
  const experienceSection = segmented.experience.length > 0;
  const workHistory = experience.length > 0;

  // Date formatting check across experience lines.
  const dateFormatting = detectDateFormatting(segmented.experience);

  const resumeTone = inferTone(allText, measurableResults.length);

  const json: DictionaryResumeJson = {
    personal_info: {
      fullName,
      jobTitle,
      contact: {
        address,
        email,
        phone,
      },
    },
    summary,
    experience,
    education,
    skills: { hardSkills, softSkills },
    projects,
    yearsOfExperience: yearsOfExperience ? `${yearsOfExperience} years` : "",
    measurableResults,
    resumeTone,
    wordCount: Number(wordCount),
    educationSection,
    experienceSection,
    workHistory,
    dateFormatting,
    layout: DEFAULT_LAYOUT,
    fontCheck: DEFAULT_FONT_CHECK,
  };

  const content: ResumeContent = mapToResumeContent(json);

  return { json, content };
};

// ============================================================================
// Experience parsing
// ============================================================================

const parseExperience = (lines: string[]): RawExperience[] => {
  const entries: RawExperience[] = [];
  let current: RawExperience | null = null;
  let pendingDates: { start: string; end: string } | null = null;

  const startNew = (
    role: string,
    company: string,
    location: string,
    start: string,
    end: string,
  ) => {
    if (current) entries.push(current);
    current = {
      role,
      company,
      location,
      startDate: start,
      endDate: end,
      responsibilities: [],
    };
    pendingDates = null;
  };

  for (const rawLine of lines) {
    const line = cleanLine(rawLine);
    if (!line) continue;

    const bullet = /^[•·▪*\-–—]+\s*/;
    const isBullet = bullet.test(line) || /^\d+[.)]\s+/.test(line);

    // Pure date-range line (e.g. "Jan 2021 - Present", "2018 - 2020").
    if (!isBullet && DATE_RANGE_RE.test(line)) {
      const m = line.match(DATE_RANGE_RE)!;
      const range = { start: m[1], end: m[2] };
      if (current) {
        current.startDate = current.startDate || range.start;
        current.endDate = current.endDate || range.end;
      } else {
        pendingDates = range;
      }
      continue;
    }

    // Date-only line (e.g. "2021", "Mar 2019").
    if (!isBullet && isDateOnly(line)) {
      const parts = line.split(/[-–—]/).map((p) => p.trim());
      const start = parts[0] || "";
      let end = parts[1] || "";
      if (!end && /(present|current|now|ongoing)/i.test(line)) end = parts[0];
      if (current) {
        current.startDate = current.startDate || start;
        current.endDate = current.endDate || end;
      } else {
        pendingDates = { start, end };
      }
      continue;
    }

    // Try to detect a role/company header line.
    const header = parseRoleHeader(line);
    if (header && !isBullet) {
      // A role with an open entry that still lacks company/location may actually
      // be the location line of the current entry (e.g. "Freelance • Mymensingh,
      // Bangladesh"). Attach it instead of starting a new experience.
      if (
        current &&
        current.role &&
        !current.company &&
        !current.location &&
        isLocationLike(header.role)
      ) {
        const parts = header.role
          .split(/\s*[•|–—,-]\s*/)
          .map((p) => p.trim())
          .filter(Boolean);
        current.location =
          parts.length > 1 ? parts.slice(1).join(", ") : header.role;
        if (
          /^(freelance|self[- ]employed|remote|contract|independent|consultant)/i.test(
            header.role,
          )
        ) {
          current.company = parts[0] || header.role;
          current.location = parts.slice(1).join(", ") || "";
        }
        continue;
      }
      startNew(
        header.role,
        header.company,
        header.location,
        header.startDate || pendingDates?.start || "",
        header.endDate || pendingDates?.end || "",
      );
      continue;
    }

    // If we have an active entry and this isn't a bullet, treat as continuation of last bullet or role info.
    if (!current) {
      current = {
        role: line,
        company: "",
        location: "",
        startDate: pendingDates?.start || "",
        endDate: pendingDates?.end || "",
        responsibilities: [],
      };
      pendingDates = null;
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
): {
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
} | null => {
  const cleaned = line.replace(/^[•·▪*\-–—\s]+/, "");
  if (!cleaned || cleaned.length > 100) return null;
  // Requires an uppercase word near start to be a heading, not a sentence.
  if (!/^[A-Z]/.test(cleaned)) return null;

  // Reject full sentences (responsibility bullets): a real role header rarely
  // contains a verb past-tense action, a trailing period, or more than ~6 words.
  if (/\.$/.test(cleaned)) return null;
  if (
    /^(developed|designed|built|implemented|created|managed|led|worked|collaborated|delivered|improved|optimized|reduced|maintained|tested|wrote|architected|launched|owned|handled|assisted|spearheaded|responsible for|contributed|supported|helped)\b/i.test(
      cleaned,
    )
  )
    return null;

  // A role header must contain at least two words or a separator/date range,
  // otherwise a wrapped continuation word (e.g. "PostgreSQL") is treated as a role.
  const wordCount = cleaned.split(/\s+/).length;
  if (wordCount > 8) return null;
  if (wordCount < 2 && !/[-–—|,|]|\s+at\s+|\s+@\s+|\d{4}/i.test(cleaned)) {
    return null;
  }

  const result = {
    role: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
  };

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
  const parts = body
    .split(/\s+[|,]\s+|\s+at\s+|\s+@\s+/i)
    .map((p) => p.trim().replace(/[|,]$/, "").trim())
    .filter(Boolean);
  if (parts.length >= 1) result.role = parts[0];
  if (parts.length >= 2) {
    // Second part is company or location; guess by keyword.
    const second = parts[1];
    if (
      /\b(?:remote|hybrid|onsite|on-site|bangladesh|dhaka|usa|uk|germany|india|australia|canada)\b/i.test(
        second,
      ) ||
      /\b(?:city|district|division)\b/i.test(second)
    ) {
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

  const pushCurrent = (
    name: string,
  ): DictionaryResumeJson["projects"][number] => {
    current = { name: name.slice(0, 80), description: [] };
    projects.push(current);
    return current;
  };

  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!line) continue;
    const bullet = /^[•·▪o*\-–—]+\s*/;
    const isBullet = bullet.test(line) || /^\d+[.)]\s+/.test(line);

    if (isBullet) {
      if (!current) current = pushCurrent("Project");
      current.description.push(line.replace(bullet, "").trim());
      continue;
    }

    if (!current || (!current.description.length && !isDescriptionLine(line))) {
      current = pushCurrent(line);
      continue;
    }

    current.description.push(line);
  }
  return projects;
};

const isDescriptionLine = (l: string): boolean =>
  /^(developed|designed|built|implemented|created|used|built with|technologies|features|role|responsibilities)/i.test(
    l,
  ) || l.length > 60;

// ============================================================================
// Education
// ============================================================================

const parseEducation = (lines: string[]): DictionaryResumeJson["education"] => {
  const education: DictionaryResumeJson["education"] = [];

  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!line || line.length > 160) continue;

    const degree =
      matchDictionary(line, DEGREE_KEYWORDS).find(
        (d) => d.toLowerCase() !== "certification",
      ) || "";
    const field = matchDictionary(line, FIELD_OF_STUDY_KEYWORDS)[0] || "";
    const educationLevel = matchDictionary(line, EDUCATION_LEVELS)[0] || "";

    // Dates: "2013 - 2017", "Mar 2017–May 2018" (spaces around dash optional)
    const dates = line.match(
      /(?<start>(?:\d{4})|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{0,4})|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\s*[-–—]\s*(?<end>(?:\d{4})|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{0,4})|present|current)/i,
    );

    if (degree || field || educationLevel) {
      education.push({
        degree,
        field,
        education_level: educationLevel,
      });
    }
  }

  return education;
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
  return dateMatches.every(
    (d) =>
      /present|current/i.test(d) ||
      /^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/.test(d) ||
      /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}/i.test(
        d,
      ),
  );
};

const inferTone = (text: string, measurableCount: number): string => {
  const wordCount = countWords(text);
  if (measurableCount >= 3) return "good";
  if (measurableCount >= 1) return "professional";
  if (wordCount < 100) return "weak";
  return "bad";
};

// const mapToResumeContent = (json: DictionaryResumeJson): ResumeContent => {
//   const addressParts = (json.personal_info.contact.address || "")
//     .split(/[,|-]/)
//     .map((p) => p.trim())
//     .filter(Boolean);

//   return {
//     personalInfo: {
//       fullName: json.personal_info.fullName || undefined,
//       jobTitle: json.personal_info.jobTitle || undefined,
//       contact: {
//         email: json.personal_info.contact.email || undefined,
//         phone: json.personal_info.contact.phone || undefined,
//         address:
//           addressParts.length === 1
//             ? { city: addressParts[0] }
//             : addressParts.length > 1
//               ? { city: addressParts[0], state: addressParts[addressParts.length - 1] }
//               : undefined,
//       },
//     },
//     summary: json.summary || undefined,
//     experience: json.experience.map((exp) => ({
//       company: exp.company || "",
//       title: exp.role || "",
//       startDate: exp.startDate || "",
//       endDate: exp.endDate || undefined,
//       current: /present|current/i.test(exp.endDate),
//       responsibilities: exp.responsibilities || [],
//     })),
//     education: json.education.map((edu) => ({
//       institution: edu.field || "",
//       degree: edu.degree || edu.education_level || "",
//       date: [edu.startDate, edu.endDate].filter(Boolean).join(" - "),
//     })),
//     skills: [...json.skills.hardSkills, ...json.skills.softSkills],
//     hardSkills: json.skills.hardSkills,
//     softSkills: json.skills.softSkills,
//     projects: json.projects.map((p) => ({
//       name: p.name,
//       highlights: p.description,
//       links: p.link ? { live: p.link } : undefined,
//     })),
//     certifications: json.certifications.map((c) => ({
//       name: c.name,
//       issuer: c.issuer || undefined,
//     })),
//   };
// };

const mapToResumeContent = (json: DictionaryResumeJson): ResumeContent => {
  const parseAddress = (address: string) => {
    const addressParts = (address || "")
      .split(/[,|-]/)
      .map((p) => p.trim())
      .filter(Boolean);

    if (addressParts.length === 0) {
      return undefined;
    }

    return {
      city: addressParts[0] || "",
      state:
        addressParts.length > 1
          ? addressParts[addressParts.length - 1]
          : undefined,
    };
  };

  return {
    personalInfo: {
      fullName: json.personal_info?.fullName || "",
      jobTitle: json.personal_info?.jobTitle || "",
      contact: {
        email: json.personal_info?.contact?.email || "",
        phone: json.personal_info?.contact?.phone || "",
        address: parseAddress(json.personal_info?.contact?.address || ""),
      },
    },
    summary: json.summary || "",
    experience: (json.experience || []).map((exp: any) => ({
      role: exp.role || "",
      company: exp.company || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      responsibilities: exp.responsibilities || [],
    })),
    education: (json.education || [])
      .map((edu: any) => ({
        degree: edu.degree || edu.education_level || "",
        field: edu.field || "",
        education_level: edu.education_level || "",
      }))
      .filter((e: any) => e.institution || e.degree || e.date),
    skills: {
      hardSkills: json.skills?.hardSkills || [],
      softSkills: json.skills?.softSkills || [],
    },
    projects: (json.projects || []).map((p: any) => ({
      name: p.name || "",
      description: p.description || [],
    })),
    yearsOfExperience: json.yearsOfExperience || "",
    resumeTone: json.resumeTone || "bad",
    wordCount: json.wordCount || 0,
    educationSection: json.educationSection || false,
    experienceSection: json.experienceSection || false,
    workHistory: json.workHistory || false,
    dateFormatting: json.dateFormatting || false,
    layout: {
      isSingleColumn: json.layout?.isSingleColumn || false,
      hasTables: json.layout?.hasTables || false,
      hasImages: json.layout?.hasImages || false,
      hasIcons: json.layout?.hasIcons || false,
      hasMultiColumn: json.layout?.hasMultiColumn || false,
    },
    fontCheck: {
      isStandardFont: json.fontCheck?.isStandardFont || false,
      fontName: json.fontCheck?.fontName || "",
      isReadableSize: json.fontCheck?.isReadableSize || false,
    },
  };
};
