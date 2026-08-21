# ATS Rule-Based System — Dictionary & Regex Locations

---

## 1. DICTIONARY FILES (unlimited-ats-check/dictionaries/)

### 1.1 Hard Skills Dictionary
- **File:** `backend/src/modules/unlimited-ats-check/dictionaries/hard-skills.dictionary.ts`
- **Line 6-564:** `HARD_SKILLS_DICTIONARY` — ~550 skill groups (canonical + aliases). Covers: programming languages, frontend frameworks & libraries, backend frameworks & runtimes, databases, cloud platforms & DevOps, version control & collaboration, data science/ML/AI, testing, security, UI/UX & design, mobile, miscellaneous/enterprise/tools.
- **Line 567-588:** `HARD_SKILL_STOPWORDS` — Set of 21 short generic programming words ("node", "express", "spring", "java", "go", "c", "r", "sql", "ai", "react", "vue", "angular", "html", "css", "net", "git", "agile", "mvc", "oop", "api") excluded when no dedicated skills section exists.

### 1.2 Soft Skills Dictionary
- **File:** `backend/src/modules/unlimited-ats-check/dictionaries/soft-skills.dictionary.ts`
- **Line 1-223:** `SOFT_SKILLS_DICTIONARY` — ~223 soft skill groups. Covers: communication, collaboration & teamwork, problem solving & thinking, leadership & influence, adaptability & learning, work style & execution, emotional & interpersonal, agile & modern work practices, AI/tech-specific soft skills, other high-value soft skills.

### 1.3 Education Dictionary
- **File:** `backend/src/modules/unlimited-ats-check/dictionaries/education.dictionary.ts`
- **Line 1-116:** `DEGREE_KEYWORDS` — ~116 degree keyword groups covering Bangladesh, India, UK, US/Canada, Australia/NZ, Europe, and international/general qualifications.
- **Line 118-219:** `FIELD_OF_STUDY_KEYWORDS` — ~102 field of study groups covering technology & computing, engineering, business & management, science & math, medical & health, social sciences/arts/law, and others.
- **Line 221-428:** `EDUCATION_LEVELS` — 7 large groups: secondary level (19 aliases), higher secondary (17 aliases), diploma/certificate/vocational (16 aliases), associate level (12 aliases), bachelor's/undergraduate (50 aliases), master's/postgraduate (45 aliases), doctoral (14 aliases).

### 1.4 Job Titles Dictionary
- **File:** `backend/src/modules/unlimited-ats-check/dictionaries/job-titles.dictionary.ts`
- **Line 1-286:** `JOB_TITLES_DICTIONARY` — ~286 job title strings. Covers: frontend, backend, full stack, mobile, software engineering general, DevOps/SRE/cloud/infrastructure, data/AI/ML, security, QA/testing, design, product & project, leadership/architecture, database, other tech roles, non-tech.

### 1.5 Matcher Utilities
- **File:** `backend/src/modules/unlimited-ats-check/dictionaries/matcher.ts`
- **Line 9-10:** `escapeRegex()` — Regex escape helper.
- **Line 12:** `normalize()` — Text normalization (lowercase + trim).
- **Line 34:** Dynamic regex builder — `new RegExp("(?<![\\w-])" + escaped + "(?![\\w-])", "i")` for whole-word boundary-aware matching.
- **Line 79:** Dynamic regex with global flag — Same pattern with `"gi"` for counting all occurrences.
- **Line 90:** `containsWord` — Same boundary pattern for single-word matching.
- **Line 19-63:** `matchDictionary()` — Core dictionary matching function, returns canonical names, deduplicates/shorter-contained-terms dropped.
- **Line 69-85:** `countDictionaryMatches()` — Counts total dictionary occurrences across all variants.

### 1.6 Regex Helpers
- **File:** `backend/src/modules/unlimited-ats-check/dictionaries/regex-helpers.ts`
- **Line 7-10:** `extractEmail()` — Email regex: `/[\w.+-]+@[\w-]+\.[\w.-]+/`
- **Line 12-15:** `extractPhone()` — Phone regex: `/(?:\+?\d[\d\s\-().]{7,}\d)/`
- **Line 17-22:** `extractLinkedIn()` — LinkedIn URL regex
- **Line 24-29:** `extractGithub()` — GitHub URL regex
- **Line 31-59:** `extractPortfolio()` — Multi-step portfolio URL extraction with:
  - Line 34: Explicit URL regex for common TLDs
  - Line 39: Social domain exclusion regex
  - Line 46: Email domain extraction regex
  - Line 48: Bare domain fallback regex
- **Line 62-65:** `countWords()` — Word counting regex via `split(/\s+/)`
- **Line 69-72:** `METRIC_TOKEN_RE` / `MEASURABLE_RESULT_RE` — Measurable result detection: numbers followed by units (%, x, times, seconds/minutes/hours/days/weeks/months/years, $, USD, Tk, BDT, k, million, billion, users, customers, clients, downloads, etc.)
- **Line 76-77:** `IMPACT_VERB_RE` — 80+ impact/achievement verbs (increase, boost, grow, reduce, decrease, improve, optimize, automate, accelerate, enhance, expand, double, triple, maximize, minimize, save, achieve, surpass, exceed, generate, deliver, drive, enable, maintain, manage, lead, build, develop, design, create, launch, scale, complete, etc.)
- **Line 81-82:** `METRIC_WORD_RE` — 25 business/performance metric words (sales, revenue, traffic, conversion, engagement, performance, efficiency, speed, load time, uptime, cost, profit, growth, productivity, accuracy, error rate, throughput, latency, retention, satisfaction, etc.)
- **Line 85-86:** `EXPERIENCE_DURATION_RE` — "X years of experience" scope detection
- **Line 110-111:** `NORMAL_DATE_RE` — Comprehensive date parsing (present/current/now/ongoing, numeric dates, year-only, month names)
- **Line 113-114:** `SINGLE_DATE_TOKEN` — Single date token regex
- **Line 117-120:** `DATE_RANGE_RE` — Dynamic date range regex built from SINGLE_DATE_TOKEN
- **Line 122-125:** `parseExperienceYears()` — Years of experience extraction
- **Line 127:** `ISO_ISH_DATE_RE` — ISO-ish date format regex

---

## 2. PARSER FILES (unlimited-ats-check/parsers/)

### 2.1 Resume Parser
- **File:** `backend/src/modules/unlimited-ats-check/parsers/resumeParser.ts`
- **Line 49-55:** `DEFAULT_LAYOUT` — Default layout info object.
- **Line 57-62:** `DEFAULT_FONT_CHECK` — Default font check info object.
- **Line 74-85:** `isLocationLike()` — Inline regex patterns:
  - Line 77: Employment type regex
  - Line 82: City/country location regex
- **Line 94-111:** `sanitizeName()` — Name validation:
  - Line 100: Word validation regex
  - Line 102: Email/URL rejection regex
  - Line 104-108: Section heading rejection regex
- **Line 120-129:** `detectJobTitle()` — Inline job title regex
- **Line 138-143:** `extractExperienceYears()` — Inline years regex
- **Line 204-249:** `parseDateString()` — Date parsing with inline regexes:
  - Line 208: Present/current check
  - Line 213-214: Year-only with optional month prefix
  - Line 218-219: Month name extraction
  - Line 226-227: Full month + year
  - Line 234: MM/YYYY format
  - Line 239: MM/DD/YYYY format
- **Line 251-267:** `getMonthNumber()` — Hardcoded month name-to-number map (12 entries)
- **Line 283-286:** `isTitleCaseLine()` — Title case detection regex
- **Line 288-293:** `isProjectNameLine()` — Section heading exclusion regex
- **Line 303:** `BULLET_RE` — Bullet point regex
- **Line 305-308:** `isContactLine()` — Contact line detection regexes (email, phone, URL)
- **Line 310-312:** `isLocationLine()` — Location detection regex (cities, countries)
- **Line 315-317:** `isEducationLine()` — Education detection regex
- **Line 320-360:** `isSectionHeading()` — Section heading detection with 6 inline regex blocks:
  - Line 324: Summary heading
  - Line 330: Experience heading
  - Line 336: Skills heading
  - Line 342: Education heading
  - Line 348: Projects heading
  - Line 354: Certifications heading
- **Line 362-371:** `isSummarySentence()` — Summary sentence detection regex
- **Line 455, 471, 476-478, 497-499, 507-508:** Inline regex for phase transitions (projects, certifications)
- **Line 549-562:** Address location detection inline regex
- **Line 800-803:** Inline bullet regex in `parseExperience`
- **Line 820-821:** Inline date-only check and date range split
- **Line 900-906:** `parseRoleHeader()` inline regexes:
  - Line 900: Bullet cleanup
  - Line 902-905: Month name spacing fix
  - Line 912-916: Action verb rejection
  - Line 920: Separators test
- **Line 932-934:** Full date range extraction regex (complex)
- **Line 945-946:** Fallback date extraction regex
- **Line 956:** Part separator regex
- **Line 999-1006:** Date range detection in projects with month name spacing fix
- **Line 1012:** Inline bullet regex in `parseProjects`
- **Line 1047:** Year-only range regex
- **Line 1097-1099:** `isDescriptionLine()` — Project description detection regex
- **Line 1108-1111:** `isLinkLabelLine()` — Link/preview label detection regexes
- **Line 1129-1130:** `DATE_LINE_RE` in `parseEducation()` — Education date range regex (named capture groups)
- **Line 1247-1261:** `detectDateFormatting()` — Date formatting consistency check regexes
- **Line 1263-1269:** `inferTone()` — Hardcoded tone thresholds

### 2.2 JD Parser
- **File:** `backend/src/modules/unlimited-ats-check/parsers/jdParser.ts`
- **Line 29-48:** `extractYears()` — Inline regex patterns:
  - Line 31: Years range regex
  - Line 40: Single years regex
- **Line 13-27:** `detectJobTitle()` — Uses `JOB_TITLES_DICTIONARY` for substring matching.

### 2.3 Resume Sections
- **File:** `backend/src/modules/unlimited-ats-check/parsers/resumeSections.ts`
- **Line 10-66:** `SECTION_KEYWORDS` — Array of 11 section definitions, each with multiple regex patterns:
  - Line 14: Contact (4 regex patterns)
  - Line 19: Summary (7 regex patterns)
  - Line 24: Experience (8 regex patterns)
  - Line 29: Projects (6 regex patterns)
  - Line 34: Education (5 regex patterns)
  - Line 39: Skills (9 regex patterns)
  - Line 44: Certifications (8 regex patterns)
  - Line 49: Achievements (7 regex patterns)
  - Line 54: Languages (2 regex patterns)
  - Line 59: Interests (4 regex patterns)
  - Line 64: References (2 regex patterns)
- **Line 68-84:** `isLikelySectionHeading()` — Inline validation regexes:
  - Line 73: Character validation
  - Line 74: Word exclusion

---

## 3. SCORING FILES (shared/scoring/)

### 3.1 Constants
- **File:** `backend/src/shared/scoring/constants.ts`
- **Line 1-7:** `CATEGORY_WEIGHTS` — Hardcoded weights: { hardSkills: 40, searchability: 25, formatting: 15, softSkills: 10, recruiterTips: 10 }
- **Line 10-35:** `TITLE_STOPWORDS` — Set of 21 job title stop words
- **Line 37-38:** `ROLE_NOUNS` — Regex for common role nouns
- **Line 40-41:** `ATS_DATE_RE` — ATS date format validation regex
- **Line 43-44:** `MEASURABLE_RESULT_RE` — Measurable result detection regex
- **Line 50-420:** `ACTION_VERBS` — Array of ~370 past-tense action verbs (A-Z)

### 3.2 Keywords
- **File:** `backend/src/shared/scoring/keywords.ts`
- **Line 3-5:** `escapeRegex()` — Regex escape helper
- **Line 11-17:** `normalizeJobTitle()` — Job title normalization regex
- **Line 46-48:** `getSkillVariants()` — Returns single canonical variant
- **Line 51-61:** `countVariantsInText()` — Dynamic regex building for alias/canonical matching

### 3.3 Searchability
- **File:** `backend/src/shared/scoring/searchability.ts`
- **Line 107-116:** ATS-friendly font name list (hardcoded suggestion string: "Arial, Calibri, Times New Roman, Verdana")

### 3.4 Utils
- **File:** `backend/src/shared/scoring/utils.ts`
- **Line 126-148:** `LEVEL_RANK` — Education level ranking map with 22 entries
- **Line 150-158:** `structureFactors` — Hardcoded 5-element boolean array for ATS friendliness scoring
- **Line 144-147:** Hardcoded contact scoring weights (email=50, phone=40, address=10)
- **Line 208-213:** `ACTION_VERBS_RE` — Dynamically built regex from ACTION_VERBS array

---

## 4. OTHER FILES

### 4.1 Shared Types
- **File:** `backend/src/shared/types/index.ts`
- **Line 582-598:** `DEFAULT_ANALYSIS_CONFIG` — Hardcoded weights & thresholds

### 4.2 Skill Normalizer (UNUSED)
- **File:** `backend/src/shared/skills/skillNormalizer.ts`
- **Line 10-246:** `SKILL_GROUPS` — ~137 SkillGroup objects with aliases (legacy, not active)
- **Line 249-259:** `SKILL_STOPWORDS` — Set of 9 stopwords
- **Line 266-268:** `normalizeKey()` — Key normalization regex
- **Line 282-292:** `GROUP_PATTERNS` — 137 dynamically built regex objects

---

## SUMMARY

| Category | File | Approx. Entries |
|---|---|---|
| Hard Skills Dictionary | `hard-skills.dictionary.ts` | ~550 groups + 21 stopwords |
| Soft Skills Dictionary | `soft-skills.dictionary.ts` | ~223 groups |
| Education Dictionary | `education.dictionary.ts` | ~330 groups (degrees + fields + levels) |
| Job Titles Dictionary | `job-titles.dictionary.ts` | ~286 entries |
| Regex Helpers | `regex-helpers.ts` | ~15 named regex patterns |
| Matcher Utilities | `matcher.ts` | 3 functions with dynamic regex |
| Resume Parser | `resumeParser.ts` | ~40+ inline regex patterns |
| JD Parser | `jdParser.ts` | 2 regex patterns |
| Resume Sections | `resumeSections.ts` | 62 section heading regexes |
| Scoring Constants | `constants.ts` | 370 action verbs + 5 exports |
| Scoring Keywords | `keywords.ts` | 3 functions with regex |
| Scoring Utils | `utils.ts` | 22-entry level rank map + 1 dynamic regex |
| Shared Types | `types/index.ts` | 1 analysis config object |
| Skill Normalizer (unused) | `skillNormalizer.ts` | ~137 skill groups + 9 stopwords |
