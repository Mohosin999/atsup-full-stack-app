# Backend — Resume Content Refactor (Contact / Highlights / Flat Skills)

## What changed (one-liner)

`ResumeContent` schema was restructured:

- `personalInfo.contact` is now a nested object:
  `{ email, whatsapp, linkedIn, address: { city, division, zipCode }, socialLinks: { github, portfolio, website } }`
  (previously `email/whatsapp/linkedIn/address/socialLinks` sat directly on `personalInfo`).
- `experience[].description` (string) is now `experience[].highlights: string[]`.
- `projects[].description` (string) is now `projects[].highlights: string[]`.
- `technicalSkills` + `softSkills` are now one flat `skills: string[]`.
- `skillsByCategory` removed.
- New optional `certifications: { name, issuer?, date? }[]`.

---

## Files & functions

### 1. `backend/src/types/index.ts`

No functions — schema only.

- `ResumeContent` (line ~36): the new schema described above.
  - `personalInfo.contact` nested contact block.
  - `experience: Experience[]`, `projects?: Project[]`, `education: Education[]`, `skills: string[]`.
  - `certifications?`, `achievements?`.
- `Experience` (line ~71): `{ company, title, topSkills?, location?, startDate, endDate?, current?, highlights: string[] }`.
- `Project` (line ~82): `{ name, highlights: string[], startDate?, endDate?, current?, links?, technologies? }`.

---

### 2. `backend/src/utils/index.ts`

- `experienceText(exp)` (line 16): joins `exp.highlights` into one plain string. Used by AI/analysis so the old single `description` string shape is no longer assumed.
- `projectText(proj)` (line 20): joins `proj.highlights` into one plain string.
- `formatResponse` (line 3), `paginate` (line 11): unrelated generic helpers.

---

### 3. `backend/src/services/resumeParser/index.ts`

Deterministic fixed-template parser (Jobscan/FPDF PDFs put section headings at the END as a TOC, so parsing uses content signals, not heading order).

- `parseResumeFile(filePath, mimetype)` (line 5): entry point; routes by file type.
- `parsePDF(filePath)` (line 20): extracts text via `pdf-parse`, calls `parseTextToResume`.
- `parseDOCX(filePath)` (line 35): extracts text from DOCX, calls `parseTextToResume`.
- `isDateLine(line)` (line 85): detects a date-range line → start of a new entry.
- `isEntryNameLine(line)` (line 87): detects title/degree lines (title keywords + trailing `,` etc.).
- `isBulletLine(line)` (line 103): bullet vs fragment — short (10 < len ≤ 150) + terminal `[.;:!?]`.
- `isSkillLine(line)` (line 178): matches line against a known-skills vocabulary (used to exit skills mode).
- `parseDates(line)` (line 199): extracts `startDate`, `endDate`, `current`.
- `parseTextToResume(text)` (line 216): main state machine.
  - Contact: regex scan (`emailRe`, `phoneRe`, `linkedinRe`, `urlRe`) + fixed header order (name, job title, address) → `personalInfo.contact`.
  - Summary: prose lines before the first entry boundary.
  - Experience/Projects: `flushEntry` builds entries; bullet lines → `highlights: string[]`, non-bullet fragments joined into one string appended to `highlights`.
  - Skills: flat `skills: string[]` (no categories). Education, certifications, achievements also collected.

---

### 4. `backend/src/services/resumeBuilder/index.ts`

- `createResumeTemplate` (line 9): saves a builder resume template (stores `ResumeContent`).
- `generateSectionContent` (line 114): AI section generation (still string content — the editor splits into highlights).
- `checkAtsFriendliness(content)` (line 144): reads
  - `content.personalInfo.contact?.email` / `.whatsapp` / `.socialLinks?.github`,
  - `exp.highlights` joined to measure description length and detect action verbs,
  - flat `content.skills`.

---

### 5. `backend/src/services/atsScoreHistory/index.ts`

- `createAtsScoreHistory(userId, resumeName, resumeContent, jobDescription?)` (line 17): calls Gemini analysis, then computes `hasContactInfo` from `resumeContent.personalInfo?.contact?.email` / `.linkedIn` (line 25-29) and persists history with `resumeContent`.

---

### 6. `backend/src/controllers/analysis/generateAnalysis.ts`

- `generateAnalysis` (line 6): controller endpoint.
- `convertResumeToText(content)` (line 136): serializes a `ResumeContent` into plain text for the AI — uses `contact.email/whatsapp/linkedIn`, `experience[].highlights`, `projects[].highlights`, flat `skills`.
- `transformToAnalysisData` (line 177) + scoring/feedback helpers (`generateOverallFeedback`, `generateStrengths`, `generateWeaknesses`, `calculateATSScore`, `generateATSSuggestions`, `generateJobMatchSuggestions`): build the analysis response (unrelated to schema, but consume the converted text).

---

### 7. `backend/src/services/aiAnalysis/index.ts`

- `analyzeResume` (line 796): orchestrates the full analysis (ATS breakdown + job match).
- `calculateJobMatchingScore` (line 458) + keyword helpers: match against job description.
- `extractSkillsFromResume(resume)` (line 1046): collects flat `resume.skills` + skills mined via `experienceText(exp)` / `projectText(proj)` + `proj.technologies`.
- `extractTechFromText(text)` (line 1079): mines tech tokens from a text string.
- `extractSkillsFromText(text)` (line 1168), `categorizeMissingKeywords` (line 1199): taxonomy-based categorization.
- `fallbackAnalysis` (line 1296): deterministic fallback when AI fails.

---

### 8. `backend/src/services/analysis/keywordExtractor.ts`

- `SKILL_TAXONOMY` (line 18), `ACTION_VERBS` (line 171), `INDUSTRY_TERMS` (line 252): reference vocabularies.
- `extractKeywords(text)` (line 331): tokenizes + counts matches vs the taxonomy.
- `extractSkillsFromResume(resume)` (line 421): flat `resume.skills` + `experience/project.highlights` + `technologies`.
- `parseJobDescription(jdText)` (line 471): extracts job title, required skills, responsibilities.
- `escapeRegex` (line 540), `countOccurrences` (line 544): helpers.

---

### 9. `backend/src/services/analysis/scoringEngine.ts`

- `ScoreCalculator` (abstract, line 12): base class.
- `KeywordMatchingCalculator.calculate` (line 81): scores keyword density from `resumeText`.
- `SkillsMatchCalculator.calculate` (line 253): compares resume skills vs required (flat `skills`).
- `SectionCompletenessCalculator.calculate` (line 441): checks critical/optional sections present (reads `contact`, `skills`, `experience`, `projects`).
- `ExperienceRelevanceCalculator.calculate` (line 613): relevance of `experience.highlights` to job description.

---

### 10. `backend/src/services/analysis/analysisService.ts`

- `ResumeAnalysisService` (line 45): main analysis orchestrator (singleton exported at line 989).
- `analyze(input)` (line 61): runs ATS + job-match scoring.
- `calculateATSScore` (line 146): combines keyword/skills/sections/experience calculators.
- `calculateJobMatchScore` (line 197), `calculateWeightedATSScore` (line 266), `calculateWeightedJobMatchScore` (line 282): weighted aggregation.
- `calculateYearsOfExperience` (line 836), `calculateDuration` (line 917): date math on `experience.startDate/endDate`.
- `calculateConfidenceScore` (line 958), `calculateCompletenessScore` (line 977): reads flat `resume.skills`, `experience`, `projects`, `education`.

---

## Notes

- Backend typecheck: `cd backend && npx tsc --noEmit --ignoreDeprecations 5.0`
  - 4 pre-existing errors remain: `src/services/aiAnalysis/index.ts` (711, 849-850) and `src/services/analysis/scoringEngine.ts` (584).
  - `backend/tsconfig.json` line 14 has pre-existing invalid `"ignoreDeprecations": "6.0"`, which breaks plain `npm run build`.
