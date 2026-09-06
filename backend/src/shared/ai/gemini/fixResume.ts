import { genAI, GEMINI_MODEL } from "../../config/gemini";
import { ResumeContent } from "../../types";
import { throwIfQuotaError } from "./geminiErrors";

// Senior-grade prompt: preserve-as-is, add missing in place, human-like
const FIX_PROMPT = `You are a senior human resume writer. Fix ONLY items listed in failedChecks / failed. Keep EVERYTHING else exactly as-is. Human tone, concise, no AI buzzwords. No placeholder like "Your Name". Return ONLY JSON.

RULES:
- NO truncation, NO deletion, NO rewrite of existing good content. Content stays as-is; add missing items IN PLACE where they fit by meaning and context.
- personalInfo: Keep exact fullName. jobTitle: only update if failedChecks contains Job title mismatch else keep. NEVER "Your Name". Empty -> "".
- JD EXACTNESS (critical): hardSkills, softSkills, keywords must be used EXACTLY as written in failed / failedChecks (e.g. JD has "scalable" -> write "scalable", NEVER "scalability"). Do NOT canonicalize, rename, or change form.
- skills.hardSkills: ADD every missing hardSkill with EXACT JD spelling. No duplicates, no phrase. Keep all existing entries untouched.
- skills.softSkills: ADD missing softSkills with EXACT JD spelling. No generic fillers. Keep existing untouched.
- DISTRIBUTION (meaning-aware):
  * hardSkills -> must appear in 2 places: 1) skills.hardSkills list 2) woven into existing experience/project bullets where contextually relevant, understanding place and meaning. Use strong PAST-TENSE action verb + varied plausible measurable (mix of %, $, time, count, scale, revenue, conversion, latency, users, team size — NOT only %). e.g. "Built REST API with Node.js reducing latency 30%", "Generated $50K revenue", "Led team of 5". Do NOT stuff all skills in one bullet. Do NOT delete existing bullets to make room.
  * softSkills -> NEVER as standalone list dump. Weave naturally into summary (1-2 words) and existing experience bullets e.g. "Led team of 5", "Collaborated cross-functionally". Keep human.
- summary: If summary failed OR softSkills missing, rewrite 30-60 word natural summary from experience+skills, varied sentences, weave 1-2 softSkills. Else keep as-is.
- experience.responsibilities (EXISTING roles): Keep all existing bullets as-is. Only ADD missing actionVerbs/measurable or weave hard/soft skills into them by meaning. All action verbs in PAST TENSE (Developed NOT Develop). Short, active, no buzzword stuffing.
- MISSING SECTIONS (create if absent): If a whole section is missing from resumeContent, create it correctly yourself. If it is bullet-related (experience or project), add exactly 3 bullets with past-tense action verbs + varied measurables. If it is education, add one American university entry (e.g. Stanford University, Bachelor's in Computer Science).
- searchability/formatting: If failedChecks contains Email/Phone/Address missing -> keep personalInfo.contact as is if already present else leave ""; Date formatting failed -> normalize dates to "MMM YYYY - MMM YYYY/Present". Layout/font/table/image checks are TEMPLATE fixes -> IGNORE, do not try to fix via text.
- Preserve JSON structure, no markdown.

INPUT: {resumeContentCompact, failed:{hardSkills:[],softSkills:[],summary:bool,actionVerbs:bool,measurable:bool}, failedChecks:[{category,label,detail}], suggestions:[]}
Use failed + failedChecks + suggestions together. failedChecks is authoritative for what to fix.
OUTPUT: ResumeContent {personalInfo, summary, experience:[{role,company,startDate,endDate,responsibilities:[]}], education:[{degree,field,education_level,startDate,endDate}], skills:{hardSkills:[],softSkills:[]}, projects:[{name,description[],startDate,endDate}]}`;

type LegacyFailed = {
  hardSkills: string[];
  softSkills: string[];
  summary: boolean;
  actionVerbs: boolean;
  measurable: boolean;
};

type FailedCheck = {
  category: string;
  label: string;
  detail: string;
  status?: string;
};

function compactResume(resumeContent: ResumeContent): ResumeContent {
  // Send full parsed resume as-is (no truncation)
  return resumeContent;
}

export const fixResumeContent = async (
  resumeContent: ResumeContent,
  failed: LegacyFailed,
  suggestions: string[] = [],
  failedChecks: FailedCheck[] = [],
): Promise<ResumeContent> => {
  // Backward compat: if 3rd arg is array of checks (old caller misuse), handle
  if (
    Array.isArray(suggestions) &&
    suggestions.length > 0 &&
    typeof suggestions[0] === "object"
  ) {
    failedChecks = suggestions as any;
    suggestions = [];
  }

  const compact = compactResume(resumeContent);
  // Send everything as-is, no truncation
  const trimmedSuggestions = suggestions || [];
  const trimmedFailed: LegacyFailed = {
    hardSkills: failed?.hardSkills || [],
    softSkills: failed?.softSkills || [],
    summary: !!failed?.summary,
    actionVerbs: !!failed?.actionVerbs,
    measurable: !!failed?.measurable,
  };
  const trimmedChecks = (failedChecks || []).map((c) => ({
    category: c.category,
    label: c.label,
    detail: c.detail,
  }));

  const input = JSON.stringify({
    resumeContentCompact: compact,
    failed: trimmedFailed,
    failedChecks: trimmedChecks,
    suggestions: trimmedSuggestions,
  });

  const prompt = `${FIX_PROMPT}\n\nINPUT:\n${input}\n\nReturn ONLY fixed ResumeContent JSON.`;

  let result;
  try {
    result = await genAI.models.generateContent({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
  } catch (error) {
    throwIfQuotaError(error);
    throw error;
  }

  const text = result.text ?? "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Invalid AI response");

  const raw = JSON.parse(jsonMatch[0]);

  const str = (v: any) =>
    typeof v === "string" ? v : v == null ? "" : String(v);
  const arr = (v: any) => (Array.isArray(v) ? v : []);
  const isPlaceholder = (v: string) => /your name|john doe|example/i.test(v);
  const keepName = (rawName: any, orig: any) => {
    const r = str(rawName);
    if (!r || isPlaceholder(r)) return str(orig);
    return r;
  };

  // Merge: prefer AI output but fallback to original for empty
  const fixed: ResumeContent = {
    personalInfo: {
      fullName: keepName(
        raw?.personalInfo?.fullName,
        resumeContent.personalInfo?.fullName,
      ),
      jobTitle: str(
        raw?.personalInfo?.jobTitle ?? resumeContent.personalInfo?.jobTitle,
      ),
      contact:
        raw?.personalInfo?.contact ?? resumeContent.personalInfo?.contact,
    },
    summary: str(raw?.summary ?? resumeContent.summary),
    experience: arr(
      raw?.experience?.length ? raw.experience : resumeContent.experience,
    ).map((e: any) => ({
      role: str(e?.role),
      company: str(e?.company),
      startDate: str(e?.startDate),
      endDate: str(e?.endDate),
      responsibilities: arr(e?.responsibilities)
        .map((r: any) => str(r))
        .filter(Boolean),
    })),
    education: arr(
      raw?.education?.length ? raw.education : resumeContent.education,
    ).map((e: any) => ({
      degree: str(e?.degree),
      field: str(e?.field),
      education_level: str(e?.education_level),
      startDate: str(e?.startDate),
      endDate: str(e?.endDate),
    })),
    skills: {
      hardSkills: arr(
        raw?.skills?.hardSkills?.length
          ? raw.skills.hardSkills
          : resumeContent.skills?.hardSkills,
      )
        .map((s: any) => str(s))
        .filter(Boolean),
      softSkills: arr(
        raw?.skills?.softSkills?.length
          ? raw.skills.softSkills
          : resumeContent.skills?.softSkills,
      )
        .map((s: any) => str(s))
        .filter(Boolean),
    },
    projects: arr(raw?.projects ?? (resumeContent as any)?.projects).map(
      (p: any) => ({
        name: str(p?.name),
        description: arr(p?.description).map((d: any) => str(d)),
        startDate: str(p?.startDate),
        endDate: str(p?.endDate),
      }),
    ),
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
  } as ResumeContent;

  // Ensure hardSkills missing are at least present in skills list (safety net if AI missed)
  const missingHard = trimmedFailed.hardSkills.filter(
    (s) =>
      !fixed.skills.hardSkills.some((x) => x.toLowerCase() === s.toLowerCase()),
  );
  if (missingHard.length)
    fixed.skills.hardSkills = [...fixed.skills.hardSkills, ...missingHard];
  const missingSoft = trimmedFailed.softSkills.filter(
    (s) =>
      !fixed.skills.softSkills.some((x) => x.toLowerCase() === s.toLowerCase()),
  );
  if (missingSoft.length)
    fixed.skills.softSkills = [...fixed.skills.softSkills, ...missingSoft];

  return fixed;
};
