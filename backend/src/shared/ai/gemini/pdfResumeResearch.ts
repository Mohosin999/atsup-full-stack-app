import { GEMINI_MODEL, generateContentWithFailover } from "../../config/gemini";
import { normalizeHardSkills } from "../../skills/skillNormalizer";
import { throwIfQuotaError } from "./geminiErrors";
import {
  hashBuffer,
  buildResumeKey,
  getCache,
  setCache,
} from "../cache/aiCache";

export interface AIResumeResearchResult {
  personal_info: {
    fullName: string;
    jobTitle: string;
    contact: {
      address: string;
      email: string;
      phone: string;
    };
  };
  summary: string;
  experience: Array<{
    role: string;
    company: string;
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
    startDate: string;
    endDate: string;
  }>;
  yearsOfExperience: string;
  measurableResults: string[];
  actionVerbs: string[];
  wordCount: string;
  educationSection: boolean;
  experienceSection: boolean;
  workHistory: boolean;
  dateFormatting: boolean;
  layout: {
    isSingleColumn: boolean;
    hasTables: boolean;
    hasImages: boolean;
    hasIcons: boolean;
    hasMultiColumn: boolean;
  };
  fontCheck: {
    isStandardFont: boolean;
    fontName: string;
    isReadableSize: boolean;
  };
}

export const RESUME_RESEARCH_TEMPLATE: AIResumeResearchResult = {
  personal_info: {
    fullName: "",
    jobTitle: "",
    contact: {
      address: "",
      email: "",
      phone: "",
    },
  },
  summary: "",
  experience: [],
  education: [],
  skills: {
    hardSkills: [],
    softSkills: [],
  },
  projects: [],
  yearsOfExperience: "",
  measurableResults: [],
  actionVerbs: [],
  wordCount: "",
  educationSection: false,
  experienceSection: false,
  workHistory: false,
  dateFormatting: false,
  layout: {
    isSingleColumn: false,
    hasTables: false,
    hasImages: false,
    hasIcons: false,
    hasMultiColumn: false,
  },
  fontCheck: {
    isStandardFont: false,
    fontName: "",
    isReadableSize: false,
  },
};

const RESEARCH_PROMPT = `
You are an expert AI resume researcher. Your task is to analyze the provided resume VERY carefully and extract all information from it accurately.

RESEARCH THE FOLLOWING DETAILS:
1. Personal info (full name, job title, contact: address, email, phone)
2. Professional summary
3. Work experience (role, company, startDate, endDate, responsibilities as bullet points)
4. Education (degree, field of study, education level (e.g. "Bachelor's", "Master's", "PhD", "Associate's"), startDate, endDate)
5. Skills:
   - hardSkills: technical skills and keywords
   - softSkills: ONLY non-technical skills (communication, leadership, teamwork, problem-solving, time management, adaptability, etc.) - DO NOT include any technical skills or technologies
6. Projects (name, description as bullet points, startDate, endDate)
7. yearsOfExperience: total years of professional work experience (e.g. "5 years" or "5+ years")
8. measurableResults: array of strings — IDENTIFY ALL measurable impact/results from BOTH the entire experience section AND the entire projects section. Extract every distinct measurable impact/result phrase, including numbers, percentages, time saved, monetary values, scale/volume metrics, efficiency improvements, performance improvements, reductions, increases, growth, etc. Do not return full bullet points. If one bullet contains multiple measurable impacts, extract all of them separately. Do not limit the count. Return [] if no measurable impact is found.
9. actionVerbs: array of strings — EXTRACT EVERY DISTINCT action verb appearing at the START of bullets across BOTH the entire experience section AND the entire projects section. Only extract the first meaningful action verb of each bullet. Collect all unique starting action verbs from both sections. Return [] if none.
10. wordCount: total number of words in the resume.
11. educationSection: true if an education section exists.
12. experienceSection: true if an experience/work section exists.
13. workHistory: true if there is AT LEAST ONE work experience entry.
14. dateFormatting: true if dates use "MM/YY or MM/YYYY or Month YYYY" format (e.g. 03/19, 03/2019, Mar 2019 or March 2019). false otherwise.
15. layout: analyze the given PDF very carefully and answer the following questions correctly:
    - isSingleColumn: true if the resume uses a single column layout
    - hasTables: true if tables are used in the layout
    - hasImages: true if images/photos are present
    - hasIcons: true if icons/graphics are present
    - hasMultiColumn: true if the resume uses a multi-column layout
16. fontCheck: analyze the given PDF very carefully and answer the following questions correctly. I must need these answer correctly:
    - isStandardFont: true if a standard/ATS-friendly font is used (Arial, Calibri, Times New Roman, Helvetica, Georgia, Verdana, etc.)
    - fontName: the primary font name of resume text.
    - isReadableSize: true if the font size is readable (typically 10-12pt body text)

STRICT RULES:
- NO field is required. If a piece of information is NOT present in the resume, set it to empty: "" for strings, [] for arrays, false for booleans.
- Do NOT invent or hallucinate information. Only extract what is actually present in the resume.
- CANONICALIZE hardSkills: for each distinct technology/framework/library/tool, return EXACTLY ONE canonical keyword. Merge all spelling variants of the same skill into a single name (e.g. "React", "React.js", "ReactJS", "react js" → "React"; "Node.js", "NodeJS", "Node" → "Node.js"; "JavaScript", "JS" → "JavaScript"; "Next.js", "NextJS" → "Next.js"). NEVER list two different spellings of the same skill as separate entries.
- Each hardSkills entry must be a single skill name - never phrases like "X and Y" or "X, Y".
- Return ONLY valid JSON matching the exact structure below. No markdown, no extra text, no explanations.

JSON STRUCTURE:
{
  "personal_info": {
    "fullName": "",
    "jobTitle": "",
    "contact": {
      "address": "",
      "email": "",
      "phone": ""
    }
  },
  "summary": "",
  "experience": [
    {
      "role": "",
      "company": "",
      "startDate": "",
      "endDate": "",
      "responsibilities": [""]
    }
  ],
  "education": [
    {
      "degree": "",
      "field": "",
      "education_level": "",
      "startDate": "",
      "endDate": ""
    }
  ],
  "skills": {
    "hardSkills": [""],
    "softSkills": [""]
  },
  "projects": [
    {
      "name": "",
      "description": [""],
      "startDate": "",
      "endDate": ""
    }
  ],
  "yearsOfExperience": "",
  "measurableResults": [],
  "actionVerbs": [],
  "wordCount": "",
  "educationSection": false,
  "experienceSection": false,
  "workHistory": false,
  "dateFormatting": false,
  "layout": {
    "isSingleColumn": false,
    "hasTables": false,
    "hasImages": false,
    "hasIcons": false,
    "hasMultiColumn": false
  },
  "fontCheck": {
    "isStandardFont": false,
    "fontName": "",
    "isReadableSize": false
  }
}
`;

// const RESEARCH_PROMPT = `
// You are an expert AI resume researcher. Your task is to analyze the provided resume VERY carefully and extract all information from it accurately.

// RESEARCH THE FOLLOWING DETAILS:
// 1. Personal info (full name, job title, contact: address, email, phone)
// 2. Professional summary
// 3. Work experience (role, company, startDate, endDate, responsibilities as bullet points)
// 4. Education (degree, field of study, education level (e.g. "Bachelor's", "Master's", "PhD", "Associate's"), startDate, endDate)
// 5. Skills:
//    - hardSkills: ONLY technical skills and keywords (programming languages, frameworks, libraries, databases, cloud platforms, DevOps tools, software, technologies, APIs, etc.) - return ONLY the keyword names
//    - softSkills: ONLY non-technical interpersonal and professional skills (communication, leadership, teamwork, problem-solving, time management, adaptability, etc.) - DO NOT include any technical skills or technologies
// 6. Projects (name, description as bullet points, startDate, endDate)
//  7. yearsOfExperience: total years of professional work experience (e.g. "5 years" or "5+ years")
//  8. measurableResults: array of strings — every experience bullet that contains a measurable impacts. More focus on experience section and less focus on projects section. Return [] if none.
//  9. actionVerbs: array of strings — the distinct strong action verbs found at the start of experience bullets (e.g. "led", "built", "optimized", "launched"). ore focus on experience section and less focus on projects section. Return [] if none.
//  10. wordCount: total number of words in the resume.
// 10. educationSection: true if an education section exists.
// 11. experienceSection: true if an experience/work section exists.
// 12. workHistory: true if there is AT LEAST ONE work experience entry.
// 13. dateFormatting: true if dates use "MM/YY or MM/YYYY or Month YYYY" format (e.g. 03/19, 03/2019, Mar 2019 or March 2019). false otherwise.
// 14. layout: analyze the given PDF very carefully and answer the following questions correctly:
//     - isSingleColumn: true if the resume uses a single column layout
//     - hasTables: true if tables are used in the layout
//     - hasImages: true if images/photos are present
//     - hasIcons: true if icons/graphics are present
//     - hasMultiColumn: true if the resume uses a multi-column layout
// 16. fontCheck: analyze the given PDF very carefully and answer the following questions correctly. I must need these answer correctly:
//     - isStandardFont: true if a standard/ATS-friendly font is used (Arial, Calibri, Times New Roman, Helvetica, Georgia, Verdana, etc.)
//     - fontName: the primary font name of resume text.
//     - isReadableSize: true if the font size is readable (typically 10-12pt body text)

// STRICT RULES:
// - NO field is required. If a piece of information is NOT present in the resume, set it to empty: "" for strings, [] for arrays, false for booleans.
// - Do NOT invent or hallucinate information. Only extract what is actually present in the resume.
// - CANONICALIZE hardSkills: for each distinct technology/framework/library/tool, return EXACTLY ONE canonical keyword. Merge all spelling variants of the same skill into a single name (e.g. "React", "React.js", "ReactJS", "react js" → "React"; "Node.js", "NodeJS", "Node" → "Node.js"; "JavaScript", "JS" → "JavaScript"; "Next.js", "NextJS" → "Next.js"). NEVER list two different spellings of the same skill as separate entries.
// - Each hardSkills entry must be a single skill name - never phrases like "X and Y" or "X, Y".
// - Return ONLY valid JSON matching the exact structure below. No markdown, no extra text, no explanations.

// JSON STRUCTURE:
// {
//   "personal_info": {
//     "fullName": "",
//     "jobTitle": "",
//     "contact": {
//       "address": "",
//       "email": "",
//       "phone": "",
//     }
//   },
//   "summary": "",
//   "experience": [
//     {
//       "role": "",
//       "company": "",
//       "startDate": "",
//       "endDate": "",
//       "responsibilities": [""]
//     }
//   ],
//   "education": [
//     {
//       "degree": "",
//       "field": "",
//       "education_level": "",
//       "startDate": "",
//       "endDate": "",
//     }
//   ],
//   "skills": {
//     "hardSkills": [""],
//     "softSkills": [""]
//   },
//   "projects": [
//     {
//       "name": "",
//       "description": [""],
//       "startDate": "",
//       "endDate": "",
//     }
//   ]
//   ],
//   "yearsOfExperience": "",
//   "measurableResults": [],
//   "actionVerbs": [],
//   "wordCount": "",
//   "educationSection": false,
//   "experienceSection": false,
//   "workHistory": false,
//   "dateFormatting": false,
//   "layout": {
//     "isSingleColumn": false,
//     "hasTables": false,
//     "hasImages": false,
//     "hasIcons": false,
//     "hasMultiColumn": false
//   },
//   "fontCheck": {
//     "isStandardFont": false,
//     "fontName": "",
//     "isReadableSize": false,
//   }
// }
// `;

/** --------------------------------------------------------------
 * Resume research result
 ----------------------------------------------------------------*/
export const researchResume = async (
  resumeText: string,
  fileBase64?: string,
  mimeType?: string,
  fileBuffer?: Buffer,
): Promise<AIResumeResearchResult> => {
  // 1. Cache check (PDF buffer thakle)
  if (fileBuffer && fileBase64 && mimeType) {
    const hash = hashBuffer(fileBuffer);
    const key = buildResumeKey(hash);
    const cached = await getCache<AIResumeResearchResult>(key);
    if (cached) {
      console.log(`[cache] resume hit ${key}`);
      return cached;
    }
  }

  const parts: any[] = [];

  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        mimeType,
        data: fileBase64,
      },
    });
    // PDF pathale parsed.text double jabe tai skip — sudhu PDF + prompt pathano hocche (~900 token save)
    parts.push({ text: RESEARCH_PROMPT });
  } else {
    const textPart = `${RESEARCH_PROMPT}

FULL RESUME CONTENT:
${resumeText}

Research this resume thoroughly and return ONLY the valid JSON structure specified above.
`;
    parts.push({ text: textPart });
  }

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
    const normalized = normalizeResearchResult(raw);

    // 2. Cache set
    if (fileBuffer) {
      const hash = hashBuffer(fileBuffer);
      const key = buildResumeKey(hash);
      await setCache(key, normalized);
      console.log(`[cache] resume set ${key}`);
    }

    return normalized;
  } catch (error) {
    console.error("Resume research error:", error);
    throwIfQuotaError(error);
    throw new Error("Failed to research resume");
  }
};

/** --------------------------------------------------------------
 * Normalize resume research result
 ----------------------------------------------------------------*/
const normalizeResearchResult = (raw: any): AIResumeResearchResult => {
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

  return {
    personal_info: {
      fullName: str(raw?.personal_info?.fullName),
      jobTitle: str(raw?.personal_info?.jobTitle),
      contact: {
        address: str(raw?.personal_info?.contact?.address),
        email: str(raw?.personal_info?.contact?.email),
        phone: str(raw?.personal_info?.contact?.phone),
      },
    },
    summary: str(raw?.summary),
    experience: arr(raw?.experience).map((exp: any) => ({
      role: str(exp?.role),
      company: str(exp?.company),
      startDate: str(exp?.startDate),
      endDate: str(exp?.endDate),
      responsibilities: arr(exp?.responsibilities).map((v: any) => str(v)),
    })),
    education: arr(raw?.education).map((edu: any) => ({
      degree: str(edu?.degree),
      field: str(edu?.field),
      education_level: str(edu?.education_level),
      startDate: str(edu?.startDate),
      endDate: str(edu?.endDate),
    })),
    skills: {
      // hardSkills: normalizeHardSkills(
      //   arr(raw?.skills?.hardSkills).map((v: any) => str(v)),
      // ),
      hardSkills: arr(raw?.skills?.hardSkills).map((v: any) => str(v)),
      softSkills: arr(raw?.skills?.softSkills).map((v: any) => str(v)),
    },
    projects: arr(raw?.projects).map((proj: any) => ({
      name: str(proj?.name),
      description: arr(proj?.description).map((v: any) => str(v)),
      startDate: str(proj?.startDate),
      endDate: str(proj?.endDate),
    })),
    yearsOfExperience: str(raw?.yearsOfExperience),
    measurableResults: arr(raw?.measurableResults).map((v: any) => str(v)),
    actionVerbs: arr(raw?.actionVerbs).map((v: any) => str(v)),
    wordCount: str(raw?.wordCount),
    educationSection: bool(raw?.educationSection),
    experienceSection: bool(raw?.experienceSection),
    workHistory: bool(raw?.workHistory),
    dateFormatting: bool(raw?.dateFormatting),
    layout: {
      isSingleColumn: bool(raw?.layout?.isSingleColumn, true),
      hasTables: bool(raw?.layout?.hasTables),
      hasImages: bool(raw?.layout?.hasImages),
      hasIcons: bool(raw?.layout?.hasIcons),
      hasMultiColumn: bool(raw?.layout?.hasMultiColumn),
    },
    fontCheck: {
      isStandardFont: bool(raw?.fontCheck?.isStandardFont, true),
      fontName: str(raw?.fontCheck?.fontName),
      isReadableSize: bool(raw?.fontCheck?.isReadableSize, true),
    },
  };
};

// - Remove filler words around keywords. From "pure react app, react.js and react js", extract ONLY "React" - never "react app", "pure react", or a duplicate "react.js".
