import { GEMINI_MODEL, generateContentWithFailover } from "../../config/gemini";
import { throwIfQuotaError } from "./geminiErrors";
import { hashBuffer, buildResumeKey, getCache, setCache } from "../cache/aiCache";
import crypto from "crypto";

// Define the expected output structure for the rewritten resume
export interface RewrittenResume {
  personalInfo: {
    fullName?: string;
    jobTitle?: string;
    contact?: {
      email?: string;
      phone?: string;
      linkedIn?: string;
      address?: {
        city?: string;
        state?: string;
      };
      socialLinks?: {
        github?: string;
        portfolio?: string;
        website?: string;
      };
    };
  };
  summary?: string;
  experience: Array<{
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    highlights: string[];
    measurableImpacts?: string[];
  }>;
  projects?: Array<{
    name: string;
    highlights: string[];
    startDate?: string;
    endDate?: string;
    current?: boolean;
    links?: {
      live?: string;
      caseStudy?: string;
    };
    technologies?: string[];
  }>;
  achievements?: Array<{
    title: string;
    date: string;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    areaOfStudy: string;
    startDate: string;
    endDate: string;
    gpa: string;
  }>;
  skills: string[];
  skillCategories?: Array<{
    name: string;
    skills: string[];
  }>;
  hardSkills?: string[];
  softSkills?: string[];
  keywords?: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
  sectionTitles?: {
    summary?: string;
    experience?: string;
    skills?: string;
    education?: string;
    projects?: string;
    achievements?: string;
    certifications?: string;
  };
  sectionOrder?: Array<"personalInfo" | "summary" | "experience" | "skills" | "education" | "projects" | "achievements" | "certifications">;
  layout?: {
    isSingleColumn?: boolean;
    hasTables?: boolean;
    hasImages?: boolean;
    hasIcons?: boolean;
    hasMultiColumn?: boolean;
  };
  fontCheck?: {
    isStandardFont?: boolean;
    fontName?: string;
    isReadableSize?: boolean;
    hasMixedFonts?: boolean;
  };
}

const REWRITE_RESUME_PROMPT = `
You are an expert resume writer. Your task is to rewrite the provided resume based on the job description to make it ATS-optimized and tailored to the job.

INPUTS:
1. ORIGINAL RESUME TEXT: The text content of the user's resume
2. JOB DESCRIPTION: The target job description

INSTRUCTIONS:
- Rewrite the resume to better match the job description while keeping all information truthful
- Do NOT invent or hallucinate any experience, skills, or qualifications
- Only reword and reframe existing information to highlight relevance to the job description
- Use the exact same structure and sections as the original resume
- Output must be valid JSON matching the exact structure below
- Experience: 2-3 bullet points per role maximum
- Bullets: Start with strong action verbs + measurable impact (use numbers, dollar amounts, time saved, scale, rankings - NOT just percentages)
- Skills: Extract and prioritize relevant skills from the job description (max 10-12)
- Summary: 2-3 lines max, tailored to the job description requirements
- Never invent experience; only reword/reframe existing content
- Prioritize job description keywords for ATS optimization
- If information is missing in the original resume, leave the field blank or empty array
- Return ONLY valid JSON matching the structure below. No markdown, no extra text, no explanations.

JSON STRUCTURE:
{
  "personalInfo": {
    "fullName": "",
    "jobTitle": "",
    "contact": {
      "email": "",
      "phone": "",
      "linkedIn": "",
      "address": {
        "city": "",
        "state": ""
      },
      "socialLinks": {
        "github": "",
        "portfolio": "",
        "website": ""
      }
    }
  },
  "summary": "",
  "experience": [
    {
      "company": "",
      "title": "",
      "location": "",
      "startDate": "",
      "endDate": "",
      "current": false,
      "highlights": [""],
      "measurableImpacts": [""]
    }
  ],
  "projects": [
    {
      "name": "",
      "highlights": [""],
      "startDate": "",
      "endDate": "",
      "current": false,
      "links": {
        "live": "",
        "caseStudy": ""
      },
      "technologies": [""]
    }
  ],
  "achievements": [
    {
      "title": "",
      "date": "",
      "description": ""
    }
  ],
  "education": [
    {
      "institution": "",
      "degree": "",
      "areaOfStudy": "",
      "startDate": "",
      "endDate": "",
      "gpa": ""
    }
  ],
  "skills": [""],
  "skillCategories": [
    {
      "name": "",
      "skills": [""]
    }
  ],
  "hardSkills": [""],
  "softSkills": [""],
  "keywords": [""],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": ""
    }
  ],
  "sectionTitles": {
    "summary": "",
    "experience": "",
    "skills": "",
    "education": "",
    "projects": "",
    "achievements": "",
    "certifications": ""
  },
  "sectionOrder": ["personalInfo", "summary", "experience", "skills", "education", "projects", "achievements", "certifications"],
  "layout": {
    "isSingleColumn": true,
    "hasTables": false,
    "hasImages": false,
    "hasIcons": false,
    "hasMultiColumn": false
  },
  "fontCheck": {
    "isStandardFont": true,
    "fontName": "",
    "isReadableSize": true,
    "hasMixedFonts": false
  }
}

STRICT RULES:
- NO field is required. If a piece of information is NOT present or applicable, set it to empty: "" for strings, [] for arrays, false for booleans.
- Do NOT invent or hallucinate information. Only extract and reword what is actually present in the resume.
- hardSkills must ONLY contain pure technical keyword names (programming languages, frameworks, etc.)
- softSkills must ONLY contain non-technical interpersonal skills
- CANONICALIZE hardSkills: for each distinct technology/framework/library/tool, return EXACTLY ONE canonical keyword. Merge spelling variants.
- Each hardSkills/softSkills entry must be a single skill name - never phrases.
- The output must be valid JSON and nothing else.
`;

export const rewriteResumeWithAI = async (
  resumeText: string,
  jobDescription: string,
): Promise<RewrittenResume> => {
  // Create a cache key based on both inputs
  const hash = crypto.createHash("sha256")
    .update(resumeText + "||" + jobDescription)
    .digest("hex");
  const key = `rewrite_${hash}`;
  
  // Check cache
  const cached = await getCache<RewrittenResume>(key);
  if (cached) {
    console.log(`[cache] resume rewrite hit ${key}`);
    return cached;
  }

  const parts: any[] = [];

  const textPart = `${REWRITE_RESUME_PROMPT}

ORIGINAL RESUME TEXT:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Rewrite the resume based on the job description and return ONLY the valid JSON structure specified above.
`;

  parts.push({ text: textPart });

  try {
    const result = await generateContentWithFailover({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts }],
    });

    const text = result.text ?? "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }

    const raw = JSON.parse(jsonMatch[0]);
    const normalized = normalizeRewrittenResume(raw);

    // Cache the result
    await setCache(key, normalized);
    console.log(`[cache] resume rewrite set ${key}`);

    return normalized;
  } catch (error) {
    console.error("Resume rewrite error:", error);
    throwIfQuotaError(error);
    throw new Error("Failed to rewrite resume with AI");
  }
};

// Normalize the AI response to match our expected structure
const normalizeRewrittenResume = (raw: any): RewrittenResume => {
  const str = (v: any, fallback = "") => {
    if (typeof v === "string") return v;
    if (v == null) return fallback;
    return String(v);
  };

  const bool = (v: any, fallback = false) => {
    if (typeof v === "boolean") return v;
    if (v == null) return fallback;
    return Boolean(v);
  };

  const arr = (v: any) => {
    if (Array.isArray(v)) return v;
    return [];
  };

  const safeObject = (v: any) => {
    return v && typeof v === "object" ? v : {};
  };

  return {
    personalInfo: {
      fullName: str(raw?.personalInfo?.fullName),
      jobTitle: str(raw?.personalInfo?.jobTitle),
      contact: safeObject(raw?.personalInfo?.contact) ?? {
        email: str(raw?.personalInfo?.contact?.email),
        phone: str(raw?.personalInfo?.contact?.phone),
        linkedIn: str(raw?.personalInfo?.contact?.linkedIn),
        address: safeObject(raw?.personalInfo?.contact?.address) ?? {
          city: str(raw?.personalInfo?.contact?.address?.city),
          state: str(raw?.personalInfo?.contact?.address?.state),
        },
        socialLinks: safeObject(raw?.personalInfo?.contact?.socialLinks) ?? {
          github: str(raw?.personalInfo?.contact?.socialLinks?.github),
          portfolio: str(raw?.personalInfo?.contact?.socialLinks?.portfolio),
          website: str(raw?.personalInfo?.contact?.socialLinks?.website),
        },
      },
    },
    summary: str(raw?.summary),
    experience: arr(raw?.experience).map((exp: any) => ({
      company: str(exp?.company),
      title: str(exp?.title),
      location: str(exp?.location),
      startDate: str(exp?.startDate),
      endDate: str(exp?.endDate),
      current: bool(exp?.current),
      highlights: arr(exp?.highlights).map((v: any) => str(v)),
      measurableImpacts: arr(exp?.measurableImpacts).map((v: any) => str(v)),
    })),
    projects: arr(raw?.projects).map((proj: any) => ({
      name: str(proj?.name),
      highlights: arr(proj?.highlights).map((v: any) => str(v)),
      startDate: str(proj?.startDate),
      endDate: str(proj?.endDate),
      current: bool(proj?.current),
      links: safeObject(proj?.links) ?? {
        live: str(proj?.links?.live),
        caseStudy: str(proj?.links?.caseStudy),
      },
      technologies: arr(proj?.technologies).map((v: any) => str(v)),
    })),
    achievements: arr(raw?.achievements).map((ach: any) => ({
      title: str(ach?.title),
      date: str(ach?.date),
      description: str(ach?.description),
    })),
    education: arr(raw?.education).map((edu: any) => ({
      institution: str(edu?.institution),
      degree: str(edu?.degree),
      areaOfStudy: str(edu?.areaOfStudy),
      startDate: str(edu?.startDate),
      endDate: str(edu?.endDate),
      gpa: str(edu?.gpa),
    })),
    skills: arr(raw?.skills).map((v: any) => str(v)),
    skillCategories: arr(raw?.skillCategories).map((cat: any) => ({
      name: str(cat?.name),
      skills: arr(cat?.skills).map((v: any) => str(v)),
    })),
    hardSkills: arr(raw?.hardSkills).map((v: any) => str(v)),
    softSkills: arr(raw?.softSkills).map((v: any) => str(v)),
    keywords: arr(raw?.keywords).map((v: any) => str(v)),
    certifications: arr(raw?.certifications).map((cert: any) => ({
      name: str(cert?.name),
      issuer: str(cert?.issuer),
      date: str(cert?.date),
    })),
    sectionTitles: safeObject(raw?.sectionTitles) ?? {
      summary: str(raw?.sectionTitles?.summary),
      experience: str(raw?.sectionTitles?.experience),
      skills: str(raw?.sectionTitles?.skills),
      education: str(raw?.sectionTitles?.education),
      projects: str(raw?.sectionTitles?.projects),
      achievements: str(raw?.sectionTitles?.achievements),
      certifications: str(raw?.sectionTitles?.certifications),
    },
    sectionOrder: arr(raw?.sectionOrder).filter((k: string) =>
      ["summary", "experience", "skills", "education", "projects", "achievements", "certifications"].includes(k),
    ) as Array<"personalInfo" | "summary" | "experience" | "skills" | "education" | "projects" | "achievements" | "certifications">,
    layout: safeObject(raw?.layout) ?? {
      isSingleColumn: bool(raw?.layout?.isSingleColumn, true),
      hasTables: bool(raw?.layout?.hasTables),
      hasImages: bool(raw?.layout?.hasImages),
      hasIcons: bool(raw?.layout?.hasIcons),
      hasMultiColumn: bool(raw?.layout?.hasMultiColumn),
    },
    fontCheck: safeObject(raw?.fontCheck) ?? {
      isStandardFont: bool(raw?.fontCheck?.isStandardFont, true),
      fontName: str(raw?.fontCheck?.fontName),
      isReadableSize: bool(raw?.fontCheck?.isReadableSize, true),
      hasMixedFonts: bool(raw?.fontCheck?.hasMixedFonts),
    },
  };
};

// - Remove filler words around keywords. From "pure react app, react.js and react js", extract ONLY "React" - never "react app", "pure react", or a duplicate "react.js".