import { genAI, GEMINI_MODEL } from "../../config/gemini";
import { normalizeHardSkills } from "../../skills/skillNormalizer";
import { throwIfQuotaError } from "./geminiErrors";
import { hashJD, buildJDKey, getCache, setCache } from "../cache/aiCache";

export interface AIJobResearchResult {
  jobTitle: string;
  education: {
    degree: string;
    field: string;
    education_level: string;
  };
  skills: {
    hardSkills: string[];
    softSkills: string[];
  };
  yearsOfExperience: string;
}

const JD_RESEARCH_PROMPT = `
You are an expert AI job description researcher. Analyze the provided job description VERY carefully and extract all information accurately.

RESEARCH THE FOLLOWING DETAILS:
1. jobTitle: The job title/position being offered (e.g. "Senior Software Engineer", "Data Analyst")
2. education: Required education background:
   - degree: The specific degree name (e.g. "Bachelor of Science", "Bachelor's")
   - field: The field of study (e.g. "Computer Science", "Engineering")
   - education_level: The education level (e.g. "Bachelor's", "Master's", "PhD", "Associate's")
3. skills:
   - hardSkills: ONLY technical skills and keywords (programming languages, frameworks, libraries, databases, cloud platforms, DevOps tools, software, technologies, APIs, etc.) - return ONLY the keyword names
   - softSkills: ONLY non-technical interpersonal and professional skills (communication, leadership, teamwork, problem-solving, time management, adaptability, etc.) - DO NOT include any technical skills or technologies
4. yearsOfExperience: Total years of experience required (e.g. "3-5 years", "5+ years", "2 years")

STRICT RULES:
- NO field is required. If a piece of information is NOT present in the job description, set it to empty: "" for strings, [] for arrays.
- Do NOT invent or hallucinate information. Only extract what is actually present.
- hardSkills must ONLY contain pure keyword names, never descriptions or phrases.
- CANONICALIZE hardSkills: for each distinct technology/framework/library/tool, return EXACTLY ONE canonical keyword. Merge all spelling variants of the same skill into a single name (e.g. "React", "React.js", "ReactJS", "react js" → "React"; "Node.js", "NodeJS", "Node" → "Node.js"; "JavaScript", "JS" → "JavaScript"; "Next.js", "NextJS" → "Next.js"). NEVER list two different spellings of the same skill as separate entries.
- Each hardSkills entry must be a single skill name - never phrases like "X and Y" or "X, Y".
- Return ONLY valid JSON matching the exact structure below. No markdown, no extra text, no explanations.

JSON STRUCTURE:
{
  "jobTitle": "",
  "education": {
    "degree": "",
    "field": "",
    "education_level": ""
  },
  "skills": {
    "hardSkills": [""],
    "softSkills": [""]
  },
  "yearsOfExperience": ""
}
`;

/** --------------------------------------------------------------
 * Job description result
 ----------------------------------------------------------------*/
export const researchJobDescription = async (
  jdText: string,
): Promise<AIJobResearchResult> => {
  const hash = hashJD(jdText);
  const key = buildJDKey(hash);
  const cached = await getCache<AIJobResearchResult>(key);
  if (cached) {
    console.log(`[cache] jd hit ${key}`);
    return cached;
  }

  const textPart = `${JD_RESEARCH_PROMPT}

FULL JOB DESCRIPTION:
${jdText}

Research this job description thoroughly and return ONLY the valid JSON structure specified above.
`;

  try {
    const result = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: textPart }] }],
    });
    const text = result.text ?? "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }

    const raw = JSON.parse(jsonMatch[0]);
    const normalized = normalizeJDResearchResult(raw);
    await setCache(key, normalized);
    console.log(`[cache] jd set ${key}`);
    return normalized;
  } catch (error) {
    console.error("Job description research error:", error);
    throwIfQuotaError(error);
    throw new Error("Failed to research job description");
  }
};

/** --------------------------------------------------------------
 * Normalize job description result
 ----------------------------------------------------------------*/
const normalizeJDResearchResult = (raw: any): AIJobResearchResult => {

  const str = (v: any, fallback = "") => {
    if (typeof v === "string") return v;
    if (v == null) return fallback;
    return String(v);
  };

  const arr = (v: any) => {
    if (Array.isArray(v)) return v;
    return [];
  };

  return {
    jobTitle: str(raw?.jobTitle),
    education: {
      degree: str(raw?.education?.degree),
      field: str(raw?.education?.field),
      education_level: str(raw?.education?.education_level),
    },
    skills: {
      // hardSkills: normalizeHardSkills(
      //   arr(raw?.skills?.hardSkills).map((v: any) => str(v)),
      // ),
      hardSkills: arr(raw?.skills?.hardSkills).map((v: any) => str(v)),
      softSkills: arr(raw?.skills?.softSkills).map((v: any) => str(v)),
    },
    yearsOfExperience: str(raw?.yearsOfExperience),
  };
};

// - Remove filler words around keywords. From "this is a pure react app, react.js and react js", extract ONLY "React" - never "react app", "pure react", or a duplicate "react.js".