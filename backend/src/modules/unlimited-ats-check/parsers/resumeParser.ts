// ============================================================================
// Resume Parser (Dictionary-Based, No LLM)
// ============================================================================
// Parses raw resume text into structured JSON using regex patterns and
// dictionary matching. Extracts personal info, experience, education,
// skills, projects, and computes derived metrics for ATS scoring.
// ============================================================================

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

// ============================================================================
// Constants & Defaults
// ============================================================================
// Fallback values for layout and font analysis (not yet implemented).
// ============================================================================

const DEFAULT_LAYOUT: LayoutInfo = {
  isSingleColumn: false,
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

// ============================================================================
// Location Detection
// ============================================================================
// Identifies location-like strings (cities, countries, employment types)
// to distinguish them from role titles during experience parsing.
// ============================================================================

/** True if the line looks like an employment/location continuation rather than a role. */
const isLocationLike = (role: string): boolean => {
  const lower = role.toLowerCase();
  if (
    /^(freelance|contract|self[- ]employed|remote|contract|independent|part[- ]time|full[- ]time)/.test(
      lower,
    )
  )
    return true;
  return /(?:dhaka|chittagong|khulna|rajshahi|sylhet|barishal|rangpur|mymensingh|bangladesh|usa|uk|new york|london|remote)/i.test(
    role,
  );
};

// ============================================================================
// Name Parsing
// ============================================================================
// Extracts and validates the candidate's full name from the header block.
// Rejects emails, URLs, section headings, and non-name-like strings.
// ============================================================================

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

// ============================================================================
// Job Title Detection
// ============================================================================
// Identifies the candidate's job title from header lines or summary text
// by matching against common role suffixes (Engineer, Developer, etc.).
// ============================================================================

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

// ============================================================================
// Years of Experience Calculation
// ============================================================================
// Computes total professional experience by parsing date ranges from
// experience entries, merging overlaps, and summing durations.
// ============================================================================

const extractExperienceYears = (text: string): number => {
  const m = text.match(
    /(?:^|\W)(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)(?:\W|$)/i,
  );
  return m ? Math.round(parseFloat(m[1])) : 0;
};

const calculateExperienceYears = (experiences: RawExperience[]): number => {
  if (!experiences || experiences.length === 0) return 0;

  const allDates: { start: Date; end: Date }[] = [];

  for (const exp of experiences) {
    const startDate = parseDateString(exp.startDate);
    const endDate = parseDateString(exp.endDate);

    if (startDate) {
      const end = endDate || new Date(); // If no end date, assume current
      if (end > startDate) {
        allDates.push({ start: startDate, end });
      }
    }
  }

  if (allDates.length === 0) return 0;

  // Sort by start date
  allDates.sort((a, b) => a.start.getTime() - b.start.getTime());

  // Merge overlapping date ranges and calculate total years
  const mergedRanges: { start: Date; end: Date }[] = [];
  let currentRange = { ...allDates[0] };

  for (let i = 1; i < allDates.length; i++) {
    if (allDates[i].start <= currentRange.end) {
      // Overlapping or adjacent ranges
      currentRange.end = new Date(
        Math.max(currentRange.end.getTime(), allDates[i].end.getTime()),
      );
    } else {
      mergedRanges.push(currentRange);
      currentRange = { ...allDates[i] };
    }
  }
  mergedRanges.push(currentRange);

  // Calculate total months
  let totalMonths = 0;
  for (const range of mergedRanges) {
    const months =
      (range.end.getFullYear() - range.start.getFullYear()) * 12 +
      (range.end.getMonth() - range.start.getMonth());
    totalMonths += months;
  }

  // Convert to years (round to 1 decimal place)
  return Math.round((totalMonths / 12) * 10) / 10;
};

// ============================================================================
// Date Parsing Helpers
// ============================================================================
// Converts date strings (e.g. "Jan 2024", "2023-06", "Present") into
// Date objects for duration calculations.
// ============================================================================

const parseDateString = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  // Handle "Present", "Current", "Now"
  if (/present|current|now|ongoing/i.test(dateStr)) {
    return new Date();
  }

  // Handle "2024", "Jan 2024", "January 2024", "01/2024", "01/15/2024"
  let match = dateStr.match(
    /^(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+)?(\d{4})$/i,
  );
  if (match) {
    const year = parseInt(match[1]);
    const monthMatch = dateStr.match(
      /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?/i,
    );
    const month = monthMatch ? getMonthNumber(monthMatch[1]) : 0;
    return new Date(year, month, 1);
  }

  // Handle "Jan 2024", "January 2024"
  match = dateStr.match(
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+(\d{4})$/i,
  );
  if (match) {
    return new Date(parseInt(match[2]), getMonthNumber(match[1]), 1);
  }

  // Handle "01/2024", "01/15/2024"
  match = dateStr.match(/^(\d{1,2})\/(\d{4})$/);
  if (match) {
    return new Date(parseInt(match[2]), parseInt(match[1]) - 1, 1);
  }

  match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    return new Date(
      parseInt(match[3]),
      parseInt(match[1]) - 1,
      parseInt(match[2]),
    );
  }

  return null;
};

const getMonthNumber = (month: string): number => {
  const months: { [key: string]: number } = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };
  return months[month.toLowerCase()] || 0;
};

// ============================================================================
// Utility Predicates
// ============================================================================
// Small helper functions that classify lines as dates, titles, education,
// locations, or section headings to guide the segmentation logic.
// ============================================================================

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
// Content-Based Section Segmentation
// ============================================================================
// Walks resume lines top-to-bottom and buckets each line into a section
// (header, summary, experience, skills, education, projects, certifications)
// using content-based heuristics and heading detection.
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

    // --- Header phase ---
    if (phase === "header") {
      if (isSummarySentence(l) && !isContactLine(l)) {
        phase = "summary";
        pushBucket(seg, "summary", l);
        continue;
      }
      if (DATE_RANGE_RE.test(l)) {
        phase = "experience";
        pushBucket(seg, "experience", l);
        continue;
      }
      if (isEducationLine(l) && l.length < 60) {
        phase = "education";
        pushBucket(seg, "education", l);
        continue;
      }
      pushBucket(seg, "header", l);
      continue;
    }

    // --- Summary phase ---
    if (phase === "summary") {
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
      if (DATE_RANGE_RE.test(l) || isContactLine(l) || bullet) {
        phase = "experience";
        if (DATE_RANGE_RE.test(l) || bullet) pushBucket(seg, "experience", l);
        continue;
      }
      pushBucket(seg, "summary", l);
      continue;
    }

    // --- Experience phase ---
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

    // --- Skills phase ---
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

    // --- Education phase ---
    if (phase === "education") {
      const nextLine = (lines[i + 1] || "").trim();
      if (
        isProjectNameLine(l) &&
        nextLine &&
        DATE_RANGE_RE.test(nextLine) &&
        !/^\s*\d{4}\s*[-–—]\s*\d{4}\s*$/i.test(nextLine)
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

    // --- Projects phase ---
    if (phase === "projects") {
      if (/^(certifications?|licenses?|courses?|training)$/i.test(l)) {
        phase = "certifications";
        continue;
      }
      pushBucket(seg, "projects", l);
      continue;
    }

    // --- Certifications phase ---
    pushBucket(seg, "certifications", l);
  }

  return seg;
};

// ============================================================================
// Main Parser Entry Point
// ============================================================================
// Orchestrates the full parsing pipeline: segments resume into sections,
// extracts structured data from each, and returns both raw JSON and the
// mapped ResumeContent used by the scoring engine.
// ============================================================================

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
  const hasSkillsSection = skillsSectionText.trim().length > 0;
  const skillsAllText = hasSkillsSection ? skillsSectionText : allText;
  let hardSkills = matchDictionary(skillsAllText, HARD_SKILLS_DICTIONARY);
  if (!hasSkillsSection) {
    hardSkills = hardSkills.filter(
      (s) => !HARD_SKILL_STOPWORDS.has(s.toLowerCase()),
    );
  }
  const softSkills = matchDictionary(skillsAllText, SOFT_SKILLS_DICTIONARY);

  // ---- Derived metrics ----
  const wordCount = countWords(allText);
  const measurableResults = extractMeasurableResults(allText);

  // Calculate years of experience from experience section dates
  const yearsOfExperience = calculateExperienceYears(experience);

  const educationSection = segmented.education.length > 0;
  const experienceSection = segmented.experience.length > 0;
  const workHistory = experience.length > 0;

  // Date formatting check across experience, education and project lines.
  const dateFormatting = detectDateFormatting([
    ...segmented.experience,
    ...segmented.education,
    ...segmented.projects,
  ]);

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
// Experience Parsing
// ============================================================================
// Parses work experience entries from segmented lines. Detects role/company
// headers, date ranges, bullet-point responsibilities, and location info.
// Handles various formats: "Role | Company | Location", "Role at Company",
// standalone date lines, and PDF text concatenation artifacts.
// ============================================================================

// const parseExperience = (lines: string[]): RawExperience[] => {
//   const entries: RawExperience[] = [];
//   let current: RawExperience | null = null;
//   let pendingDates: { start: string; end: string } | null = null;

//   const startNew = (
//     role: string,
//     company: string,
//     location: string,
//     start: string,
//     end: string,
//   ) => {
//     if (current) entries.push(current);
//     current = {
//       role,
//       company,
//       location,
//       startDate: start,
//       endDate: end,
//       responsibilities: [],
//     };
//     pendingDates = null;
//   };

//   for (const rawLine of lines) {
//     const line = cleanLine(rawLine);
//     if (!line) continue;

//     const bullet = /^[•·▪*\-–—]+\s*/;
//     const isBullet = bullet.test(line) || /^\d+[.)]\s+/.test(line);

//     // Pure date-range line (e.g. "Jan 2021 - Present", "2018 - 2020").
//     if (!isBullet && DATE_RANGE_RE.test(line)) {
//       const m = line.match(DATE_RANGE_RE)!;
//       const range = { start: m[1], end: m[2] };
//       if (current) {
//         current.startDate = current.startDate || range.start;
//         current.endDate = current.endDate || range.end;
//       } else {
//         pendingDates = range;
//       }
//       continue;
//     }

//     // Date-only line (e.g. "2021", "Mar 2019").
//     if (!isBullet && isDateOnly(line)) {
//       const parts = line.split(/[-–—]/).map((p) => p.trim());
//       const start = parts[0] || "";
//       let end = parts[1] || "";
//       if (!end && /(present|current|now|ongoing)/i.test(line)) end = parts[0];
//       if (current) {
//         current.startDate = current.startDate || start;
//         current.endDate = current.endDate || end;
//       } else {
//         pendingDates = { start, end };
//       }
//       continue;
//     }

//     // Try to detect a role/company header line.
//     const header = parseRoleHeader(line);
//     if (header && !isBullet) {
//       if (
//         current &&
//         current.role &&
//         !current.company &&
//         !current.location &&
//         isLocationLike(header.role)
//       ) {
//         const parts = header.role
//           .split(/\s*[•·|–—,-]\s*/)
//           .map((p) => p.trim())
//           .filter(Boolean);
//         if (parts.length > 1) {
//           current.company = parts[0];
//           current.location = parts.slice(1).join(", ");
//         } else {
//           current.location = header.role;
//         }
//         continue;
//       }
//       startNew(
//         header.role,
//         header.company,
//         header.location,
//         header.startDate || pendingDates?.start || "",
//         header.endDate || pendingDates?.end || "",
//       );
//       continue;
//     }

//     // If we have an active entry and this isn't a bullet, treat as continuation of last bullet or role info.
//     if (!current) {
//       current = {
//         role: line,
//         company: "",
//         location: "",
//         startDate: pendingDates?.start || "",
//         endDate: pendingDates?.end || "",
//         responsibilities: [],
//       };
//       pendingDates = null;
//       continue;
//     }

//     if (isBullet) {
//       current.responsibilities.push(line.replace(bullet, "").trim());
//     } else if (!current.role && line.length < 60) {
//       current.role = line;
//     } else {
//       current.responsibilities.push(line);
//     }
//   }

//   if (current) entries.push(current);
//   return entries;
// };

const parseExperience = (lines: string[]): RawExperience[] => {
  const entries: RawExperience[] = [];
  let current: RawExperience | null = null;
  let pendingDates: { start: string; end: string } | null = null;

  const startNew = (
    role: string,
    company: string,
    start: string,
    end: string,
  ) => {
    if (current) entries.push(current);
    current = {
      role,
      company,
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
      // Case: Current entry exists, has role but missing company
      if (current && current.role && !current.company) {
        const parts = header.role
          .split(/\s*[•·|–—,-]\s*/)
          .map((p) => p.trim())
          .filter(Boolean);

        if (parts.length > 1) {
          current.company = parts[0]; // Set company from first part
        }
        continue;
      }

      // Case: Start a new entry
      startNew(
        header.role,
        header.company,
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

// ============================================================================
// Role Header Parsing
// ============================================================================
// Parses a single line into role, company, location, and date components.
// Handles separators like "|", "at", "@" and embedded date ranges.
// ============================================================================

const parseRoleHeader = (
  line: string,
): {
  role: string;
  company: string;
  startDate: string;
  endDate: string;
} | null => {
  let cleaned = line.replace(/^[•·▪*\-–—\s]+/, "");
  // Insert space before month names when directly attached to a word
  cleaned = cleaned.replace(
    /([a-zA-Z])(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)/g,
    "$1 $2",
  );
  if (!cleaned || cleaned.length > 100) return null;
  if (!/^[A-Z]/.test(cleaned)) return null;

  // Reject full sentences
  if (/\.$/.test(cleaned)) return null;
  if (
    /^(developed|designed|built|implemented|created|managed|led|worked|collaborated|delivered|improved|optimized|reduced|maintained|tested|wrote|architected|launched|owned|handled|assisted|spearheaded|responsible for|contributed|supported|helped|applied)\b/i.test(
      cleaned,
    )
  )
    return null;

  const wordCount = cleaned.split(/\s+/).length;
  if (wordCount > 8) return null;
  if (wordCount < 2 && !/[-–—|,|]|\s+at\s+|\s+@\s+|\d{4}/i.test(cleaned)) {
    return null;
  }

  const result = {
    role: "",
    company: "",
    startDate: "",
    endDate: "",
  };

  // First try to find a full date range "Start - End" anywhere in the line.
  const fullRangeMatch = cleaned.match(
    /((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{0,4}))\s*[-–—]\s*((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{0,4}|present|current|now|ongoing))/i,
  );
  let body = cleaned;
  if (fullRangeMatch) {
    result.startDate = fullRangeMatch[1];
    result.endDate = fullRangeMatch[2];
    body = (
      cleaned.slice(0, fullRangeMatch.index) +
      cleaned.slice(fullRangeMatch.index! + fullRangeMatch[0].length)
    ).trim();
  } else {
    // Fallback: split date range off the end.
    const dateMatch = cleaned.match(
      /\s+[-–—|]\s+((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{0,4}|present|current|now|ongoing))\s*$/i,
    );
    if (dateMatch) {
      result.endDate = dateMatch[1];
      body = cleaned.slice(0, dateMatch.index).trim();
    }
  }

  // Split on " | " or " · " or " at " or " , " separators.
  const parts = body
    .split(/\s+[|,]\s+|\s+at\s+|\s+@\s+/i)
    .map((p) => p.trim().replace(/[|,]$/, "").trim())
    .filter(Boolean);
  if (parts.length >= 1) result.role = parts[0];
  if (parts.length >= 2) {
    result.company = parts[1];
  }

  if (!result.role) return null;
  return result;
};

// ============================================================================
// Project Parsing
// ============================================================================
// Extracts project entries with names, descriptions, and date ranges.
// Handles PDF month-name concatenation and standalone date assignment.
// ============================================================================

const parseProjects = (lines: string[]): DictionaryResumeJson["projects"] => {
  const projects: DictionaryResumeJson["projects"] = [];
  let current: DictionaryResumeJson["projects"][number] | null = null;
  let pendingDates: { start: string; end: string } | null = null;

  const pushCurrent = (
    name: string,
  ): DictionaryResumeJson["projects"][number] => {
    // Apply any pending dates to the previous project before creating new one.
    if (current && pendingDates && !current.startDate) {
      current.startDate = pendingDates.start;
      current.endDate = pendingDates.end;
      pendingDates = null;
    }
    current = {
      name: name.slice(0, 80),
      description: [],
      startDate: "",
      endDate: "",
    };
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

    // PDF text extraction often concatenates a month to the previous word
    // with no space ("E-Commerce PlatformFeb 2024 - Present"). Insert the
    // space so the project name does not swallow its start date.
    const spaced = line.replace(
      /([a-zA-Z])(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)/g,
      "$1 $2",
    );

    // Standalone date range — assign to current project or hold as pending.
    if (DATE_RANGE_RE.test(spaced)) {
      const dm = spaced.match(DATE_RANGE_RE)!;
      if (current && !current.startDate) {
        current.startDate = dm[1];
        current.endDate = dm[2];
      } else {
        pendingDates = { start: dm[1], end: dm[2] };
      }
      continue;
    }

    // Year-only range (e.g. "2020 - 2024").
    if (/^\d{4}\s*[-–—]\s*\d{4}$/i.test(spaced)) {
      const parts = spaced.split(/[-–—]/).map((p) => p.trim());
      if (current && !current.startDate) {
        current.startDate = parts[0];
        current.endDate = parts[1] || "";
      } else {
        pendingDates = { start: parts[0], end: parts[1] || "" };
      }
      continue;
    }

    if (
      !current ||
      (!current.description.length && !isDescriptionLine(spaced))
    ) {
      current = pushCurrent(spaced);
      continue;
    }

    current.description.push(spaced);
  }

  // Flush pending dates to the last project.
  if (current && pendingDates && !current.startDate) {
    current.startDate = pendingDates.start;
    current.endDate = pendingDates.end;
  }

  return projects;
};

// ============================================================================
// Project Description Detection
// ============================================================================
// Determines if a line is a project description rather than a project name
// by checking for action verbs or excessive length.
// ============================================================================

const isDescriptionLine = (l: string): boolean =>
  /^(developed|designed|built|implemented|created|used|built with|technologies|features|role|responsibilities)/i.test(
    l,
  ) || l.length > 60;

// ============================================================================
// Education Parsing
// ============================================================================
// Groups consecutive education-related lines and extracts degree, field,
// education level, and date ranges using dictionary matching.
// ============================================================================

const parseEducation = (lines: string[]): DictionaryResumeJson["education"] => {
  const education: DictionaryResumeJson["education"] = [];

  // Education entries often span multiple lines:
  //   "Bachelor of Science in Computer Science"
  //   "University of Dhaka"
  //   "2013 - 2017"
  // Accumulate consecutive lines that belong together, then extract fields.
  const DATE_LINE_RE =
    /(?<start>(?:\d{4})|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{0,4})|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})\s*[-–—]\s*(?<end>(?:\d{4})|(?:(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{0,4})|present|current)/i;

  let pendingLines: string[] = [];

  const flushPending = () => {
    if (pendingLines.length === 0) return;
    const combined = pendingLines.join(" ");

    const degree =
      matchDictionary(combined, DEGREE_KEYWORDS).find(
        (d) => d.toLowerCase() !== "certification",
      ) || "";
    const field = matchDictionary(combined, FIELD_OF_STUDY_KEYWORDS)[0] || "";
    const educationLevel = matchDictionary(combined, EDUCATION_LEVELS)[0] || "";

    // Try dates from each individual line first, then from combined text.
    let startDate = "";
    let endDate = "";
    for (const l of pendingLines) {
      const dm = l.match(DATE_LINE_RE);
      if (dm) {
        startDate = dm.groups?.start || "";
        endDate = dm.groups?.end || "";
        break;
      }
    }
    if (!startDate) {
      const dm = combined.match(DATE_LINE_RE);
      startDate = dm?.groups?.start || "";
      endDate = dm?.groups?.end || "";
    }

    if (degree || field || educationLevel) {
      education.push({
        degree,
        field,
        education_level: educationLevel,
        startDate,
        endDate,
      });
    }
    pendingLines = [];
  };

  for (const raw of lines) {
    const line = cleanLine(raw);
    if (!line || line.length > 160) continue;

    // A standalone date range or a pure date-only line belongs to the
    // previous education entry, not a new one.
    if (/^\d{4}\s*[-–—]\s*\d{4}$/i.test(line) || DATE_RANGE_RE.test(line)) {
      pendingLines.push(line);
      continue;
    }

    const degree =
      matchDictionary(line, DEGREE_KEYWORDS).find(
        (d) => d.toLowerCase() !== "certification",
      ) || "";
    const field = matchDictionary(line, FIELD_OF_STUDY_KEYWORDS)[0] || "";
    const educationLevel = matchDictionary(line, EDUCATION_LEVELS)[0] || "";

    // If this line has degree/field/level info, it starts or continues an entry.
    if (degree || field || educationLevel) {
      pendingLines.push(line);
      continue;
    }

    // If we have pending lines and this line is short (institution name,
    // GPA, etc.), it likely belongs to the same entry.
    if (pendingLines.length > 0 && line.length < 80) {
      pendingLines.push(line);
      continue;
    }

    // Otherwise flush whatever we have and skip this line.
    flushPending();
  }

  flushPending();
  return education;
};

// ============================================================================
// Derived Metrics & Formatting Helpers
// ============================================================================
// Detects date formatting consistency, infers resume tone from measurable
// results count, and maps parsed JSON to the shared ResumeContent type.
// ============================================================================

const detectDateFormatting = (lines: string[]): boolean => {
  const text = lines.join("\n");
  const dateMatches = text.match(
    /\b((?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})|(?:\d{1,2}[\/-]\d{2,4})|(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s*\d{4})|(?:present|current))\b/gi,
  );
  if (!dateMatches || dateMatches.length === 0) return true;
  return dateMatches.every(
    (d) =>
      /present|current/i.test(d) ||
      /^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/.test(d) ||
      /^\d{1,2}[\/-]\d{2,4}$/.test(d) ||
      /^(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s*\d{4}$/i.test(
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

// ============================================================================
// ResumeContent Mapping
// ============================================================================
// Converts the dictionary-parsed JSON output into the shared ResumeContent
// type used by the scoring engine and other modules.
// ============================================================================

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
        startDate: edu.startDate || "",
        endDate: edu.endDate || "",
      }))
      .filter((e: any) => e.institution || e.degree || e.date),
    skills: {
      hardSkills: json.skills?.hardSkills || [],
      softSkills: json.skills?.softSkills || [],
    },
    projects: (json.projects || []).map((p: any) => ({
      name: p.name || "",
      description: p.description || [],
      startDate: p.startDate || "",
      endDate: p.endDate || "",
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
