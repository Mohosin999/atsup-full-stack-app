// import { GEMINI_MODEL, generateContentWithFailover } from "../../config/gemini";
// import { throwIfQuotaError } from "./geminiErrors";
// import { getCache, setCache } from "../cache/aiCache";
// import crypto from "crypto";

// // Define the expected output structure for the rewritten resume
// export interface RewrittenResume {
//   personalInfo: {
//     fullName?: string;
//     jobTitle?: string;
//     contact?: {
//       email?: string;
//       phone?: string;
//       linkedIn?: string;
//       address?: {
//         city?: string;
//         state?: string;
//       };
//       socialLinks?: {
//         github?: string;
//         portfolio?: string;
//         website?: string;
//       };
//     };
//   };
//   summary?: string;
//   experience: Array<{
//     company: string;
//     title: string;
//     location?: string;
//     startDate: string;
//     endDate?: string;
//     current?: boolean;
//     highlights: string[];
//   }>;
//   projects?: Array<{
//     name: string;
//     highlights: string[];
//     startDate?: string;
//     endDate?: string;
//     current?: boolean;
//     links?: {
//       live?: string;
//       caseStudy?: string;
//     };
//   }>;
//   achievements?: Array<{
//     title: string;
//     date: string;
//     description: string;
//   }>;
//   education: Array<{
//     institution: string;
//     degree: string;
//     areaOfStudy: string;
//     startDate: string;
//     endDate: string;
//     gpa?: string;
//   }>;
//   skillCategories: Array<{
//     name: string;
//     skills: string[];
//   }>;
//   certifications?: Array<{
//     name: string;
//     issuer: string;
//     date: string;
//   }>;
//   sectionTitles?: {
//     summary?: string;
//     experience?: string;
//     skills?: string;
//     education?: string;
//     projects?: string;
//     achievements?: string;
//     certifications?: string;
//   };
//   sectionOrder?: Array<
//     | "personalInfo"
//     | "summary"
//     | "experience"
//     | "skills"
//     | "education"
//     | "projects"
//     | "achievements"
//     | "certifications"
//   >;
//   layout?: {
//     isSingleColumn?: boolean;
//     hasTables?: boolean;
//     hasImages?: boolean;
//     hasIcons?: boolean;
//     hasMultiColumn?: boolean;
//   };
//   fontCheck?: {
//     isStandardFont?: boolean;
//     fontName?: string;
//     isReadableSize?: boolean;
//     hasMixedFonts?: boolean;
//   };
// }

// const REWRITE_RESUME_PROMPT = `
// You are an expert resume writer. Your task is to rewrite the provided resume based on the job description to make it ATS-optimized and tailored to the job.

// INPUTS:
// 1. ORIGINAL RESUME TEXT: The text content of the user's resume
// 2. JOB DESCRIPTION: The target job description

// INSTRUCTIONS:
// - Rewrite the resume to better match the job description while keeping all information truthful
// - Do NOT invent or hallucinate any experience, skills, or qualifications
// - Only reword and reframe existing information to highlight relevance to the job description
// - Use the exact same structure and sections as the original resume
// - Output must be valid JSON matching the exact structure below
// - Experience & Projects: 3-4 bullet points per role/project maximum

// JOB TITLE RULE (STRICT):
// - personalInfo.jobTitle must be set to the TARGET role title as stated in the JOB DESCRIPTION (e.g. the exact or near-exact title the job posting is hiring for)
// - Do NOT keep the candidate's current/previous job title from the original resume in this field
// - This is the headline title shown at the top of the rewritten resume, so it must reflect the job the candidate is applying for, not their past role
// - If the job description does not clearly state a title, only then fall back to the candidate's most recent/current title from the original resume

// HIGHLIGHT / BULLET FORMAT RULE (STRICT - SINGLE LINE ONLY):
// - Every single item in "highlights" (for BOTH experience and projects) must be exactly ONE single line - one concise sentence
// - NEVER write a multi-sentence bullet, NEVER include a line break, and NEVER combine two separate thoughts into one highlight with a semicolon or "and then"
// - If there are two distinct points to make, they must be split into two separate highlight entries in the array - not merged into one long line
// - Keep each highlight short enough to realistically render as a single line on a resume (roughly one sentence, not a paragraph)

// SUMMARY RULES (STRICT):
// - Summary must be 3 lines max, tailored to the job description requirements
// - Summary is a QUALITATIVE headline of who the candidate is and their top strengths/fit for the role
// - Summary must NEVER contain numbers, percentages, dollar amounts, or any quantified metric
// - Do NOT move metrics from experience bullets into the summary
// - Summary should read like a positioning statement, e.g. "Full Stack Engineer specializing in X and Y, with a track record of shipping scalable, high-performance applications" — NOT "...with a proven record of driving 25% improvements..."

// BULLET / HIGHLIGHT RULES (STRICT - MIXED IMPACT REQUIRED, APPLIES TO BOTH EXPERIENCE AND PROJECTS):
// - Each bullet should start with a strong action verb
// - DO NOT put a percentage (or any number) in every single bullet. This looks fabricated and repetitive.
// - This rule applies EQUALLY to "experience" highlights AND "projects" highlights - projects must NOT all be percentage-driven either
// - Within each role/project, MIX the type of impact across bullets:
//   - Some bullets: quantified impact (numbers, dollar amounts, time saved, scale, rankings, counts) - ONLY if genuinely inferable from the original resume
//   - Some bullets: qualitative impact (ownership, quality, architecture decisions, cross-team collaboration, mentorship, reliability, code quality, technical leadership) with NO number attached
// - As a hard cap: at most HALF of the bullets for a given role/project may contain a percentage. The rest must be either non-percentage metrics (counts, time, scale, dollar) or purely qualitative.
// - Vary WHICH type of metric is used across different roles/projects too - do not use the same metric style (e.g. always "%") throughout the entire resume
// - NEVER fabricate a specific number/percentage that is not supported by the original resume. If the original bullet had no metric, it is completely fine to keep it qualitative and just reword/reframe it toward the job description - do not force a number onto it.
// - MINIMUM MEASURABLE IMPACT COUNT (STRICT): Across the "experience" and "projects" sections COMBINED, there must be AT LEAST 5 highlights total that (a) start with a strong action verb AND (b) contain a genuine quantifiable result (a number, %, dollar amount, time saved, scale, count, or ranking) that is truthfully supported by the original resume. Look carefully through the original resume for any countable facts that may not have been phrased as a metric originally (e.g. team size, number of features shipped, number of releases, users served, requests handled, bugs fixed) and surface them as real metrics where truthfully applicable, in order to reach this minimum. Do NOT fabricate a number to hit this count - only surface metrics that are genuinely true based on the original resume.

// SKILLS RULES (STRICT):
// - Build EXACTLY 2 entries in skillCategories ONLY: "Technical Skills" (all hard/technical skills) and "Soft Skills" (all interpersonal skills)
// - Do NOT create Frontend/Backend/Database/Tools sub-categories
// - Do NOT output flat "skills", "hardSkills", "softSkills", or "keywords" - skillCategories is the single source of truth
// - TECHNICAL SKILLS include: programming languages, frameworks, libraries, databases, cloud platforms, tools, and METHODOLOGIES/PRACTICES such as Agile, Kanban, TDD, CI/CD, DevOps, Debugging, Testing, Unit Testing - these are technical/professional practices, NOT soft skills, and must go into "Technical Skills"
// - SOFT SKILLS are genuine interpersonal/behavioral traits, for example (illustrative only): Communication, Leadership, Teamwork, Collaboration, Adaptability, Time Management, Critical Thinking, Problem-Solving, Conflict Resolution, Mentoring, Stakeholder Management, Presentation Skills, Negotiation, Emotional Intelligence, Decision Making
// - CANONICALIZE Technical Skills: for each distinct technology/framework/library/tool, return EXACTLY ONE canonical keyword. Merge spelling variants (React/React.js -> React, Node/Node.js -> Node.js)
// - Each skillCategories.skills entry must be a single skill name - never phrases like "React and Node" or comma lists
// - Deduplicate case-insensitively within each category and across categories (a skill cannot appear in both)

// SKILL GROUNDING RULE (STRICT - NO INVENTED SKILLS, APPLIES MAINLY TO TECHNICAL SKILLS):
// - "Technical Skills" is not a mandatory checklist to fill in. Every technical skill you output MUST come from one of exactly two sources:
//   1. It is explicitly written in the ORIGINAL RESUME TEXT, OR
//   2. It is explicitly mentioned/required in the JOB DESCRIPTION AND is genuinely supported by something the candidate actually did, as described in the original resume
// - The example words listed above for "Technical Skills" (e.g. Agile, Scrum, Debugging) are ONLY there to teach you the DIFFERENCE between a technical skill and a soft skill. They are NOT a list of skills to insert. NEVER add any of these example words to Technical Skills unless that exact word or a clear paraphrase of it is actually present in the original resume or the job description.
// - Before including any technical skill in the final output, silently verify: "Does this exact skill (or an unambiguous paraphrase of it) appear in the original resume text OR the job description text?" If the answer is no for both, DO NOT include it.
// - (See the separate SOFT SKILLS SOURCING RULE below - soft skills follow a different, more inclusive rule than technical skills.)

// SOFT SKILLS SOURCING RULE (STRICT - UNION OF RESUME + JOB DESCRIPTION, MANDATORY):
// - The final "Soft Skills" list MUST be the UNION of exactly two groups - include ALL of both, do not drop either:
//   1. Every genuine soft/interpersonal skill explicitly stated anywhere in the ORIGINAL RESUME TEXT. Never drop a soft skill just because the rewritten resume no longer emphasizes it elsewhere - if it was listed in the original resume's skills section, it must appear in the output.
//   2. Every soft/interpersonal skill that the JOB DESCRIPTION requires or implies - either DIRECTLY (e.g. job description literally says "strong communication skills" or "excellent leadership abilities") OR INDIRECTLY through a described responsibility or expectation (e.g. "will work closely with cross-functional teams" implies Collaboration/Teamwork; "will mentor junior engineers" implies Mentoring; "must manage competing priorities and deadlines" implies Time Management; "will present findings to stakeholders" implies Communication/Presentation Skills)
// - Unlike Technical Skills, a soft skill required or implied by the job description does NOT need to be separately proven through a specific action in the original resume to be included. Listing a job-required soft skill is standard, expected resume practice for ATS matching - include it as long as it is genuinely required or implied by THIS job description's actual text.
// - The only thing that is still forbidden: do NOT invent a soft skill that has zero basis in either the original resume OR the job description (direct or indirect). Every soft skill must trace back to at least one of these two sources.
// - If, after checking both sources this way, there are genuinely zero soft skills identified, return "Soft Skills" with an empty skills array.

// ATS KEYWORD COVERAGE (STRICT - DO NOT MISS KEYWORDS):
// - Extract every hard/technical skill keyword AND every genuine soft-skill keyword mentioned in the JOB DESCRIPTION
// - Cross-check each extracted keyword against the ORIGINAL RESUME: if the candidate's resume shows they have used, worked with, or demonstrated that skill (even implicitly, e.g. through a tool, task, or responsibility described), that keyword MUST be included in the correct skillCategories bucket, in the JD's canonical wording where possible
// - Do not silently drop a JD keyword that is genuinely supported by the resume content just because the original resume phrased it differently - reword to match the JD's terminology
// - Never add a keyword that has zero support anywhere in the original resume or job description - that would be fabrication

// SECTION TITLE RULES (STRICT):
// - sectionTitles.skills must default to plain "Skills" unless the ORIGINAL resume literally used a different custom heading for that section
// - Do NOT invent compound titles like "Technical Skills & Competencies", "Core Competencies", "Skills & Expertise" etc. unless that exact custom title already existed in the original resume
// - The same rule applies to all other sectionTitles: default to the simple standard name (Summary, Experience, Education, Projects, Achievements, Certifications) unless the original resume used a different custom title

// - Never invent experience; only reword/reframe existing content
// - Prioritize job description keywords for ATS optimization
// - If information is missing in the original resume, leave the field blank or empty array
// - Return ONLY valid JSON matching the structure below. No markdown, no extra text, no explanations.

// JSON STRUCTURE:
// {
//   "personalInfo": {
//     "fullName": "",
//     "jobTitle": "",
//     "contact": {
//       "email": "",
//       "phone": "",
//       "linkedIn": "",
//       "address": {
//         "city": "",
//         "state": ""
//       },
//       "socialLinks": {
//         "github": "",
//         "portfolio": "",
//         "website": ""
//       }
//     }
//   },
//   "summary": "",
//   "experience": [
//     {
//       "company": "",
//       "title": "",
//       "location": "",
//       "startDate": "",
//       "endDate": "",
//       "current": false,
//       "highlights": [""],
//     }
//   ],
//   "projects": [
//     {
//       "name": "",
//       "highlights": [""],
//       "startDate": "",
//       "endDate": "",
//       "current": false,
//       "links": {
//         "live": "",
//         "caseStudy": ""
//       },
//     }
//   ],
//   "achievements": [
//     {
//       "title": "",
//       "date": "",
//       "description": ""
//     }
//   ],
//   "education": [
//     {
//       "institution": "",
//       "degree": "",
//       "areaOfStudy": "",
//       "startDate": "",
//       "endDate": "",
//       "gpa": ""
//     }
//   ],
//   "skillCategories": [
//     { "name": "Technical Skills", "skills": [""] },
//     { "name": "Soft Skills", "skills": [""] }
//   ],
//   "certifications": [
//     {
//       "name": "",
//       "issuer": "",
//       "date": ""
//     }
//   ],
//   "sectionTitles": {
//     "summary": "",
//     "experience": "",
//     "skills": "",
//     "education": "",
//     "projects": "",
//     "achievements": "",
//     "certifications": ""
//   },
//   "sectionOrder": ["personalInfo", "summary", "experience", "skills", "education", "projects", "achievements", "certifications"],
//   "layout": {
//     "isSingleColumn": true,
//     "hasTables": false,
//     "hasImages": false,
//     "hasIcons": false,
//     "hasMultiColumn": false
//   },
//   "fontCheck": {
//     "isStandardFont": true,
//     "fontName": "",
//     "isReadableSize": true,
//     "hasMixedFonts": false
//   }
// }

// STRICT RULES:
// - NO field is required. If a piece of information is NOT present or applicable, set it to empty: "" for strings, [] for arrays, false for booleans.
// - Do NOT invent or hallucinate information. Only extract and reword what is actually present in the resume.
// - skillCategories MUST contain exactly 2 entries with name === "Technical Skills" and name === "Soft Skills". Never use Frontend/Backend/Database/Tools etc. If no soft skills exist, return second entry with empty skills array.
// - Do NOT output "skills", "hardSkills", "softSkills", or "keywords" - they are deprecated. All skills must live only inside skillCategories.
// - The output must be valid JSON and nothing else.
// `;

// // ---------------------------------------------------------------------------
// // SKILL AUDIT PASS
// // Skill matching is a semantic task (canonicalized names, indirect JD phrasing),
// // which plain regex/substring matching cannot reliably verify - it either
// // rejects valid skills that were legitimately reworded, or lets fabricated
// // ones slip through. Instead, we run a focused second AI pass whose ONLY job
// // is to audit the draft skill list against the two source documents and
// // correct it (add missing genuine skills, remove unsupported ones).
// // ---------------------------------------------------------------------------

// const SKILL_AUDIT_PROMPT = `
// You are auditing a resume's skill list for accuracy against two source documents: the candidate's ORIGINAL RESUME and the TARGET JOB DESCRIPTION.

// You will be given a DRAFT skill list (already split into Technical Skills and Soft Skills). Correct it using these rules:

// TECHNICAL SKILLS RULES:
// - Keep a technical skill ONLY if it is explicitly present in the ORIGINAL RESUME, OR explicitly required in the JOB DESCRIPTION AND genuinely supported by something the candidate did in the ORIGINAL RESUME.
// - REMOVE any technical skill from the draft that fails this check (no basis in either source).
// - ADD any technical skill that IS genuinely present in the original resume or genuinely supported+required as above, but is MISSING from the draft list. This commonly happens due to wording/canonicalization differences - e.g. resume says "Node" and job description says "Node.js": the final list should include "Node.js". Another example: resume mentions "REST APIs" and job description says "RESTful services" - these are the same skill, include it once, canonicalized.
// - Canonicalize to exactly one clean name per technology (merge spelling variants like React/React.js -> React).
// - Never invent a technical skill with zero basis in either source.

// SOFT SKILLS RULES:
// - Keep every soft skill that is explicitly stated in the ORIGINAL RESUME's own skills list or text.
// - Keep every soft skill required or implied by the JOB DESCRIPTION - directly (explicitly named, e.g. "strong communication skills") or indirectly (implied by a described responsibility, e.g. "mentor junior engineers" implies Mentoring, "collaborate across teams" implies Teamwork/Collaboration, "manage multiple deadlines" implies Time Management, "present to stakeholders" implies Communication).
// - ADD any soft skill missing from the draft that meets either of the above two conditions (check the actual job description text carefully for direct and indirect signals).
// - REMOVE any soft skill in the draft that has ZERO basis in either the original resume or the job description (direct or indirect) - this is fabrication and must be removed.
// - If genuinely no soft skills apply after this check, return an empty array - do not pad with generic skills.

// GENERAL RULES:
// - Deduplicate case-insensitively. A skill cannot appear in both Technical Skills and Soft Skills - if ambiguous, methodology/practice terms (Agile, Scrum, Debugging, Testing, CI/CD, DevOps, Kanban, TDD, etc.) always belong in Technical Skills, never Soft Skills.
// - Each entry must be a single clean skill name - never a comma list or a phrase combining two skills.
// - Return ONLY valid JSON, no markdown, no explanation, no preamble, in exactly this shape:
// {"technicalSkills": ["..."], "softSkills": ["..."]}
// `;

// const auditSkillCategories = async (
//   draftTechnical: string[],
//   draftSoft: string[],
//   resumeText: string,
//   jobDescription: string,
// ): Promise<{ technicalSkills: string[]; softSkills: string[] } | null> => {
//   try {
//     const textPart = `${SKILL_AUDIT_PROMPT}

// ORIGINAL RESUME:
// ${resumeText}

// JOB DESCRIPTION:
// ${jobDescription}

// DRAFT TECHNICAL SKILLS:
// ${JSON.stringify(draftTechnical)}

// DRAFT SOFT SKILLS:
// ${JSON.stringify(draftSoft)}

// Return ONLY the corrected JSON.
// `;

//     const result = await generateContentWithFailover({
//       model: GEMINI_MODEL,
//       contents: [{ role: "user", parts: [{ text: textPart }] }],
//     });

//     const text = result.text ?? "";
//     const jsonMatch = text.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) {
//       console.warn(
//         "[skill-audit] No JSON found in audit response, keeping draft skills",
//       );
//       return null;
//     }

//     const parsed = JSON.parse(jsonMatch[0]);
//     return {
//       technicalSkills: Array.isArray(parsed?.technicalSkills)
//         ? parsed.technicalSkills.map((s: any) => String(s))
//         : [],
//       softSkills: Array.isArray(parsed?.softSkills)
//         ? parsed.softSkills.map((s: any) => String(s))
//         : [],
//     };
//   } catch (error) {
//     console.error("[skill-audit] Failed, falling back to draft skills:", error);
//     return null;
//   }
// };

// export const rewriteResumeWithAI = async (
//   resumeText: string,
//   jobDescription: string,
// ): Promise<RewrittenResume> => {
//   // Create a cache key based on both inputs
//   const hash = crypto
//     .createHash("sha256")
//     .update(resumeText + "||" + jobDescription)
//     .digest("hex");
//   const key = `rewrite_${hash}`;

//   // Check cache
//   const cached = await getCache<RewrittenResume>(key);
//   if (cached) {
//     console.log(`[cache] resume rewrite hit ${key}`);
//     return cached;
//   }

//   const parts: any[] = [];

//   const textPart = `${REWRITE_RESUME_PROMPT}

// ORIGINAL RESUME TEXT:
// ${resumeText}

// JOB DESCRIPTION:
// ${jobDescription}

// Rewrite the resume based on the job description and return ONLY the valid JSON structure specified above.
// `;

//   parts.push({ text: textPart });

//   try {
//     const result = await generateContentWithFailover({
//       model: GEMINI_MODEL,
//       contents: [{ role: "user", parts }],
//     });

//     const text = result.text ?? "";

//     const jsonMatch = text.match(/\{[\s\S]*\}/);
//     if (!jsonMatch) {
//       throw new Error("Invalid response format from AI");
//     }

//     const raw = JSON.parse(jsonMatch[0]);

//     // Build a draft skill list from the model's raw output (dedup + reclassify only,
//     // no literal-text grounding filter here - that was causing false negatives on
//     // legitimately reworded/canonicalized skills).
//     const draft = buildDraftSkillCategories(raw);

//     // Run the focused audit pass to fix both false negatives (missing valid skills)
//     // and false positives (invented skills) using semantic matching instead of regex.
//     const audited = await auditSkillCategories(
//       draft.technical,
//       draft.soft,
//       resumeText,
//       jobDescription,
//     );

//     const finalSkills = reconcileAuditedSkills(draft, audited);

//     const normalized = normalizeRewrittenResume(
//       raw,
//       jobDescription,
//       finalSkills,
//     );

//     // Cache the result
//     await setCache(key, normalized);
//     console.log(`[cache] resume rewrite set ${key}`);

//     return normalized;
//   } catch (error) {
//     console.error("Resume rewrite error:", error);
//     throwIfQuotaError(error);
//     throw new Error("Failed to rewrite resume with AI");
//   }
// };

// // --- Small shared helpers -----------------------------------------------

// const str = (v: any, fallback = ""): string => {
//   if (typeof v === "string") return v;
//   if (v == null) return fallback;
//   return String(v);
// };

// const bool = (v: any, fallback = false): boolean => {
//   if (typeof v === "boolean") return v;
//   if (v == null) return fallback;
//   return Boolean(v);
// };

// const arr = (v: any): any[] => (Array.isArray(v) ? v : []);

// const safeObject = (v: any) => (v && typeof v === "object" ? v : {});

// const dedupSkills = (list: string[]): string[] => {
//   const seen = new Set<string>();
//   const out: string[] = [];
//   for (const s of list) {
//     const t = (s ?? "").trim();
//     if (!t) continue;
//     const key = t.toLowerCase();
//     if (seen.has(key)) continue;
//     seen.add(key);
//     out.push(t);
//   }
//   return out;
// };

// // Known methodologies/practices/tools that models sometimes mislabel as "soft skills".
// // These are moved into Technical Skills as a safety net, in case the AI mis-categorizes
// // despite the prompt instructions.
// const NON_SOFT_SKILL_TERMS = new Set([
//   "agile",
//   "scrum",
//   "kanban",
//   "waterfall",
//   "tdd",
//   "test driven development",
//   "ci/cd",
//   "cicd",
//   "devops",
//   "debugging",
//   "testing",
//   "unit testing",
//   "pair programming",
//   "code review",
//   "sprint planning",
// ]);

// // Moves any methodology/tool mislabeled as a "soft skill" into Technical Skills,
// // then cross-dedups so no skill appears in both categories.
// const reclassifyAndDedup = (
//   technical: string[],
//   soft: string[],
// ): { technical: string[]; soft: string[] } => {
//   const misplaced = soft.filter((s) =>
//     NON_SOFT_SKILL_TERMS.has(s.toLowerCase()),
//   );
//   let cleanedSoft = soft.filter(
//     (s) => !NON_SOFT_SKILL_TERMS.has(s.toLowerCase()),
//   );
//   let cleanedTechnical = misplaced.length
//     ? dedupSkills([...technical, ...misplaced])
//     : dedupSkills(technical);

//   const softLower = new Set(cleanedSoft.map((s) => s.toLowerCase()));
//   cleanedTechnical = cleanedTechnical.filter(
//     (s) => !softLower.has(s.toLowerCase()),
//   );
//   cleanedSoft = dedupSkills(cleanedSoft);

//   return { technical: cleanedTechnical, soft: cleanedSoft };
// };

// // Builds a draft technical/soft skill split straight from the model's raw JSON,
// // handling legacy field names and stray sub-categories, WITHOUT any literal-text
// // grounding filter (that check is delegated to the audit pass, which can reason
// // semantically about canonicalized/indirect matches).
// const buildDraftSkillCategories = (
//   raw: any,
// ): { technical: string[]; soft: string[] } => {
//   const legacyHard = dedupSkills(arr(raw?.hardSkills).map((v: any) => str(v)));
//   const legacySoft = dedupSkills(arr(raw?.softSkills).map((v: any) => str(v)));
//   const legacyFlat = dedupSkills(arr(raw?.skills).map((v: any) => str(v)));

//   const rawCategories: Array<{ name: string; skills: string[] }> = arr(
//     raw?.skillCategories,
//   )
//     .map((cat: any) => ({
//       name: str(cat?.name).trim(),
//       skills: dedupSkills(arr(cat?.skills).map((v: any) => str(v))),
//     }))
//     .filter((c) => c.name && c.skills.length > 0);

//   const extraSkills = rawCategories
//     .filter(
//       (c) =>
//         !["technical skills", "soft skills"].includes(c.name.toLowerCase()),
//     )
//     .flatMap((c) => c.skills);

//   let technical =
//     rawCategories.find((c) => c.name.toLowerCase() === "technical skills")
//       ?.skills ?? [];
//   let soft =
//     rawCategories.find((c) => c.name.toLowerCase() === "soft skills")?.skills ??
//     [];

//   if (!technical.length) {
//     technical = legacyHard.length
//       ? legacyHard
//       : extraSkills.length
//         ? dedupSkills(extraSkills)
//         : legacyFlat;
//   } else if (extraSkills.length) {
//     technical = dedupSkills([...technical, ...extraSkills]);
//   }

//   if (!soft.length) {
//     soft = legacySoft;
//   }

//   return reclassifyAndDedup(technical, soft);
// };

// // Merges the audit pass result with the draft. If the audit call failed (network
// // error, unparsable response), fall back to the draft skills as-is rather than
// // applying any further heuristic filtering - trusting the main prompt's rules
// // is safer than a brittle regex pass that caused both false positives and
// // false negatives before.
// const reconcileAuditedSkills = (
//   draft: { technical: string[]; soft: string[] },
//   audited: { technicalSkills: string[]; softSkills: string[] } | null,
// ): { technical: string[]; soft: string[] } => {
//   if (!audited) return draft;

//   const technical = dedupSkills(audited.technicalSkills);
//   const soft = dedupSkills(audited.softSkills);

//   return reclassifyAndDedup(technical, soft);
// };

// // Section titles the model sometimes invents instead of the plain default.
// // If the AI returns one of these (and it wasn't clearly a deliberate custom title),
// // we fall back to the plain default.
// const INVENTED_SKILLS_TITLE_PATTERN =
//   /(&|and)\s*(competencies|expertise|proficienc)/i;

// // Strip any numeric metric (percentages, raw numbers, dollar amounts, "Xx") from the
// // summary as a safety net, in case the model still slips a number in.
// const sanitizeSummary = (summary: string): string => {
//   if (!summary) return summary;
//   const cleaned = summary
//     // remove percentages like "25%"
//     .replace(/\b\d+(\.\d+)?\s*%/g, "")
//     // remove dollar amounts like "$50k", "$1.2M"
//     .replace(/\$\s?\d+(\.\d+)?\s?[kKmMbB]?\b/g, "")
//     // remove "3x", "10x" style multipliers
//     .replace(/\b\d+(\.\d+)?x\b/gi, "")
//     // remove standalone numbers with units like "20 hours", "300 users" attached to metric language
//     .replace(
//       /\b\d+(\.\d+)?\s*(hours?|hrs?|users?|customers?|clients?|projects?|team members?)\b/gi,
//       "",
//     )
//     // collapse leftover double spaces / stray punctuation from removals
//     .replace(/\s{2,}/g, " ")
//     .replace(/\s+([.,])/g, "$1")
//     .replace(/\(\s*\)/g, "")
//     .trim();
//   return cleaned;
// };

// // Collapse a bullet/highlight down to a single line. Safety net in case the model
// // still slips in a line break or a merged multi-sentence bullet.
// const sanitizeHighlight = (text: string): string => {
//   if (!text) return text;
//   return text
//     .replace(/\r\n|\r|\n/g, " ") // remove any line breaks
//     .replace(/\s{2,}/g, " ") // collapse extra whitespace
//     .trim();
// };

// // Best-effort fallback to pull a job title out of the job description text,
// // used ONLY if the AI leaves personalInfo.jobTitle empty.
// const extractJobTitleFromJD = (jobDescription: string): string => {
//   if (!jobDescription) return "";

//   const labeledPatterns = [
//     /job\s*title\s*[:\-]\s*(.+)/i,
//     /position\s*(title)?\s*[:\-]\s*(.+)/i,
//     /role\s*[:\-]\s*(.+)/i,
//   ];
//   for (const pattern of labeledPatterns) {
//     const match = jobDescription.match(pattern);
//     if (match) {
//       const captured = match[match.length - 1];
//       const cleaned = captured.split("\n")[0].trim();
//       if (cleaned && cleaned.length <= 80) return cleaned;
//     }
//   }

//   const phrasePatterns = [
//     /(?:hiring|seeking|looking for)\s+(?:an?\s+)?([A-Z][A-Za-z0-9+/#.\- ]{2,60}?)(?:\.|,|\n|to\s|who\s)/,
//     /(?:we are|we're)\s+(?:an?\s+)?.*?(?:hiring|seeking)\s+(?:an?\s+)?([A-Z][A-Za-z0-9+/#.\- ]{2,60}?)(?:\.|,|\n)/,
//   ];
//   for (const pattern of phrasePatterns) {
//     const match = jobDescription.match(pattern);
//     if (match?.[1]) {
//       const cleaned = match[1].trim();
//       if (cleaned) return cleaned;
//     }
//   }

//   // Fallback: first short, title-like line (common when JD starts with the role name)
//   const firstLine = jobDescription
//     .split("\n")
//     .map((l) => l.trim())
//     .find((l) => l.length > 0);
//   if (
//     firstLine &&
//     firstLine.length <= 60 &&
//     !/job description/i.test(firstLine)
//   ) {
//     return firstLine;
//   }

//   return "";
// };

// // Logs (does not block) when the resume doesn't hit the minimum measurable-impact
// // bullet count, so it can be monitored/tuned over time.
// const countMeasurableImpactBullets = (resume: RewrittenResume): number => {
//   const metricPattern = /\d/; // any digit signals a quantifiable result
//   const allHighlights = [
//     ...resume.experience.flatMap((e) => e.highlights),
//     ...(resume.projects ?? []).flatMap((p) => p.highlights),
//   ];
//   return allHighlights.filter((h) => metricPattern.test(h)).length;
// };

// // Normalize the AI response to match our expected structure
// const normalizeRewrittenResume = (
//   raw: any,
//   jobDescription = "",
//   finalSkills: { technical: string[]; soft: string[] } = {
//     technical: [],
//     soft: [],
//   },
// ): RewrittenResume => {
//   const finalCategories: Array<{ name: string; skills: string[] }> = [];
//   if (finalSkills.technical.length > 0 || finalSkills.soft.length > 0) {
//     finalCategories.push({
//       name: "Technical Skills",
//       skills: finalSkills.technical,
//     });
//     finalCategories.push({ name: "Soft Skills", skills: finalSkills.soft });
//   }

//   // --- Section titles: fall back to plain defaults if the AI invented a compound title ---
//   const rawSkillsTitle = str(raw?.sectionTitles?.skills).trim();
//   const skillsTitle =
//     !rawSkillsTitle || INVENTED_SKILLS_TITLE_PATTERN.test(rawSkillsTitle)
//       ? "Skills"
//       : rawSkillsTitle;

//   const aiJobTitle = str(raw?.personalInfo?.jobTitle).trim();
//   const finalJobTitle = aiJobTitle || extractJobTitleFromJD(jobDescription);

//   const result: RewrittenResume = {
//     personalInfo: {
//       fullName: str(raw?.personalInfo?.fullName),
//       jobTitle: finalJobTitle,
//       contact: safeObject(raw?.personalInfo?.contact) ?? {
//         email: str(raw?.personalInfo?.contact?.email),
//         phone: str(raw?.personalInfo?.contact?.phone),
//         linkedIn: str(raw?.personalInfo?.contact?.linkedIn),
//         address: safeObject(raw?.personalInfo?.contact?.address) ?? {
//           city: str(raw?.personalInfo?.contact?.address?.city),
//           state: str(raw?.personalInfo?.contact?.address?.state),
//         },
//         socialLinks: safeObject(raw?.personalInfo?.contact?.socialLinks) ?? {
//           github: str(raw?.personalInfo?.contact?.socialLinks?.github),
//           portfolio: str(raw?.personalInfo?.contact?.socialLinks?.portfolio),
//           website: str(raw?.personalInfo?.contact?.socialLinks?.website),
//         },
//       },
//     },
//     summary: sanitizeSummary(str(raw?.summary)),
//     experience: arr(raw?.experience).map((exp: any) => ({
//       company: str(exp?.company),
//       title: str(exp?.title),
//       location: str(exp?.location),
//       startDate: str(exp?.startDate),
//       endDate: str(exp?.endDate),
//       current: bool(exp?.current),
//       highlights: arr(exp?.highlights).map((v: any) =>
//         sanitizeHighlight(str(v)),
//       ),
//     })),
//     projects: arr(raw?.projects).map((proj: any) => ({
//       name: str(proj?.name),
//       highlights: arr(proj?.highlights).map((v: any) =>
//         sanitizeHighlight(str(v)),
//       ),
//       startDate: str(proj?.startDate),
//       endDate: str(proj?.endDate),
//       current: bool(proj?.current),
//       links: safeObject(proj?.links) ?? {
//         live: str(proj?.links?.live),
//         caseStudy: str(proj?.links?.caseStudy),
//       },
//     })),
//     achievements: arr(raw?.achievements).map((ach: any) => ({
//       title: str(ach?.title),
//       date: str(ach?.date),
//       description: str(ach?.description),
//     })),
//     education: arr(raw?.education).map((edu: any) => ({
//       institution: str(edu?.institution),
//       degree: str(edu?.degree),
//       areaOfStudy: str(edu?.areaOfStudy),
//       startDate: str(edu?.startDate),
//       endDate: str(edu?.endDate),
//       gpa: str(edu?.gpa),
//     })),
//     skillCategories: finalCategories,
//     certifications: arr(raw?.certifications).map((cert: any) => ({
//       name: str(cert?.name),
//       issuer: str(cert?.issuer),
//       date: str(cert?.date),
//     })),
//     sectionTitles: {
//       summary: str(raw?.sectionTitles?.summary),
//       experience: str(raw?.sectionTitles?.experience),
//       skills: skillsTitle,
//       education: str(raw?.sectionTitles?.education),
//       projects: str(raw?.sectionTitles?.projects),
//       achievements: str(raw?.sectionTitles?.achievements),
//       certifications: str(raw?.sectionTitles?.certifications),
//     },
//     sectionOrder: arr(raw?.sectionOrder).filter((k: string) =>
//       [
//         "summary",
//         "experience",
//         "skills",
//         "education",
//         "projects",
//         "achievements",
//         "certifications",
//       ].includes(k),
//     ) as Array<
//       | "personalInfo"
//       | "summary"
//       | "experience"
//       | "skills"
//       | "education"
//       | "projects"
//       | "achievements"
//       | "certifications"
//     >,
//     layout: safeObject(raw?.layout) ?? {
//       isSingleColumn: bool(raw?.layout?.isSingleColumn, true),
//       hasTables: bool(raw?.layout?.hasTables),
//       hasImages: bool(raw?.layout?.hasImages),
//       hasIcons: bool(raw?.layout?.hasIcons),
//       hasMultiColumn: bool(raw?.layout?.hasMultiColumn),
//     },
//     fontCheck: safeObject(raw?.fontCheck) ?? {
//       isStandardFont: bool(raw?.fontCheck?.isStandardFont, true),
//       fontName: str(raw?.fontCheck?.fontName),
//       isReadableSize: bool(raw?.fontCheck?.isReadableSize, true),
//       hasMixedFonts: bool(raw?.fontCheck?.hasMixedFonts),
//     },
//   };

//   const measurableCount = countMeasurableImpactBullets(result);
//   if (measurableCount < 5) {
//     console.warn(
//       `[resume-rewrite] Only ${measurableCount} measurable-impact bullets found across experience+projects (minimum required: 5)`,
//     );
//   }

//   return result;
// };

import { GEMINI_MODEL, generateContentWithFailover } from "../../config/gemini";
import { throwIfQuotaError } from "./geminiErrors";
import { getCache, setCache } from "../cache/aiCache";
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
    gpa?: string;
  }>;
  skillCategories: Array<{
    name: string;
    skills: string[];
  }>;
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
  sectionOrder?: Array<
    | "personalInfo"
    | "summary"
    | "experience"
    | "skills"
    | "education"
    | "projects"
    | "achievements"
    | "certifications"
  >;
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
You are an expert resume writer. Rewrite the provided resume to be ATS-optimized and tailored to the job description. Keep every piece of information 100% truthful. Never invent experience, skills, metrics, or qualifications.

INPUTS:
1. ORIGINAL RESUME TEXT
2. JOB DESCRIPTION

CORE RULES:
- Only reword and reframe existing information to better match the job description.
- Use the exact same structure and sections as the original resume.
- Output ONLY valid JSON matching the structure below. No markdown, no explanations.
- Experience & Projects: maximum 3 bullet points per role/project.
- Every highlight must be exactly ONE single concise sentence, maximun 85 characters (no multi-sentence bullets, no line breaks).

JOB TITLE RULE:
- personalInfo.jobTitle = the exact or near-exact target role title from the JOB DESCRIPTION.
- Only fall back to the candidate’s current title if the job description has no clear title.

SUMMARY RULES:
- Maximum 3 lines.
- Qualitative positioning statement only (who the candidate is + top strengths for this role and top achievements).
- Never include numbers, percentages, dollar amounts, or any metrics.
- Naturally weave in important keywords from the job description (technical terms, domain terms, soft-skill phrases) while keeping the tone natural and professional.

BULLET / HIGHLIGHT RULES:
- Start every bullet with a strong action verb.
- Mix quantified and qualitative impact.
- Quantified metrics (numbers, %, $, x, time, scale, counts) are allowed ONLY when they are genuinely supported by the original resume. Never fabricate numbers.
- Across the "experience" and "projects" sections COMBINED, there must be AT LEAST 5 highlights that contain a genuine quantifiable result. Give higher priority to putting measurable impact in the Experience section.
- If the original resume has very few metrics, still try hard to surface any countable facts (team size, features shipped, users, releases, etc.) truthfully. Only keep a bullet purely qualitative when no real number can be extracted.
- Naturally include relevant keywords from the job description in the bullets when they fit the existing content.

SKILLS RULES (STRICT):
- Create EXACTLY 2 categories:
  1. "Technical Skills"
  2. "Soft Skills"
- Technical Skills = programming languages, frameworks, libraries, databases, cloud platforms, tools, APIs, architectures, and professional practices (examples: RESTful APIs, GraphQL, Microservices, CI/CD, Agile, TDD, Unit Testing, Debugging, DevOps, etc.).
- Soft Skills = genuine interpersonal/behavioral traits (Communication, Leadership, Teamwork, Collaboration, Mentoring, Time Management, Problem-Solving, etc.).
- Every skill must be a single clean keyword (no phrases like "React and Node").
- Canonicalize variants (React.js → React, Node.js → Node.js).
- Deduplicate case-insensitively.

SKILL GROUNDING:
- Technical Skills: Only include a skill if it appears in the original resume OR is required by the job description AND is supported by something the candidate actually did.
- Soft Skills: Take the UNION of (a) every soft skill from the original resume + (b) every soft skill required or clearly implied by the job description. Deduplicate case-insensitively. When two skills have very similar meaning, keep the exact wording from the job description.

ATS KEYWORD COVERAGE:
- Extract all hard/technical keywords and soft-skill keywords from the job description.
- Place them in the correct skillCategories bucket when supported by the resume.
- Also weave important keywords naturally into the Summary and Experience/Project bullets (without inventing new claims).

SECTION TITLE RULES:
- Use simple standard titles (Summary, Experience, Skills, Education, Projects, etc.) unless the original resume used a different custom title.

JSON STRUCTURE:
{
  "personalInfo": {
    "fullName": "",
    "jobTitle": "",
    "contact": {
      "email": "",
      "phone": "",
      "linkedIn": "",
      "address": { "city": "", "state": "" },
      "socialLinks": { "github": "", "portfolio": "", "website": "" }
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
      "highlights": [""]
    }
  ],
  "projects": [
    {
      "name": "",
      "highlights": [""],
      "startDate": "",
      "endDate": "",
      "current": false,
      "links": { "live": "", "caseStudy": "" }
    }
  ],
  "achievements": [
    { "title": "", "date": "", "description": "" }
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
  "skillCategories": [
    { "name": "Technical Skills", "skills": [""] },
    { "name": "Soft Skills", "skills": [""] }
  ],
  "certifications": [
    { "name": "", "issuer": "", "date": "" }
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

FINAL RULES:
- If information is missing, leave the field empty ("" or []).
- Never invent or hallucinate anything.
- skillCategories must contain exactly the two named entries.
- Return ONLY the JSON object.
`;

// ---------------------------------------------------------------------------
// SKILL AUDIT PASS
// Skill matching is a semantic task (canonicalized names, indirect JD phrasing),
// which plain regex/substring matching cannot reliably verify - it either
// rejects valid skills that were legitimately reworded, or lets fabricated
// ones slip through. Instead, we run a focused second AI pass whose ONLY job
// is to audit the draft skill list against the two source documents and
// correct it (add missing genuine skills, remove unsupported ones).
// ---------------------------------------------------------------------------

const SKILL_AUDIT_PROMPT = `
You are auditing a resume's skill list for accuracy against two source documents: the candidate's ORIGINAL RESUME and the TARGET JOB DESCRIPTION.

You will be given a DRAFT skill list (already split into Technical Skills and Soft Skills). Correct it using these rules:

TECHNICAL SKILLS RULES:
- Keep a technical skill ONLY if it is explicitly present in the ORIGINAL RESUME, OR explicitly required in the JOB DESCRIPTION AND genuinely supported by something the candidate did in the ORIGINAL RESUME.
- REMOVE any technical skill from the draft that fails this check (no basis in either source).
- ADD any technical skill that IS genuinely present in the original resume or genuinely supported+required as above, but is MISSING from the draft list. This commonly happens due to wording/canonicalization differences - e.g. resume says "Node" and job description says "Node.js": the final list should include "Node.js". Another example: resume mentions "REST APIs" and job description says "RESTful services" - these are the same skill, include it once, canonicalized.
- Canonicalize to exactly one clean name per technology (merge spelling variants like React/React.js -> React).
- When two skills have very similar meaning, prefer the exact wording used in the JOB DESCRIPTION.
- Never invent a technical skill with zero basis in either source.

SOFT SKILLS RULES:
- Keep every soft skill that is explicitly stated in the ORIGINAL RESUME's own skills list or text.
- Keep every soft skill required or implied by the JOB DESCRIPTION - directly (explicitly named, e.g. "strong communication skills") or indirectly (implied by a described responsibility, e.g. "mentor junior engineers" implies Mentoring, "collaborate across teams" implies Teamwork/Collaboration, "manage multiple deadlines" implies Time Management, "present to stakeholders" implies Communication).
- ADD any soft skill missing from the draft that meets either of the above two conditions (check the actual job description text carefully for direct and indirect signals).
- REMOVE any soft skill in the draft that has ZERO basis in either the original resume or the job description (direct or indirect) - this is fabrication and must be removed.
- When two soft skills have very similar meaning, prefer the exact wording used in the JOB DESCRIPTION.
- If genuinely no soft skills apply after this check, return an empty array - do not pad with generic skills.

GENERAL RULES:
- Deduplicate case-insensitively. A skill cannot appear in both Technical Skills and Soft Skills - if ambiguous, methodology/practice terms (Agile Debugging, Testing, CI/CD, DevOps, Kanban, TDD, etc.) always belong in Technical Skills, never Soft Skills.
- Each entry must be a single clean skill name - never a comma list or a phrase combining two skills.
- Return ONLY valid JSON, no markdown, no explanation, no preamble, in exactly this shape:
{"technicalSkills": ["..."], "softSkills": ["..."]}
`;

const auditSkillCategories = async (
  draftTechnical: string[],
  draftSoft: string[],
  resumeText: string,
  jobDescription: string,
): Promise<{ technicalSkills: string[]; softSkills: string[] } | null> => {
  try {
    const textPart = `${SKILL_AUDIT_PROMPT}

ORIGINAL RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

DRAFT TECHNICAL SKILLS:
${JSON.stringify(draftTechnical)}

DRAFT SOFT SKILLS:
${JSON.stringify(draftSoft)}

Return ONLY the corrected JSON.
`;

    const result = await generateContentWithFailover({
      model: GEMINI_MODEL,
      contents: [{ role: "user", parts: [{ text: textPart }] }],
    });

    const text = result.text ?? "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn(
        "[skill-audit] No JSON found in audit response, keeping draft skills",
      );
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      technicalSkills: Array.isArray(parsed?.technicalSkills)
        ? parsed.technicalSkills.map((s: any) => String(s))
        : [],
      softSkills: Array.isArray(parsed?.softSkills)
        ? parsed.softSkills.map((s: any) => String(s))
        : [],
    };
  } catch (error) {
    console.error("[skill-audit] Failed, falling back to draft skills:", error);
    return null;
  }
};

export const rewriteResumeWithAI = async (
  resumeText: string,
  jobDescription: string,
): Promise<RewrittenResume> => {
  // Create a cache key based on both inputs
  const hash = crypto
    .createHash("sha256")
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

    // Build a draft skill list from the model's raw output (dedup + reclassify only,
    // no literal-text grounding filter here - that was causing false negatives on
    // legitimately reworded/canonicalized skills).
    const draft = buildDraftSkillCategories(raw);

    // Run the focused audit pass to fix both false negatives (missing valid skills)
    // and false positives (invented skills) using semantic matching instead of regex.
    const audited = await auditSkillCategories(
      draft.technical,
      draft.soft,
      resumeText,
      jobDescription,
    );

    const finalSkills = reconcileAuditedSkills(draft, audited);

    const normalized = normalizeRewrittenResume(
      raw,
      jobDescription,
      finalSkills,
    );

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

// --- Small shared helpers -----------------------------------------------

const str = (v: any, fallback = ""): string => {
  if (typeof v === "string") return v;
  if (v == null) return fallback;
  return String(v);
};

const bool = (v: any, fallback = false): boolean => {
  if (typeof v === "boolean") return v;
  if (v == null) return fallback;
  return Boolean(v);
};

const arr = (v: any): any[] => (Array.isArray(v) ? v : []);

const safeObject = (v: any) => (v && typeof v === "object" ? v : {});

const dedupSkills = (list: string[]): string[] => {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of list) {
    const t = (s ?? "").trim();
    if (!t) continue;
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(t);
  }
  return out;
};

// Known methodologies/practices/tools that models sometimes mislabel as "soft skills".
// These are moved into Technical Skills as a safety net, in case the AI mis-categorizes
// despite the prompt instructions.
const NON_SOFT_SKILL_TERMS = new Set([
  "agile",
  "scrum",
  "kanban",
  "waterfall",
  "tdd",
  "test driven development",
  "ci/cd",
  "cicd",
  "devops",
  "debugging",
  "testing",
  "unit testing",
  "pair programming",
  "code review",
  "sprint planning",
]);

// Moves any methodology/tool mislabeled as a "soft skill" into Technical Skills,
// then cross-dedups so no skill appears in both categories.
const reclassifyAndDedup = (
  technical: string[],
  soft: string[],
): { technical: string[]; soft: string[] } => {
  const misplaced = soft.filter((s) =>
    NON_SOFT_SKILL_TERMS.has(s.toLowerCase()),
  );
  let cleanedSoft = soft.filter(
    (s) => !NON_SOFT_SKILL_TERMS.has(s.toLowerCase()),
  );
  let cleanedTechnical = misplaced.length
    ? dedupSkills([...technical, ...misplaced])
    : dedupSkills(technical);

  const softLower = new Set(cleanedSoft.map((s) => s.toLowerCase()));
  cleanedTechnical = cleanedTechnical.filter(
    (s) => !softLower.has(s.toLowerCase()),
  );
  cleanedSoft = dedupSkills(cleanedSoft);

  return { technical: cleanedTechnical, soft: cleanedSoft };
};

// Builds a draft technical/soft skill split straight from the model's raw JSON,
// handling legacy field names and stray sub-categories, WITHOUT any literal-text
// grounding filter (that check is delegated to the audit pass, which can reason
// semantically about canonicalized/indirect matches).
const buildDraftSkillCategories = (
  raw: any,
): { technical: string[]; soft: string[] } => {
  const legacyHard = dedupSkills(arr(raw?.hardSkills).map((v: any) => str(v)));
  const legacySoft = dedupSkills(arr(raw?.softSkills).map((v: any) => str(v)));
  const legacyFlat = dedupSkills(arr(raw?.skills).map((v: any) => str(v)));

  const rawCategories: Array<{ name: string; skills: string[] }> = arr(
    raw?.skillCategories,
  )
    .map((cat: any) => ({
      name: str(cat?.name).trim(),
      skills: dedupSkills(arr(cat?.skills).map((v: any) => str(v))),
    }))
    .filter((c) => c.name && c.skills.length > 0);

  const extraSkills = rawCategories
    .filter(
      (c) =>
        !["technical skills", "soft skills"].includes(c.name.toLowerCase()),
    )
    .flatMap((c) => c.skills);

  let technical =
    rawCategories.find((c) => c.name.toLowerCase() === "technical skills")
      ?.skills ?? [];
  let soft =
    rawCategories.find((c) => c.name.toLowerCase() === "soft skills")?.skills ??
    [];

  if (!technical.length) {
    technical = legacyHard.length
      ? legacyHard
      : extraSkills.length
        ? dedupSkills(extraSkills)
        : legacyFlat;
  } else if (extraSkills.length) {
    technical = dedupSkills([...technical, ...extraSkills]);
  }

  if (!soft.length) {
    soft = legacySoft;
  }

  return reclassifyAndDedup(technical, soft);
};

// Merges the audit pass result with the draft. If the audit call failed (network
// error, unparsable response), fall back to the draft skills as-is rather than
// applying any further heuristic filtering - trusting the main prompt's rules
// is safer than a brittle regex pass that caused both false positives and
// false negatives before.
const reconcileAuditedSkills = (
  draft: { technical: string[]; soft: string[] },
  audited: { technicalSkills: string[]; softSkills: string[] } | null,
): { technical: string[]; soft: string[] } => {
  if (!audited) return draft;

  const technical = dedupSkills(audited.technicalSkills);
  const soft = dedupSkills(audited.softSkills);

  return reclassifyAndDedup(technical, soft);
};

// Section titles the model sometimes invents instead of the plain default.
// If the AI returns one of these (and it wasn't clearly a deliberate custom title),
// we fall back to the plain default.
const INVENTED_SKILLS_TITLE_PATTERN =
  /(&|and)\s*(competencies|expertise|proficienc)/i;

// Strip any numeric metric (percentages, raw numbers, dollar amounts, "Xx") from the
// summary as a safety net, in case the model still slips a number in.
const sanitizeSummary = (summary: string): string => {
  if (!summary) return summary;
  const cleaned = summary
    // remove percentages like "25%"
    .replace(/\b\d+(\.\d+)?\s*%/g, "")
    // remove dollar amounts like "$50k", "$1.2M"
    .replace(/\$\s?\d+(\.\d+)?\s?[kKmMbB]?\b/g, "")
    // remove "3x", "10x" style multipliers
    .replace(/\b\d+(\.\d+)?x\b/gi, "")
    // remove standalone numbers with units like "20 hours", "300 users" attached to metric language
    .replace(
      /\b\d+(\.\d+)?\s*(hours?|hrs?|users?|customers?|clients?|projects?|team members?)\b/gi,
      "",
    )
    // collapse leftover double spaces / stray punctuation from removals
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([.,])/g, "$1")
    .replace(/\(\s*\)/g, "")
    .trim();
  return cleaned;
};

// Collapse a bullet/highlight down to a single line. Safety net in case the model
// still slips in a line break or a merged multi-sentence bullet.
const sanitizeHighlight = (text: string): string => {
  if (!text) return text;
  return text
    .replace(/\r\n|\r|\n/g, " ") // remove any line breaks
    .replace(/\s{2,}/g, " ") // collapse extra whitespace
    .trim();
};

// Best-effort fallback to pull a job title out of the job description text,
// used ONLY if the AI leaves personalInfo.jobTitle empty.
const extractJobTitleFromJD = (jobDescription: string): string => {
  if (!jobDescription) return "";

  const labeledPatterns = [
    /job\s*title\s*[:\-]\s*(.+)/i,
    /position\s*(title)?\s*[:\-]\s*(.+)/i,
    /role\s*[:\-]\s*(.+)/i,
  ];
  for (const pattern of labeledPatterns) {
    const match = jobDescription.match(pattern);
    if (match) {
      const captured = match[match.length - 1];
      const cleaned = captured.split("\n")[0].trim();
      if (cleaned && cleaned.length <= 80) return cleaned;
    }
  }

  const phrasePatterns = [
    /(?:hiring|seeking|looking for)\s+(?:an?\s+)?([A-Z][A-Za-z0-9+/#.\- ]{2,60}?)(?:\.|,|\n|to\s|who\s)/,
    /(?:we are|we're)\s+(?:an?\s+)?.*?(?:hiring|seeking)\s+(?:an?\s+)?([A-Z][A-Za-z0-9+/#.\- ]{2,60}?)(?:\.|,|\n)/,
  ];
  for (const pattern of phrasePatterns) {
    const match = jobDescription.match(pattern);
    if (match?.[1]) {
      const cleaned = match[1].trim();
      if (cleaned) return cleaned;
    }
  }

  // Fallback: first short, title-like line (common when JD starts with the role name)
  const firstLine = jobDescription
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (
    firstLine &&
    firstLine.length <= 60 &&
    !/job description/i.test(firstLine)
  ) {
    return firstLine;
  }

  return "";
};

// Logs (does not block) when the resume doesn't hit the minimum measurable-impact
// bullet count, so it can be monitored/tuned over time.
const countMeasurableImpactBullets = (resume: RewrittenResume): number => {
  const metricPattern = /\d/; // any digit signals a quantifiable result
  const allHighlights = [
    ...resume.experience.flatMap((e) => e.highlights),
    ...(resume.projects ?? []).flatMap((p) => p.highlights),
  ];
  return allHighlights.filter((h) => metricPattern.test(h)).length;
};

// Normalize the AI response to match our expected structure
const normalizeRewrittenResume = (
  raw: any,
  jobDescription = "",
  finalSkills: { technical: string[]; soft: string[] } = {
    technical: [],
    soft: [],
  },
): RewrittenResume => {
  const finalCategories: Array<{ name: string; skills: string[] }> = [];
  if (finalSkills.technical.length > 0 || finalSkills.soft.length > 0) {
    finalCategories.push({
      name: "Technical Skills",
      skills: finalSkills.technical,
    });
    finalCategories.push({ name: "Soft Skills", skills: finalSkills.soft });
  }

  // --- Section titles: fall back to plain defaults if the AI invented a compound title ---
  const rawSkillsTitle = str(raw?.sectionTitles?.skills).trim();
  const skillsTitle =
    !rawSkillsTitle || INVENTED_SKILLS_TITLE_PATTERN.test(rawSkillsTitle)
      ? "Skills"
      : rawSkillsTitle;

  const aiJobTitle = str(raw?.personalInfo?.jobTitle).trim();
  const finalJobTitle = aiJobTitle || extractJobTitleFromJD(jobDescription);

  const result: RewrittenResume = {
    personalInfo: {
      fullName: str(raw?.personalInfo?.fullName),
      jobTitle: finalJobTitle,
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
    summary: sanitizeSummary(str(raw?.summary)),
    experience: arr(raw?.experience).map((exp: any) => ({
      company: str(exp?.company),
      title: str(exp?.title),
      location: str(exp?.location),
      startDate: str(exp?.startDate),
      endDate: str(exp?.endDate),
      current: bool(exp?.current),
      highlights: arr(exp?.highlights).map((v: any) =>
        sanitizeHighlight(str(v)),
      ),
    })),
    projects: arr(raw?.projects).map((proj: any) => ({
      name: str(proj?.name),
      highlights: arr(proj?.highlights).map((v: any) =>
        sanitizeHighlight(str(v)),
      ),
      startDate: str(proj?.startDate),
      endDate: str(proj?.endDate),
      current: bool(proj?.current),
      links: safeObject(proj?.links) ?? {
        live: str(proj?.links?.live),
        caseStudy: str(proj?.links?.caseStudy),
      },
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
    skillCategories: finalCategories,
    certifications: arr(raw?.certifications).map((cert: any) => ({
      name: str(cert?.name),
      issuer: str(cert?.issuer),
      date: str(cert?.date),
    })),
    sectionTitles: {
      summary: str(raw?.sectionTitles?.summary),
      experience: str(raw?.sectionTitles?.experience),
      skills: skillsTitle,
      education: str(raw?.sectionTitles?.education),
      projects: str(raw?.sectionTitles?.projects),
      achievements: str(raw?.sectionTitles?.achievements),
      certifications: str(raw?.sectionTitles?.certifications),
    },
    sectionOrder: arr(raw?.sectionOrder).filter((k: string) =>
      [
        "summary",
        "experience",
        "skills",
        "education",
        "projects",
        "achievements",
        "certifications",
      ].includes(k),
    ) as Array<
      | "personalInfo"
      | "summary"
      | "experience"
      | "skills"
      | "education"
      | "projects"
      | "achievements"
      | "certifications"
    >,
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

  const measurableCount = countMeasurableImpactBullets(result);
  if (measurableCount < 5) {
    console.warn(
      `[resume-rewrite] Only ${measurableCount} measurable-impact bullets found across experience+projects (minimum required: 5)`,
    );
  }

  return result;
};
