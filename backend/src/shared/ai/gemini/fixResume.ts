import { genAI, GEMINI_MODEL } from "../../config/gemini";
import { ResumeContent } from "../../types";

const FIX_PROMPT = `You are a human resume writer. Fix ONLY failed checks. Keep human tone, not AI tone. Touch only needed fields. No placeholder like "Your Name". Return ONLY JSON.

RULES:
- personalInfo: Keep exact fullName/jobTitle/contact. NEVER "Your Name". Empty -> "".
- skills: ADD missing ONLY to skills.{hardSkills,softSkills}. No generic "Continuous Learning". Keep human-like, concise.
- summary: If failed.summary, write 30-60 word human summary from experience/skills. Natural tone, varied sentence.
- experience.responsibilities: Max 3-4 bullets/role, strongest only. Start with PAST-TENSE verb (Developed NOT Develop). Measurable ONLY if plausible. Write like human wrote, not AI — short, active, no buzzword stuffing. Only rewrite bullets that need actionVerbs/measurable fix; keep good bullets unchanged.
- Preserve JSON, no markdown.

INPUT: {resumeContent, failed:{hardSkills:[], softSkills:[], summary:bool, actionVerbs:bool, measurable:bool}, suggestions:[]}
Use failed+suggestions together.
OUTPUT: ResumeContent {personalInfo, summary, experience:[{role,company,startDate,endDate,responsibilities:[]}], education:[{degree,field,education_level,startDate,endDate}], skills:{hardSkills:[],softSkills:[]}, projects:[{name,description[],startDate,endDate}]}`;

export const fixResumeContent = async (
  resumeContent: ResumeContent,
  failed: {
    hardSkills: string[];
    softSkills: string[];
    summary: boolean;
    actionVerbs: boolean;
    measurable: boolean;
  },
  suggestions: string[] = [],
): Promise<ResumeContent> => {
  const input = JSON.stringify({ resumeContent, failed, suggestions });
  const prompt = `${FIX_PROMPT}\n\nINPUT:\n${input}\n\nReturn ONLY fixed ResumeContent JSON.`;

  const result = await genAI.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });

  const text = result.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response");

  const raw = JSON.parse(jsonMatch[0]);

  const str = (v: any) => (typeof v === "string" ? v : v == null ? "" : String(v));
  const arr = (v: any) => (Array.isArray(v) ? v : []);
  const isPlaceholder = (v: string) => /your name|john doe|example/i.test(v);
  const keepName = (rawName: any, orig: any) => {
    const r = str(rawName);
    if (!r || isPlaceholder(r)) return str(orig);
    return r;
  };

  return {
    personalInfo: {
      fullName: keepName(raw?.personalInfo?.fullName, resumeContent.personalInfo?.fullName),
      jobTitle: str(raw?.personalInfo?.jobTitle ?? resumeContent.personalInfo?.jobTitle),
      contact: raw?.personalInfo?.contact ?? resumeContent.personalInfo?.contact,
    },
    summary: str(raw?.summary ?? resumeContent.summary),
    experience: arr(raw?.experience?.length ? raw.experience : resumeContent.experience).map((e: any) => ({
      role: str(e?.role),
      company: str(e?.company),
      startDate: str(e?.startDate),
      endDate: str(e?.endDate),
      responsibilities: arr(e?.responsibilities).map((r: any) => str(r)).filter(Boolean).slice(0, 4),
    })),
    education: arr(raw?.education?.length ? raw.education : resumeContent.education).map((e: any) => ({
      degree: str(e?.degree),
      field: str(e?.field),
      education_level: str(e?.education_level),
      startDate: str(e?.startDate),
      endDate: str(e?.endDate),
    })),
    skills: {
      hardSkills: arr(raw?.skills?.hardSkills?.length ? raw.skills.hardSkills : resumeContent.skills?.hardSkills).map((s: any) => str(s)).filter(Boolean),
      softSkills: arr(raw?.skills?.softSkills?.length ? raw.skills.softSkills : resumeContent.skills?.softSkills).map((s: any) => str(s)).filter(Boolean),
    },
    projects: arr(raw?.projects ?? (resumeContent as any)?.projects).map((p: any) => ({
      name: str(p?.name),
      description: arr(p?.description).map((d: any) => str(d)),
      startDate: str(p?.startDate),
      endDate: str(p?.endDate),
    })),
    yearsOfExperience: (resumeContent as any)?.yearsOfExperience,
    measurableResults: (resumeContent as any)?.measurableResults,
    actionVerbs: (resumeContent as any)?.actionVerbs,
    wordCount: (resumeContent as any)?.wordCount,
    educationSection: (resumeContent as any)?.educationSection,
    experienceSection: (resumeContent as any)?.experienceSection,
    workHistory: (resumeContent as any)?.workHistory,
    dateFormatting: (resumeContent as any)?.dateFormatting,
    layout: (resumeContent as any)?.layout,
    fontCheck: (resumeContent as any)?.fontCheck,
  };
};
