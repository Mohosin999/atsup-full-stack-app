import fs from "fs";
import path from "path";
import { ResumeContent } from "../../types";
import { extractHardSoftSkills, extractKeywordsFromText } from "../jdParser";

export const parseResumeFile = async (
  filePath: string,
  mimeType: string,
): Promise<ResumeContent> => {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === ".pdf") {
    return parsePDF(filePath);
  } else if (ext === ".docx") {
    return parseDOCX(filePath);
  } else {
    throw new Error("Unsupported file format");
  }
};

const parsePDF = async (filePath: string): Promise<ResumeContent> => {
  try {
    const pdf = require("pdf-parse");
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdf(dataBuffer);

    console.log("data ", data);

    return parseTextToResume(data.text);
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("Failed to parse PDF file");
  }
};

const parseDOCX = async (filePath: string): Promise<ResumeContent> => {
  try {
    const mammoth = require("mammoth");
    const result = await mammoth.extractRawText({ path: filePath });

    return parseTextToResume(result.value);
  } catch (error) {
    console.error("DOCX parsing error:", error);
    throw new Error("Failed to parse DOCX file");
  }
};

// ============================================================================
// Regex helpers
// ============================================================================

const dateRangeRe =
  /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}\s*(?:–|-)\s*(?:present|current|now|\d{1,2}\/\d{4}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4})/i;

const singleDateRe =
  /\b(?:19|20)\d{2}\b|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{4}/i;

const titleKeywordsRe =
  /\b(Engineer|Developer|Manager|Director|Lead|Senior|Junior|Intern|Analyst|Consultant|Architect|Designer|Specialist|Coordinator|Administrator|Programmer|Scientist|Researcher|Officer|Executive|Head|Chief|VP|President|Founder|Owner|Trainee|Apprentice|Assistant|Associate)\b/i;

const degreeKeywordsRe =
  /\b(bachelor|master|phd|doctorate|b\.sc|m\.sc|b\.e|m\.e|b\.tech|m\.tech|bs|ba|ms|ma|degree)\b/i;

const tocRe = /^(summary|work\s+experience|skills|education|projects)$/i;

const technicalSkillsRe =
  /^(technical\s+skills?|core\s+competencies?|technologies?|tech\s+stack)$/i;
const softSkillsRe = /^(soft\s+skills?|interpersonal\s+skills?)$/i;
const otherSkillsRe = /^(other\s+skills?|additional\s+skills?|languages?)$/i;
const skillsHeadingRe =
  /^(technical\s+skills?|core\s+competencies?|technologies?|tech\s+stack|soft\s+skills?|interpersonal\s+skills?|other\s+skills?|additional\s+skills?|languages?|skills?)$/i;

const certHeadingRe =
  /^(certifications?|certificates?|licenses?|credentials?|licensure)$/i;
const achievementHeadingRe =
  /^(achievements?|awards?|honors?|accomplishments?|recognitions?)$/i;

const gpaRe = /^gpa\s*:/i;

const emailRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const phoneRe =
  /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{3,5}/g;
const linkedinRe = /linkedin\.com\/in\/[a-zA-Z0-9-]+/gi;
const urlRe = /https?:\/\/[^\s]+/g;

const isDateLine = (line: string) => dateRangeRe.test(line);

const isEntryNameLine = (line: string) => {
  if (!line || line.length >= 50) return false;
  if (line.includes("@") || line.includes("•")) return false;
  if (tocRe.test(line)) return false;
  if (skillsHeadingRe.test(line)) return false;
  if (certHeadingRe.test(line)) return false;
  if (achievementHeadingRe.test(line)) return false;
  if (degreeKeywordsRe.test(line)) return false;
  if (gpaRe.test(line)) return false;
  if (dateRangeRe.test(line)) return false;
  if (/\.$/.test(line)) return false;
  return true;
};

const terminalPunctRe = /[.;:!?]$/;

const isBulletLine = (line: string) =>
  line.length > 10 &&
  line.length <= 150 &&
  terminalPunctRe.test(line) &&
  !/\w\.\s+[A-Z]/.test(line);

const commonSkills = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "Ruby",
  "Go",
  "Rust",
  "PHP",
  "React",
  "Angular",
  "Vue",
  "Node.js",
  "Express",
  "Django",
  "Flask",
  "NestJS",
  "Next.js",
  "Nuxt",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "SQL",
  "NoSQL",
  "Firebase",
  "Elasticsearch",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "Jenkins",
  "Git",
  "GitHub",
  "GitLab",
  "HTML",
  "CSS",
  "SASS",
  "Tailwind",
  "REST",
  "GraphQL",
  "API",
  "Microservices",
  "Linux",
  "Problem Solving",
  "Communication",
  "Team Lead",
  "Teamwork",
  "Leadership",
  "Time Management",
  "Adaptability",
  "Creativity",
  "Presentation",
  "Collaboration",
  "Critical Thinking",
  "Conflict Resolution",
  "Negotiation",
  "Mentoring",
  "Agile Methodologies",
  "Version Control (Git)",
  "RESTful APIs",
  "Databases (SQL/NoSQL)",
];

const knownSkills = new Set(commonSkills);

const isSkillLine = (line: string) => {
  const parts = line
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return false;
  if (parts.length >= 3) return true;
  if (parts.length === 2) {
    return parts.filter((p) => knownSkills.has(p)).length >= 1;
  }
  const s = parts[0];
  return (
    s.length < 30 &&
    !isDateLine(s) &&
    !degreeKeywordsRe.test(s) &&
    !titleKeywordsRe.test(s) &&
    !/\.$/.test(s) &&
    (knownSkills.has(s) || /[a-zA-Z0-9]+\.[a-zA-Z]/.test(s))
  );
};

const parseDates = (line: string) => {
  const match = line.match(dateRangeRe);
  const dateStr = match ? match[0] : line;
  const [start, end] = dateStr.split(/\s*(?:–|-)\s*/);
  const isCurrent = !!end && /present|current|now/i.test(end);
  return {
    startDate: start?.trim(),
    endDate: isCurrent ? undefined : end?.trim(),
    current: isCurrent ? true : undefined,
    dateStr,
  };
};

// ============================================================================
// Fixed-template resume parser
// ============================================================================

export const parseTextToResume = (text: string): ResumeContent => {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const content: ResumeContent = {
    personalInfo: {},
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
  };

  // --- Personal info (regex scan over whole text) ---
  const emailMatch = text.match(emailRe);
  const phoneMatch = text.match(phoneRe);
  const linkedinMatch = text.match(linkedinRe);
  const urlMatch = text.match(urlRe);

  content.personalInfo.contact = {};
  if (emailMatch) content.personalInfo.contact.email = emailMatch[0];
  if (phoneMatch) content.personalInfo.contact.phone = phoneMatch[0];
  if (linkedinMatch) content.personalInfo.contact.linkedIn = linkedinMatch[0];
  if (urlMatch) content.personalInfo.contact.socialLinks = { portfolio: urlMatch[0] };

  // Fixed template header order: name, job title, email, phone, address, linkedin
  const header = lines.slice(0, 6);
  if (header[0] && header[0].length < 50 && !header[0].includes("@")) {
    content.personalInfo.fullName = header[0];
  }
  if (header[1] && header[1].length < 50 && !header[1].includes("@")) {
    content.personalInfo.jobTitle = header[1];
  }
  if (header[4]) {
    const [city, division] = header[4].split(",").map((s) => s.trim());
    content.personalInfo.contact.address = {
      city: city || undefined,
      division: division || undefined,
    };
  }

  const body = lines.slice(6);

  // --- Summary: prose lines before the first entry boundary ---
  let i = 0;
  const summaryLines: string[] = [];
  while (i < body.length) {
    const line = body[i];
    if (
      tocRe.test(line) ||
      skillsHeadingRe.test(line) ||
      certHeadingRe.test(line) ||
      achievementHeadingRe.test(line) ||
      isEntryNameLine(line) ||
      isDateLine(line)
    ) {
      break;
    }
    summaryLines.push(line);
    i++;
  }
  if (summaryLines.length > 0) {
    content.summary = summaryLines.join(" ");
  }

  // --- Main state machine over body lines ---
  let pendingName: string | null = null;
  let inSkills = false;
  let sectionMode: "certification" | "achievement" | null = null;
  let currentType: "experience" | "education" | "project" | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let currentEntry: any = null;
  const desc: string[] = [];

  const flushEntry = () => {
    if (!currentEntry) return;
    if (desc.length > 0) {
      const isCertLike =
        sectionMode === "certification" || sectionMode === "achievement";
      if (isCertLike) {
        currentEntry.description = desc.join(" ").trim();
      } else {
        const bullets = desc.filter(isBulletLine);
        const fragments = desc.filter((l) => !isBulletLine(l));
        currentEntry.highlights =
          fragments.length > 0 ? [...bullets, fragments.join(" ")] : bullets;
      }
      desc.length = 0;
    }
    currentEntry = null;
    currentType = null;
  };

  const addSkill = (line: string) => {
    for (const part of line.split(",")) {
      const clean = part.trim();
      if (!clean || clean.length >= 60) continue;
      if (content.skills.includes(clean)) continue;
      content.skills.push(clean);
    }
  };

  const certAchievementAction = (
    line: string,
    next: string | undefined,
  ):
    | "skip"
    | "skills"
    | "switchCert"
    | "switchAchievement"
    | "reprocess"
    | "content" => {
    if (tocRe.test(line)) return "skip";
    if (skillsHeadingRe.test(line)) return "skills";
    if (certHeadingRe.test(line)) return "switchCert";
    if (achievementHeadingRe.test(line)) return "switchAchievement";
    if (isDateLine(line)) return "reprocess";
    return "content";
  };

  for (; i < body.length; i++) {
    const line = body[i];
    const next = body[i + 1];

    if (tocRe.test(line)) continue;

    // Skills block: consume everything after a skills heading
    if (inSkills) {
      if (skillsHeadingRe.test(line)) continue;
      const exitSkills =
        (next && isDateLine(next)) ||
        (next && degreeKeywordsRe.test(next)) ||
        (next && certHeadingRe.test(next)) ||
        (next && achievementHeadingRe.test(next));
      if (exitSkills && !isSkillLine(line)) {
        inSkills = false;
        i--;
        continue;
      }
      addSkill(line);
      continue;
    }

    if (skillsHeadingRe.test(line)) {
      flushEntry();
      inSkills = true;
      continue;
    }

    if (certHeadingRe.test(line) || achievementHeadingRe.test(line)) {
      flushEntry();
      sectionMode = certHeadingRe.test(line) ? "certification" : "achievement";
      pendingName = null;
      continue;
    }

    if (sectionMode) {
      const action = certAchievementAction(line, next);
      if (action === "skip") continue;
      if (action === "skills") {
        sectionMode = null;
        inSkills = true;
        continue;
      }
      if (action === "switchCert") {
        sectionMode = "certification";
        continue;
      }
      if (action === "switchAchievement") {
        sectionMode = "achievement";
        continue;
      }
      if (action === "reprocess") {
        if (
          currentEntry &&
          (currentEntry.name || currentEntry.title) &&
          !pendingName
        ) {
          pendingName = currentEntry.name || currentEntry.title;
        }
        if (sectionMode === "certification") content.certifications?.pop();
        if (sectionMode === "achievement") content.achievements?.pop();
        currentEntry = null;
        currentType = null;
        desc.length = 0;
        sectionMode = null;
        i--;
        continue;
      }

      // Content of certification / achievement section
      const isCert = sectionMode === "certification";
      if (line.includes("•") && currentEntry) {
        const [issuer, datePart] = line.split("•").map((s) => s.trim());
        if (isCert && issuer) currentEntry.issuer = issuer;
        const m = (datePart || "").match(singleDateRe);
        if (m) currentEntry.date = m[0];
        continue;
      }
      const singleDateMatch = line.match(singleDateRe);
      if (singleDateMatch && line.length < 15) {
        if (currentEntry) currentEntry.date = singleDateMatch[0];
        continue;
      }
      if (isEntryNameLine(line)) {
        flushEntry();
        currentEntry = isCert
          ? { name: line, description: "", issuer: undefined, date: undefined }
          : { title: line, description: "", date: undefined };
        if (isCert) content.certifications?.push(currentEntry);
        else content.achievements?.push(currentEntry);
        continue;
      }
      if (currentEntry) {
        if (line.length < 40 && !terminalPunctRe.test(line)) {
          if (isCert && !currentEntry.issuer) {
            currentEntry.issuer = line;
            continue;
          }
        }
        desc.push(line);
      }
      continue;
    }

    // Date line -> new entry boundary
    if (isDateLine(line)) {
      const { startDate, endDate, current, dateStr } = parseDates(line);

      let type: "experience" | "education" | "project";
      if (next && degreeKeywordsRe.test(next)) type = "education";
      else if (pendingName && titleKeywordsRe.test(pendingName))
        type = "experience";
      else type = "project";

      flushEntry();

      if (type === "experience") {
        currentEntry = {
          title: pendingName ?? "",
          company: "",
          highlights: [],
          startDate,
          endDate,
          current,
        };
        content.experience.push(currentEntry);
      } else if (type === "education") {
        currentEntry = {
          institution: pendingName ?? "",
          degree: "",
          date: dateStr,
        };
        content.education.push(currentEntry);
      } else {
        currentEntry = {
          name: pendingName ?? "",
          highlights: [],
          technologies: [],
          startDate,
          endDate,
          current,
        };
        content.projects?.push(currentEntry);
      }
      currentType = type;
      pendingName = null;
      continue;
    }

    // Fill the open entry
    if (currentType === "experience") {
      if (!currentEntry.company) {
        if (line.includes("•")) {
          const [company, location] = line.split("•").map((s) => s.trim());
          currentEntry.company = company || "";
          if (location) currentEntry.location = location;
          continue;
        }
        if (
          line.length < 60 &&
          !isDateLine(line) &&
          !/\.$/.test(line) &&
          !degreeKeywordsRe.test(line)
        ) {
          currentEntry.company = line;
          continue;
        }
      }
      if (line.length > 1) desc.push(line);
      continue;
    }

    if (currentType === "education") {
      if (degreeKeywordsRe.test(line)) {
        currentEntry.degree = line;
        continue;
      }
      if (gpaRe.test(line)) continue;
      if (isEntryNameLine(line)) {
        pendingName = line;
        continue;
      }
      continue;
    }

    if (currentType === "project") {
      if (line.length > 1) desc.push(line);
      continue;
    }

    // No open entry -> this line is the next entry's name/title
    if (isEntryNameLine(line)) {
      pendingName = line;
      continue;
    }
  }

  flushEntry();

  // --- Fallback: if no skills found, scan text for known skills ---
  if (content.skills.length === 0) {
    for (const skill of commonSkills) {
      const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`\\b${escaped}\\b`, "i").test(text)) {
        if (!content.skills.includes(skill)) {
          content.skills.push(skill);
        }
      }
    }
  }

  // --- Extract hard skills and soft skills from the full resume text ---
  const resumeText = [
    content.personalInfo?.fullName,
    content.personalInfo?.jobTitle,
    content.summary,
    ...(content.experience || []).map(
      (exp: any) => `${exp.title || ""} ${exp.company || ""} ${(exp.highlights || []).join(" ")}`,
    ),
    ...(content.skills || []),
    ...(content.projects || []).map(
      (proj: any) => `${proj.name || ""} ${(proj.highlights || []).join(" ")} ${(proj.technologies || []).join(" ")}`,
    ),
    ...(content.certifications || []).map((cert: any) => cert.name || ""),
    ...(content.achievements || []).map((ach: any) => `${ach.title || ""} ${ach.description || ""}`),
  ]
    .filter(Boolean)
    .join("\n");

  const { hardSkills, softSkills } = extractHardSoftSkills(resumeText);
  content.hardSkills = hardSkills;
  content.softSkills = softSkills;
  content.keywords = extractKeywordsFromText(resumeText, hardSkills, softSkills);

  return content;
};
