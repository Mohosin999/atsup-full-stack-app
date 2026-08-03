import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env";
import { ResumeContent } from "../../types";

export interface AIResumeResearchResult {
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
    hasMixedFonts: boolean;
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
      links: {
        linkedin: "",
        portfolio: "",
        github: "",
      },
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
  certifications: [],
  yearsOfExperience: "",
  measurableResults: [],
  resumeTone: "bad",
  wordCount: "",
  educationSection: false,
  experienceSection: false,
  workHistory: false,
  dateFormatting: false,
  layout: {
    isSingleColumn: true,
    hasTables: false,
    hasImages: false,
    hasIcons: false,
    hasMultiColumn: false,
  },
  fontCheck: {
    isStandardFont: true,
    fontName: "",
    isReadableSize: true,
    hasMixedFonts: false,
  },
};

const RESEARCH_PROMPT = `
You are an expert AI resume researcher. Your task is to analyze the provided resume VERY carefully and extract all information from it accurately.

RESEARCH THE FOLLOWING DETAILS:
1. Personal info (full name, job title, contact: address, email, phone, LinkedIn link, portfolio link, GitHub link)
2. Professional summary
3. Work experience (role, company, location, startDate, endDate, responsibilities as bullet points)
4. Education (degree, field of study, education level, startDate, endDate)
5. Skills:
   - hardSkills: ONLY keywords (technologies, programming languages, tools, frameworks) - just the keyword names
   - softSkills: ONLY soft skills (communication, leadership, teamwork, etc.) - keep them separate from hard skills
6. Projects (name, description as bullet points, link)
7. Certifications (name, issuer, date, link)
8. yearsOfExperience: total years of professional work experience (e.g. "5 years" or "5+ years")
9. measurableResults: ONLY the measurable IMPACTS/achievements from work experience that demonstrate a business or technical outcome (e.g. "reduced load time by 40%", "increased sales by 30%", "saved 10 hours/week", "improved performance by 2x", "cut costs by $50k"). These must show a quantified result tied to time, money, percentage, speed, scale, or performance. Do NOT include role scope statements or non-impact items (e.g. "led a team of 5 engineers", "managed 3 projects", "worked with 10 clients") unless they show a measurable outcome. If a result has no number, percentage, money, time or scale value, do NOT include it.
10. resumeTone: assess the overall tone and quality of the resume writing. Use one of: "good", "bad", "professional", "weak".
11. wordCount: total number of words in the resume.
12. educationSection: true if an education section exists.
13. experienceSection: true if an experience/work section exists.
14. workHistory: true if there is AT LEAST ONE work experience entry.
15. dateFormatting: true if dates use "MM/YY or MM/YYYY or Month YYYY" format (e.g. 03/19, 03/2019, Mar 2019 or March 2019). false otherwise.
16. layout: analyze the given PDF very carefully and answer the following questions correctly:
    - isSingleColumn: true if the resume uses a single column layout
    - hasTables: true if tables are used in the layout
    - hasImages: true if images/photos are present
    - hasIcons: true if icons/graphics are present
    - hasMultiColumn: true if the resume uses a multi-column layout
17. fontCheck: analyze the given PDF very carefully and answer the following questions correctly:
    - isStandardFont: true if a standard/ATS-friendly font is used (Arial, Calibri, Times New Roman, Helvetica, Georgia, Verdana, etc.)
    - fontName: the primary font name
    - isReadableSize: true if the font size is readable (typically 10-12pt body text)

STRICT RULES:
- NO field is required. If a piece of information is NOT present in the resume, set it to empty: "" for strings, [] for arrays, false for booleans.
- Do NOT invent or hallucinate information. Only extract what is actually present in the resume.
- hardSkills must ONLY contain pure keyword names, never descriptions or phrases.
- measurableResults must ONLY contain quantified IMPACT results with numbers/percentages/money/time/scale. Exclude role-scope statements that have no measurable outcome.
- Return ONLY valid JSON matching the exact structure below. No markdown, no extra text, no explanations.

JSON STRUCTURE:
{
  "personal_info": {
    "fullName": "",
    "jobTitle": "",
    "contact": {
      "address": "",
      "email": "",
      "phone": "",
      "links": {
        "linkedin": "",
        "portfolio": "",
        "github": ""
      }
    }
  },
  "summary": "",
  "experience": [
    {
      "role": "",
      "company": "",
      "location": "",
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
      "link": ""
    }
  ],
  "certifications": [
    {
      "name": "",
      "issuer": "",
      "date": "",
      "link": ""
    }
  ],
  "yearsOfExperience": "",
  "measurableResults": [""],
  "resumeTone": "bad",
  "wordCount": "",
  "educationSection": true,
  "experienceSection": true,
  "workHistory": true,
  "dateFormatting": true,
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
  }
}
`;

const genAI = new GoogleGenerativeAI(env.geminiApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// AI Career Assistant System Prompt - Credit-Based Usage
// COMMENTED OUT: Unused, AI limit tai ei function gulo active na
// const AI_CAREER_ASSISTANT_PROMPT = `
// You are a professional AI Career Assistant with a strict real-time credit-based usage system.
// ...

// COMMENTED OUT: Unused interfaces (AI limit tai ei function gulo active na)
// export interface AtsAnalysisResult {
//   overallScore: number;
//   sectionScores: {
//     summary: { score: number; feedback: string };
//     experience: { score: number; feedback: string };
//     projects: { score: number; feedback: string };
//     skills: { score: number; feedback: string };
//     contactInfo: { score: number; feedback: string; hasContactInfo: boolean };
//   };
//   spellingGrammar: {
//     score: number;
//     errors: Array<{ type: string; message: string; suggestion: string }>;
//   };
//   atsFriendliness: number;
//   suggestions: string[];
// }

// export interface JobMatchResult {
//   matchPercentage: number;
//   breakdown: {
//     keywords: { score: number; matched: string[]; missing: string[] };
//     skills: { score: number; matched: string[]; missing: string[] };
//     education: { score: number; details: string };
//     experience: { score: number; yearsMatched: number; yearsRequired?: number };
//   };
//   missingSkills: string[];
//   missingKeywords: string[];
//   suggestions: string[];
// }

// export interface AISectionSuggestion {
//   section: string;
//   content: string;
//   tips: string[];
// }

// COMMENTED OUT: analyzeAtsScore - AI limit tai, ATS score rule-based engine diye hoy
// export const analyzeAtsScore = async (
//   resume: ResumeContent,
//   jobDescription?: string,
// ): Promise<AtsAnalysisResult> => {
//   const resumeText = JSON.stringify(resume, null, 2);
//   const jobDescriptionSection = jobDescription
//     ? `\n\nTarget Job Description:\n${jobDescription}\n\nUse the job description to provide more targeted feedback on keyword matching, skills relevance, and experience alignment.`
//     : "";
//   const prompt = `Analyze this resume for ATS...`;
//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
//     const jsonMatch = text.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) throw new Error("Invalid response format from AI");
//     const analysis = JSON.parse(jsonMatch[0]);
//     return analysis;
//   } catch (error) {
//     console.error("ATS Analysis error:", error);
//     throw new Error("Failed to analyze resume ATS score");
//   }
// };

// COMMENTED OUT: analyzeJobMatch - AI limit tai
// export const analyzeJobMatch = async (
//   resume: ResumeContent,
//   jobDescription: string,
//   jobTitle?: string,
//   company?: string,
// ): Promise<JobMatchResult> => {
//   const resumeText = JSON.stringify(resume, null, 2);
//   const prompt = `Analyze how well this resume matches...`;
//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
//     const jsonMatch = text.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) throw new Error("Invalid response format from AI");
//     const analysis = JSON.parse(jsonMatch[0]);
//     return analysis;
//   } catch (error) {
//     console.error("Job Match Analysis error:", error);
//     throw new Error("Failed to analyze job match");
//   }
// };

// COMMENTED OUT: generateSectionContent - AI limit tai
// export const generateSectionContent = async (
//   section: string,
//   context?: {
//     jobTitle?: string;
//     industry?: string;
//     experience?: string;
//     skills?: string[];
//   },
// ): Promise<AISectionSuggestion> => {
//   const contextStr = context ? `Context: ...` : "";
//   let prompt: string;
//   if (section === "Work Experience") {
//     prompt = `Generate exactly 3 bullet points...`;
//   } else if (section === "Project Description") {
//     prompt = `Generate exactly 3 bullet points...`;
//   } else if (section === "Technical Skills") {
//     prompt = `Generate exactly 10 technical skills...`;
//   } else {
//     prompt = `Generate a professional ${section}...`;
//   }
//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const text = response.text();
//     const jsonMatch = text.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) throw new Error("Invalid response format from AI");
//     const suggestion = JSON.parse(jsonMatch[0]);
//     return suggestion;
//   } catch (error) {
//     console.error("Section Generation error:", error);
//     throw new Error("Failed to generate section content");
//   }
// };

export const researchResume = async (
  resumeText: string,
  fileBase64?: string,
  mimeType?: string,
): Promise<AIResumeResearchResult> => {
  const parts: any[] = [];

  const textPart = `${RESEARCH_PROMPT}

FULL RESUME CONTENT:
${resumeText}

Research this resume thoroughly and return ONLY the valid JSON structure specified above.
`;

  if (fileBase64 && mimeType) {
    parts.push({
      inlineData: {
        mimeType,
        data: fileBase64,
      },
    });
  }
  parts.push({ text: textPart });

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
    });
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }

    const raw = JSON.parse(jsonMatch[0]);
    return normalizeResearchResult(raw);
  } catch (error) {
    console.error("Resume research error:", error);
    throw new Error("Failed to research resume");
  }
};

const normalizeResearchResult = (raw: any): AIResumeResearchResult => {
  const str = (v: any, fallback = "") =>
    typeof v === "string"
      ? v
      : v === null || v === undefined
        ? fallback
        : String(v);
  const bool = (v: any, fallback = false) =>
    typeof v === "boolean" ? v : v === undefined || v === null ? fallback : !!v;
  const arr = (v: any) => (Array.isArray(v) ? v : []);

  return {
    personal_info: {
      fullName: str(raw?.personal_info?.fullName),
      jobTitle: str(raw?.personal_info?.jobTitle),
      contact: {
        address: str(raw?.personal_info?.contact?.address),
        email: str(raw?.personal_info?.contact?.email),
        phone: str(raw?.personal_info?.contact?.phone),
        links: {
          linkedin: str(raw?.personal_info?.contact?.links?.linkedin),
          portfolio: str(raw?.personal_info?.contact?.links?.portfolio),
          github: str(raw?.personal_info?.contact?.links?.github),
        },
      },
    },
    summary: str(raw?.summary),
    experience: arr(raw?.experience).map((exp: any) => ({
      role: str(exp?.role),
      company: str(exp?.company),
      location: str(exp?.location),
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
      hardSkills: arr(raw?.skills?.hardSkills).map((v: any) => str(v)),
      softSkills: arr(raw?.skills?.softSkills).map((v: any) => str(v)),
    },
    projects: arr(raw?.projects).map((proj: any) => ({
      name: str(proj?.name),
      description: arr(proj?.description).map((v: any) => str(v)),
      link: str(proj?.link),
    })),
    certifications: arr(raw?.certifications).map((cert: any) => ({
      name: str(cert?.name),
      issuer: str(cert?.issuer),
      date: str(cert?.date),
      link: str(cert?.link),
    })),
    yearsOfExperience: str(raw?.yearsOfExperience),
    measurableResults: arr(raw?.measurableResults).map((v: any) => str(v)),
    resumeTone: str(raw?.resumeTone, "bad"),
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
      hasMixedFonts: bool(raw?.fontCheck?.hasMixedFonts),
    },
  };
};

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
   - hardSkills: ONLY technical/keyword skills required (programming languages, tools, frameworks, technologies). Just the keyword names, no descriptions.
   - softSkills: ONLY soft/interpersonal skills (communication, leadership, teamwork, etc.). Keep separate from hardSkills.
4. yearsOfExperience: Total years of experience required (e.g. "3-5 years", "5+ years", "2 years")

STRICT RULES:
- NO field is required. If a piece of information is NOT present in the job description, set it to empty: "" for strings, [] for arrays.
- Do NOT invent or hallucinate information. Only extract what is actually present.
- hardSkills must ONLY contain pure keyword names, never descriptions or phrases.
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

export const researchJobDescription = async (
  jdText: string,
): Promise<AIJobResearchResult> => {
  const textPart = `${JD_RESEARCH_PROMPT}

FULL JOB DESCRIPTION:
${jdText}

Research this job description thoroughly and return ONLY the valid JSON structure specified above.
`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: textPart }] }],
    });
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }

    const raw = JSON.parse(jsonMatch[0]);
    return normalizeJDResearchResult(raw);
  } catch (error) {
    console.error("Job description research error:", error);
    throw new Error("Failed to research job description");
  }
};

const normalizeJDResearchResult = (raw: any): AIJobResearchResult => {
  const str = (v: any, fallback = "") =>
    typeof v === "string"
      ? v
      : v === null || v === undefined
        ? fallback
        : String(v);
  const arr = (v: any) => (Array.isArray(v) ? v : []);

  return {
    jobTitle: str(raw?.jobTitle),
    education: {
      degree: str(raw?.education?.degree),
      field: str(raw?.education?.field),
      education_level: str(raw?.education?.education_level),
    },
    skills: {
      hardSkills: arr(raw?.skills?.hardSkills).map((v: any) => str(v)),
      softSkills: arr(raw?.skills?.softSkills).map((v: any) => str(v)),
    },
    yearsOfExperience: str(raw?.yearsOfExperience),
  };
};

export const improveResumeSection = async (
  section: string,
  currentContent: string,
): Promise<{ improved: string; changes: string[] }> => {
  const prompt = `
Improve the following resume ${section} section to be more impactful and ATS-friendly.

Current Content:
${currentContent}

Provide suggestions to make it:
- More action-oriented
- Include quantified achievements
- Use strong action verbs
- Include relevant keywords
- Be concise and professional

Provide your response in the following JSON format ONLY:
{
  "improved": string (the improved content),
  "changes": [string] (list of improvements made)
}

Return ONLY valid JSON.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid response format from AI");
    }

    const improvement = JSON.parse(jsonMatch[0]);
    return improvement;
  } catch (error) {
    console.error("Section Improvement error:", error);
    throw new Error("Failed to improve section content");
  }
};
