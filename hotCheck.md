# ATS Score Check Flow — Serial Code Walkthrough

## Entry Point
- **Frontend** sends POST `/api/ats-score-history/analyze` with body:
  ```json
  {
    "resumeName": "My Resume",
    "jobDescription": "...",
    "structuredJD": { "skills": { "hardSkills": [...], "softSkills": [...] }, ... },
    "aiResearch": { "personal_info": {...}, "experience": [...], "skills": {...}, ... }
  }
  ```
  - `aiResearch` = resume er AI research JSON (from `researchResume()`)
  - `structuredJD` = JD er AI research JSON (from `researchJobDescription()`)

---

## Step 1: Controller Entry
**File:** `backend/src/controllers/atsScoreHistory/index.ts:82`

```
analyzeAtsScore(req, res)
```
- `req.body` theke extract kore: `resumeName`, `jobDescription`, `structuredJD`, `aiResearch`
- Validation: `aiResearch` must be present, na thakle 400 error

---

## Step 2: Map AI Resume JSON → Internal Format
**File:** `backend/src/controllers/atsScoreHistory/index.ts:33`

```
mapAIResearchToResumeContent(aiResearch) → ResumeContent
```
- AI format ke internal `ResumeContent` format e convert kore:
  - `ai.personal_info` → `personalInfo` (name, jobTitle, contact with email/phone/linkedIn)
  - `ai.summary` → `summary`
  - `ai.experience[]` → `experience[]` (title, company, location, highlights)
  - `ai.education[]` → `education[]` (degree, field, education_level)
  - `ai.skills.hardSkills + softSkills` → `skills[]`, `hardSkills[]`, `softSkills[]`
  - `ai.projects[]` → `projects[]` (name, highlights, link)
  - `ai.certifications[]` → `certifications[]`
- Purpose: ATS score engine e `ResumeContent` type lage, AI format different

---

## Step 3: Map AI JD JSON → Internal Format
**File:** `backend/src/controllers/atsScoreHistory/index.ts:12`

```
mapAIJobToStructuredJD(aiJD) → StructuredJD
```
- JD AI format ke internal `StructuredJD` format e convert kore:
  - `aiJD.jobTitle` → `jobTitle`
  - `aiJD.skills.hardSkills` → `hardSkills[]`
  - `aiJD.skills.softSkills` → `softSkills[]`
  - `aiJD.education.field + degree` → `educationRequirement` (pipe-separated string e.g. "Computer Science|Bachelor's")
  - `aiJD.yearsOfExperience` → `experienceYearsRequired` (regex diye number extract, e.g. "3-5 years" → 3)
  - `actionVerbs: []` (empty, AI theke extract hoyna)
- Purpose: Score engine e `StructuredJD` type lage

---

## Step 4: Credit Check
**File:** `backend/src/controllers/atsScoreHistory/index.ts:110-124`

```
prisma.user.findUnique() → credits check
```
- User er credits check kore, 1 credit lagbe ATS score er jonno
- Credits < 1 hole 403 error

---

## Step 5: Create Score History (Main Calculation)
**File:** `backend/src/services/atsScoreHistory/index.ts:6`

```
createAtsScoreHistory(userId, resumeName, resumeContent, jobDescription, structuredJD, aiResearch)
```

### Step 5a: Calculate Local Match Score
**File:** `backend/src/services/atsScoreEngine/index.ts:1039`

```
calculateLocalMatchScore(resumeContent, structuredJD) → LocalAtsResult
```

Ei function e sob kaj hoy. Serially:

#### 5a.1 — Resume Text Build
**File:** `atsScoreEngine/index.ts:118`
```
toResumeText(resume) → string
```
- Resume er sob section ke single string e join kore (name, title, summary, experience, skills, projects, education)
- Purpose: Text matching er jonno

#### 5a.2 — Extract Skills
**File:** `atsScoreEngine/index.ts:1046`
```
extractSkillsFromResume(resume) → string[]
```
- `resume.skills[]` array theke skills extract kore, lowercase e
- AI research theke `hardSkills[]` thakle sei take use kore, na hole ei extracted skills

#### 5a.3 — Calculate Years of Experience
**File:** `atsScoreEngine/index.ts:224`
```
calculateYearsOfExperience(resume) → number
```
- Sob experience entry theke startDate/endDate parse kore, months count kore, total years ber kore

#### 5a.4 — Count Measurable Results
**File:** `atsScoreEngine/index.ts:253`
```
countMeasurableResults(resume) → { count, found }
```
- Experience er highlights theke regex diye check kore: `\d+%|\d+x|\$|\d+\s*(hours?|days?|weeks?|months?|years?)`
- Jodi number/percentage/money/thaka thake, sei ta measurable result

#### 5a.5 — Match Action Verbs (Currently Disabled)
**File:** `keywordExtractor.ts:101`
```
matchActionVerbs(text) → [] (empty, hardcoded return [])
```
- Function exists but always returns empty array — disabled

#### 5a.6 — Skill Matching (If JD Present)
**File:** `atsScoreEngine/index.ts:1075-1101`
```
buildMatchCategory(resumeText, jd.hardSkills, isSkillPresent) → MatchCategoryResult
buildMatchCategory(resumeText, jd.softSkills, isSkillPresent) → MatchCategoryResult
buildMatchCategory(resumeText, jd.actionVerbs, isActionVerbPresent) → MatchCategoryResult
```
- JD er hard skills ke resume text e search kore (variant matching diye)
- Match/missing items ber kore
- Score = matched / total * 100

#### 5a.7 — Build 5 Categories

**1. Searchability (30% weight)**
**File:** `atsScoreEngine/index.ts:594`
```
buildSearchability(resume, resumeText, jd, eduScore) → CategoryResult
```
Sub-groups:
- **Contact Info (30 pts)**: email, phone, address check (`buildContactInfoSubgroup`)
- **Section Headings (30 pts)**: education/experience section ache kina (`buildSectionHeadingsSubgroup`)
- **Job Title Match (20 pts)**: JD er job title resume e ache kina (`buildJobTitleSubgroup`)
- **Date Formatting (10 pts)**: dates ATS-friendly format e ache kina, regex: `MM/YY, MM/YYYY, Month YYYY` (`buildDateFormattingSubgroup`)
- **Education Match (10 pts)**: resume education JD er requirement match kore kina (`buildEducationMatchSubgroup`)

**2. Hard Skills (35% weight)**
**File:** `atsScoreEngine/index.ts:626`
```
buildHardSkills(resume, resumeHardSkills, jd, hardSkillsMatch) → CategoryResult
```
- JD thakle: matched skills count / total skills count
- JD na thakle: resume e joto skills ache, setar base e score

**3. Soft Skills (15% weight)**
**File:** `atsScoreEngine/index.ts:703`
```
buildSoftSkills(resume, jd, softSkillsMatch) → CategoryResult
```
- Hard skills er moto same logic, soft skills er jonno

**4. Recruiter Tips (10% weight)**
**File:** `atsScoreEngine/index.ts:929`
```
buildRecruiterTips(resume, jd, resumeYears, measurable, actionVerbCount) → CategoryResult
```
Sub-groups:
- **Summary (30 pts)**: 30+ words thakle passed, kom thakle partial/failed
- **Job Level Match (30 pts)**: resume years >= JD required years
- **Measurable Results (20 pts)**: 5+ measurable results thakle passed
- **Action Verbs (20 pts)**: 5+ action verbs thakle passed (currently disabled, always fail)

**5. Formatting (10% weight)**
**File:** `atsScoreEngine/index.ts:960`
```
buildFormatting(resume, atsFriendliness) → CategoryResult
```
Checks:
- Standard sections present (experience + education + skills)
- Summary section present
- Skills section 5+
- Work experience present
- File-level checks (fonts, tables, icons) = always "na" (PDF analysis needed)

#### 5a.8 — Calculate Overall Score
**File:** `atsScoreEngine/index.ts:1209`
```
overallScore = (searchability.score * 30 + hardSkills.score * 35 + softSkills.score * 15 + recruiterTips.score * 10 + formatting.score * 10) / 100
```

#### 5a.9 — Generate Suggestions
**File:** `atsScoreEngine/index.ts:1137-1155`
- Missing hard skills add koro
- Missing soft skills highlight koro
- Missing action verbs use koro
- Experience years match na hole suggest koro
- Summary 30+ words koro
- Projects section add koro
- Measurable results 5+ koro

---

### Step 5b: Contact Info Override
**File:** `atsScoreHistory/index.ts:16-23`
- Jodi AI research theke contact info (email/phone/linkedIn) pawa jay, kintu score engine e `hasContactInfo: false` thake, setake true kore override

### Step 5c: Save to Database
**File:** `atsScoreHistory/index.ts:27`
```
prisma.atsScoreHistory.create()
```
- Score result + resumeContent + aiResearch save hoy database e

---

## Step 6: Deduct Credit
**File:** `controllers/atsScoreHistory/index.ts:136`
```
prisma.user.update() → credits - 1
```

## Step 7: Return Response
**File:** `controllers/atsScoreHistory/index.ts:151`
- Response: `{ success: true, data: score, credits: remainingCredits }`

---

## File Summary

| File | Role |
|------|------|
| `controllers/atsScoreHistory/index.ts` | Entry point, maps AI JSON → internal format, credit check, save |
| `services/atsScoreHistory/index.ts` | Orchestrates score calculation + DB save |
| `services/atsScoreEngine/index.ts` | **Core rule-based scoring engine** — 5 categories, sub-groups, all logic |
| `services/analysis/keywordExtractor.ts` | Skill matching, action verb matching helpers |
| `services/jdParser/index.ts` | `StructuredJD` type definition only |

## Key Points
- AI diye kono score calculate hoyna — AI sirf resume/JD parse kore JSON banay
- Score calculation 100% rule-based (`atsScoreEngine`)
- JD action verbs always empty (disabled)
- File-level formatting checks (fonts, tables, icons) always "na" — PDF analysis lagbe
