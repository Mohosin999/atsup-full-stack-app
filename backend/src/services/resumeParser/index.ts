import fs from "fs";
import path from "path";
import { ResumeContent } from "../../types";

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

    console.log("data \n", data);

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

const parseTextToResume = (text: string): ResumeContent => {
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
  };

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex =
    /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9-]+/gi;
  const urlRegex = /https?:\/\/[^\s]+/g;

  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);
  const linkedinMatch = text.match(linkedinRegex);
  const urlMatch = text.match(urlRegex);

  if (emailMatch) content.personalInfo.email = emailMatch[0];
  if (phoneMatch) content.personalInfo.whatsapp = phoneMatch[0];
  if (linkedinMatch) content.personalInfo.linkedIn = linkedinMatch[0];
  if (urlMatch) content.personalInfo.socialLinks = { portfolio: urlMatch[0] };

  const nameCandidate = lines[0];
  if (
    nameCandidate &&
    !nameCandidate.includes("@") &&
    nameCandidate.length < 50
  ) {
    content.personalInfo.fullName = nameCandidate;
  }

  const sections: { [key: string]: { regex: RegExp; order: number } } = {
    summary: {
      regex: /^(summary|objective|profile|professional\s+summary|about\s+me)/i,
      order: 0,
    },
    experience: {
      regex:
        /^(experience|work\s+experience|employment|professional\s+experience|work\s+history)/i,
      order: 1,
    },
    education: {
      regex: /^(education|academic|qualification|academic\s+background)/i,
      order: 2,
    },
    skills: {
      regex:
        /^(skills|technical\s+skills|core\s+competencies|technologies|tech\s+stack)/i,
      order: 3,
    },
    projects: {
      regex:
        /^(projects|portfolio|key\s+projects|personal\s+projects|side\s+projects)/i,
      order: 4,
    },
  };

  const sectionPositions: { [key: string]: number } = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const [section, { regex }] of Object.entries(sections)) {
      if (regex.test(line)) {
        sectionPositions[section] = i;
        break;
      }
    }
  }

  const sortedSections = Object.entries(sectionPositions)
    .sort(([, a], [, b]) => a - b)
    .map(([section]) => section);

  for (let i = 0; i < sortedSections.length; i++) {
    const currentSection = sortedSections[i];
    const nextSection = sortedSections[i + 1];
    const startIdx = sectionPositions[currentSection] + 1;
    const endIdx = nextSection ? sectionPositions[nextSection] : lines.length;

    const sectionContent = lines.slice(startIdx, endIdx).join(" ");

    switch (currentSection) {
      case "summary":
        if (sectionContent.length > 10) {
          content.summary = sectionContent;
        }
        break;
      case "skills":
        const skillMatches = sectionContent
          .split(/[,;|•\n]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 1 && s.length < 40);
        if (skillMatches.length > 0) {
          content.skills = [...new Set(skillMatches)];
        }
        break;
      case "experience":
        content.experience = parseExperienceSection(
          lines.slice(startIdx, endIdx),
        );
        break;
      case "education":
        content.education = parseEducationSection(
          lines.slice(startIdx, endIdx),
        );
        break;
      case "projects":
        content.projects = parseProjectsSection(lines.slice(startIdx, endIdx));
        break;
    }
  }

  if (content.skills.length === 0) {
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
    ];

    for (const skill of commonSkills) {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        if (!content.skills.includes(skill)) {
          content.skills.push(skill);
        }
      }
    }
  }

  return content;
};

const parseExperienceSection = (
  lines: string[],
): ResumeContent["experience"] => {
  const experiences: ResumeContent["experience"] = [];
  // More flexible regex patterns for different resume formats
  const expPatterns = [
    // Pattern: "Job Title @ Company (Date)" or "Job Title at Company (Date)"
    /^(.+?)\s*(?:@|at)\s*(.+?)\s*[\(\(]([^)]+)[\)\)]/i,
    // Pattern: "Job Title, Company (Date)"
    /^(.+?),\s*(.+?)\s*[\(\(]([^)]+)[\)\)]/i,
    // Pattern: "Job Title - Company (Date)"
    /^(.+?)\s*[-–]\s*(.+?)\s*[\(\(]([^)]+)[\)\)]/i,
    // Pattern: "Job Title | Company | Date"
    /^(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)/i,
  ];
  const dateRegex =
    /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{1,2}\/\d{4}|\d{4}\s*[-–]\s*(?:present|current|\d{1,2}\/\d{4}|\d{4})/gi;
  const companyKeywords =
    /\b(Inc|LLC|Ltd|Corp|Co|Company|Technologies|Solutions|Systems|Labs|Studio|Group|Organization)\b/i;
  const titleKeywords =
    /\b(Engineer|Developer|Manager|Director|Lead|Senior|Junior|Intern|Analyst|Consultant|Architect|Designer|Specialist|Coordinator|Administrator|Programmer|Scientist|Researcher|Officer|Executive|Head|Chief|VP|President|Founder|Owner|Administrator|Assistant|Associate|Trainee|Apprentice)\b/i;

  let currentExp: Partial<ResumeContent["experience"][0]> = {};
  let descriptionLines: string[] = [];
  let inExperienceSection = false;

  console.log("[parseExperienceSection] Input lines:", lines);

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    const dateMatch = trimmed.match(dateRegex);

    // Try multiple patterns to match experience entry
    let expMatch = null;
    for (const pattern of expPatterns) {
      expMatch = trimmed.match(pattern);
      if (expMatch) break;
    }

    // If no pattern matched, try heuristic approach
    if (!expMatch) {
      // Check if this line looks like a job title + company
      const hasTitleKeyword = titleKeywords.test(trimmed);
      const hasCompanyKeyword = companyKeywords.test(trimmed);
      const hasDate = dateMatch !== null;

      // If line has title keyword and (company keyword or date), treat as new experience
      if (hasTitleKeyword && (hasCompanyKeyword || hasDate)) {
        // Try to split by common delimiters
        const parts = trimmed
          .split(/[,|–-]/)
          .map((p) => p.trim())
          .filter((p) => p);
        if (parts.length >= 2) {
          // First part is likely title, second is likely company
          currentExp = {
            title: parts[0],
            company: parts[1],
            description: "",
          };
          descriptionLines = [];
          inExperienceSection = true;

          // Look for date in remaining parts or next line
          if (parts.length >= 3 && dateRegex.test(parts[2])) {
            const dateStr = parts[2];
            if (
              dateStr.toLowerCase().includes("present") ||
              dateStr.toLowerCase().includes("current")
            ) {
              currentExp.startDate = dateStr.replace(/[-–].*$/i, "").trim();
              currentExp.current = true;
            } else if (dateStr.includes("-") || dateStr.includes("–")) {
              const [start, end] = dateStr.split(/-|–/);
              currentExp.startDate = start?.trim();
              currentExp.endDate = end?.trim();
            }
          }
          continue;
        }
      }
    }

    if (expMatch) {
      // Save previous experience if exists
      if (currentExp.title && (currentExp.company || currentExp.description)) {
        currentExp.description = descriptionLines.join(" ");
        if (currentExp.title)
          experiences.push(currentExp as ResumeContent["experience"][0]);
      }

      // Create new experience entry
      currentExp = {
        title: expMatch[1]?.trim(),
        company: expMatch[2]?.trim(),
        description: "",
      };
      descriptionLines = [];
      inExperienceSection = true;

      // Extract date if present
      if (dateMatch) {
        const dateStr = dateMatch[0];
        if (
          dateStr.toLowerCase().includes("present") ||
          dateStr.toLowerCase().includes("current")
        ) {
          currentExp.startDate = dateStr.replace(/[-–].*$/i, "").trim();
          currentExp.current = true;
        } else if (dateStr.includes("-") || dateStr.includes("–")) {
          const [start, end] = dateStr.split(/-|–/);
          currentExp.startDate = start?.trim();
          currentExp.endDate = end?.trim();
        } else {
          currentExp.startDate = dateStr;
        }
      }
    } else if (dateMatch && !currentExp.startDate) {
      // Date on separate line
      const dateStr = dateMatch[0];
      if (
        dateStr.toLowerCase().includes("present") ||
        dateStr.toLowerCase().includes("current")
      ) {
        currentExp.startDate = dateStr.replace(/[-–].*$/i, "").trim();
        currentExp.current = true;
      } else if (dateStr.includes("-") || dateStr.includes("–")) {
        const [start, end] = dateStr.split(/-|–/);
        currentExp.startDate = start?.trim();
        currentExp.endDate = end?.trim();
      } else {
        currentExp.startDate = dateStr;
      }
    } else if (trimmed.length > 20 && inExperienceSection) {
      // Description line (must be substantial enough to be description)
      descriptionLines.push(trimmed);
    }
  }

  // Don't forget the last experience
  if (currentExp.title && (currentExp.company || currentExp.description)) {
    currentExp.description = descriptionLines.join(" ");
    experiences.push(currentExp as ResumeContent["experience"][0]);
  }

  console.log("[parseExperienceSection] Parsed experiences:", experiences);
  return experiences;
};

const parseEducationSection = (lines: string[]): ResumeContent["education"] => {
  const education: ResumeContent["education"] = [];
  const eduRegex = /^(.+?)(?:,|\s+at\s+)(.+?)(?:\(|（)([^)]+)\)?/i;
  const degreeKeywords =
    /bachelor|master|phd|doctorate|bs|ba|ms|ma|b\.sc|m\.sc|b\.e|m\.e|b\.tech|m\.tech/i;
  const dateRegex =
    /\d{4}\s*[-–]\s*\d{4}|\d{4}\s*[-–]\s*(?:present|current)|\d{4}/gi;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 5) continue;

    const eduMatch = trimmed.match(eduRegex);
    const hasDegree = degreeKeywords.test(trimmed);
    const dateMatch = trimmed.match(dateRegex);

    if (eduMatch || hasDegree) {
      const eduEntry: ResumeContent["education"][0] = {
        institution: "",
        degree: "",
      };

      if (eduMatch) {
        eduEntry.degree = eduMatch[1]?.trim() || trimmed;
        eduEntry.institution = eduMatch[2]?.trim() || "";
      } else {
        eduEntry.degree = trimmed;
      }

      if (dateMatch) {
        eduEntry.date = dateMatch[0];
      }

      if (eduEntry.degree || eduEntry.institution) {
        education.push(eduEntry);
      }
    }
  }

  return education;
};

const parseProjectsSection = (lines: string[]): ResumeContent["projects"] => {
  const projects: ResumeContent["projects"] = [];
  const techRegex =
    /(?:tech|technology|technologies|built\s+with|used|stack)[:\s]+(.+)/i;
  const linkRegex = /(https?:\/\/[^\s]+|github\.com\/[^\s]+)/gi;

  let currentProject: Partial<ResumeContent["projects"][0]> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (
      trimmed.length < 50 &&
      !trimmed.includes(":") &&
      (trimmed.includes("-") || trimmed.includes("•"))
    ) {
      if (currentProject.name && currentProject.description) {
        projects.push(currentProject as ResumeContent["projects"][0]);
      }
      currentProject = {
        name: trimmed.replace(/^[-•]\s*/, ""),
        description: "",
        technologies: [],
      };
    } else if (trimmed.length > 10) {
      const techMatch = trimmed.match(techRegex);
      if (techMatch) {
        currentProject.technologies = techMatch[1]
          .split(/[,;|]/)
          .map((t) => t.trim())
          .filter((t) => t);
      } else if (currentProject.description) {
        currentProject.description += " " + trimmed;
      } else {
        currentProject.description = trimmed;
      }

      const linkMatch = trimmed.match(linkRegex);
      if (linkMatch) {
        currentProject.links = { live: linkMatch[0] };
      }
    }
  }

  if (currentProject.name) {
    projects.push(currentProject as ResumeContent["projects"][0]);
  }

  return projects;
};
