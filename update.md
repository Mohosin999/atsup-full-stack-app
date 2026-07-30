# Resume Parsing — Complete Flow with Code

```
 Tomar resume format e problem ta clear. Parser er 4 ta experience pattern er kono tai match kore na, karon:                                                                                      
                                                                                                                                                                                                      
     1. Title-Tiya Company-Date format nei — Parser expects lines like:                                                                                                                               
        - "Frontend Developer @ Company (Jan 2020 - Dec 2022)"                                                                                                                                        
        - "Frontend Developer, Company (Jan 2020 - Dec 2022)"                                                                                                                                         
                                                                                                                                                                                                      
        Kintu tomar resume e company name nei, date nei experience section e, and title ("Frontend Developer (Freelance)") description er pore ashe (ulto)                                            
        .                                                                                                                                                                                             
                                                                                                                                                                                                      
     2. Bullet points age, title pore — Parser prottekta line individually check kore regex diye. • Developed a secure web app... ei line gulo kono                                                   
        pattern e match kore na (title+company+date expected), tai skip hoye jay.                                                                                                                     
                                                                                                                                                                                                      
     3. "Frontend Developer (Freelance)" — ei line e (Freelance) date na, parser eta date hishebe parse korte pare na. Company name o nei.                                                            
                                                                                                                                                                                                      
     Solution: Resume e experience section format e ektu change koro:                                                                                                                                 
                                                                                                                                                                ⬖ Getting started                ✕    
     Frontend Developer (Freelance)                                                                                                                                                                   
     • Developed a secure web app...                                                                                                                              OpenCode includes free models       
     • Designed a responsive UI...                                                                                                                                so you can start immediately.       
                                                                                                                                                                                                      
     Ar company name na thakle "Frontend Developer @ Freelance (Time Period)" format e dile best match kore.                                                      Connect from 75+ providers to       
                                                                                                               
```

## File Reference

| # | File | Role |
|---|------|------|
| 1 | `frontend/src/pages/AtsScore.tsx` | User triggers file upload |
| 2 | `frontend/src/api/api.ts` | Axios call to backend |
| 3 | `backend/src/routes/index.ts` | Route registration |
| 4 | `backend/src/routes/resumeParser.ts` | Route + multer middleware |
| 5 | `backend/src/config/multer.ts` | File storage, validation, size limit |
| 6 | `backend/src/config/env.ts` | `maxFileSize` config |
| 7 | `backend/src/controllers/resumeParser/parseResume.ts` | Controller — calls service, cleans up file |
| 8 | `backend/src/services/resumeParser/index.ts` | **Core parser** — PDF/DOCX → text → ResumeContent |
| 9 | `backend/src/types/index.ts` | `ResumeContent` type definition |

---

## Step 1: User Uploads File (Frontend)

**File:** `frontend/src/pages/AtsScore.tsx`

User selects a PDF file from the file input. The `onChange` handler calls `handleFileUpload`:

```tsx
// AtsScore.tsx — line 155-161 (file input)
<input
  type="file"
  className="hidden"
  accept=".pdf"
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (file) await handleFileUpload(file);
  }}
/>
```

`handleFileUpload` creates a `FormData`, appends the file with key `"resume"`, and calls the API:

```tsx
// AtsScore.tsx — line 61-76
const handleFileUpload = async (file: File) => {
  try {
    setLoading(true);
    const formData = new FormData();
    formData.append("resume", file);                        // key = "resume"
    const response = await resumeParserApi.parse(formData); // POST /api/resume-parser/parse
    console.log("Parsed Resume Data:", response.data.data); // <-- console log for debugging
    setResumeName(response.data.data.resumeName);
    setResumeContent(response.data.data.resumeContent);
    setStep("jobDescription");
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Failed to upload resume");
  } finally {
    setLoading(false);
  }
};
```

---

## Step 2: API Call (Frontend → Backend)

**File:** `frontend/src/api/api.ts`

`resumeParserApi` sends a `POST` request with `multipart/form-data`:

```typescript
// api.ts — line 116-120
export const resumeParserApi = {
  parse: (formData: FormData) => api.post('/resume-parser/parse', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
};
```

- **URL:** `{VITE_API_URL}/resume-parser/parse` (defaults to `/api/resume-parser/parse`)
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`
- **Body:** FormData with file under key `"resume"`

---

## Step 3: Route Registration

**File:** `backend/src/routes/index.ts`

The resume parser route is mounted at `/api/resume-parser`:

```typescript
// routes/index.ts — line 34
{ path: '/api/resume-parser', router: resumeParserRoutes },
```

---

## Step 4: Route + Middleware Chain

**File:** `backend/src/routes/resumeParser.ts`

Three things happen in order: authenticate → multer saves file → controller runs:

```typescript
// routes/resumeParser.ts — full file
import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { upload } from '../config/multer';
import { parseResume } from '../controllers/resumeParser/parseResume';

const router = Router();

router.use(authenticate);  // Step 4a: JWT auth check

router.post('/parse', upload.single('resume'), parseResume);
//                       ^^^^^^^^^^^^^^^^^^^   Step 4b: multer saves file
//                                            Step 4c: controller runs

export default router;
```

**Middleware execution order:**
1. `authenticate` — checks JWT token, rejects if not logged in
2. `upload.single('resume')` — multer saves the file to disk
3. `parseResume` — controller function runs with `req.file` populated

---

## Step 5: Multer Saves File to Disk

**File:** `backend/src/config/multer.ts`

Multer handles the file upload — validates type, saves to disk with UUID name:

```typescript
// config/multer.ts — full file
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { env } from './env';

const isVercel = process.env.VERCEL === '1';

// Choose upload directory
let uploadsDir: string;
if (isVercel) {
  uploadsDir = '/tmp/uploads';
} else {
  uploadsDir = path.join(__dirname, '..', '..', 'uploads');
}

// Create directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Disk storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);                    // Save to /uploads
  },
  filename: (_req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);                    // e.g., "a1b2c3d4-e5f6-....pdf"
  },
});

// File type filter
const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',                                                              // PDF
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',      // DOCX
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);   // Accept
  } else {
    cb(null, false);  // Reject silently (no error passed)
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.maxFileSize,   // Default: 10MB (10 * 1024 * 1024)
  },
});
```

**What multer does:**
1. Receives the multipart form data
2. Validates MIME type (PDF or DOCX only)
3. Saves file to `/uploads/{uuid}.pdf`
4. Populates `req.file` with: `{ path, originalname, mimetype, size, ... }`
5. Calls next middleware (the controller)

**File size limit from env:**

```typescript
// config/env.ts — line 37
maxFileSize: getEnvNumber('MAX_FILE_SIZE', 10 * 1024 * 1024),  // 10MB default
```

---

## Step 6: Controller Receives File

**File:** `backend/src/controllers/resumeParser/parseResume.ts`

Controller gets the saved file path, calls the parser, deletes the file, returns JSON:

```typescript
// controllers/resumeParser/parseResume.ts — full file
import { Response } from 'express';
import { AuthRequest } from '../../middlewares';
import { parseResumeFile } from '../../services/resumeParser';
import fs from 'fs';

export const parseResume = async (req: AuthRequest, res: Response) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const filePath = req.file.path;         // e.g., "/uploads/a1b2c3d4-....pdf"
    const originalName = req.file.originalname;  // e.g., "my_resume.pdf"

    try {
      // CALL THE PARSER — this is where all the magic happens
      const resumeContent = await parseResumeFile(filePath, req.file.mimetype);

      // DELETE the temp file after parsing (cleanup)
      fs.unlinkSync(filePath);

      // Return parsed data
      return res.status(200).json({
        success: true,
        data: {
          resumeName: originalName,        // "my_resume.pdf"
          resumeContent,                   // ResumeContent object
        },
      });
    } catch (parseError: any) {
      // Cleanup on error too
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw parseError;
    }
  } catch (error: any) {
    console.error('Resume parse error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to parse resume',
    });
  }
};
```

**Key points:**
- `req.file.path` = where multer saved the file
- `req.file.mimetype` = MIME type (used to decide PDF vs DOCX)
- `fs.unlinkSync(filePath)` = deletes file after parsing (stateless, no persist)
- Response: `{ resumeName: "my_resume.pdf", resumeContent: { ... } }`

---

## Step 7: Core Parser — parseResumeFile

**File:** `backend/src/services/resumeParser/index.ts`

This is the main parsing engine. Entry point decides PDF vs DOCX:

```typescript
// services/resumeParser/index.ts — lines 1-15
import fs from 'fs';
import path from 'path';
import { ResumeContent } from '../../types';

export const parseResumeFile = async (filePath: string, mimeType: string): Promise<ResumeContent> => {
  const ext = path.extname(filePath).toLowerCase();  // ".pdf" or ".docx"

  if (ext === '.pdf') {
    return parsePDF(filePath);
  } else if (ext === '.docx') {
    return parseDOCX(filePath);
  } else {
    throw new Error('Unsupported file format');
  }
};
```

---

## Step 8: PDF Parsing

**File:** `backend/src/services/resumeParser/index.ts` — lines 17-28

Uses `pdf-parse` library to extract raw text from PDF:

```typescript
const parsePDF = async (filePath: string): Promise<ResumeContent> => {
  try {
    const pdf = require('pdf-parse');          // Dynamic import
    const dataBuffer = fs.readFileSync(filePath);  // Read file into buffer
    const data = await pdf(dataBuffer);        // Extract text from PDF

    // data.text = raw text content of the PDF
    // e.g., "John Doe\njohn@email.com\n+1234567890\n..."
    return parseTextToResume(data.text);       // Pass to text parser
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
};
```

**What pdf-parse does:**
- Reads the PDF binary buffer
- Extracts all text content (ignores images, formatting)
- Returns `{ text: "full raw text...", numpages: 2, ... }`
- The `data.text` string is what gets passed to `parseTextToResume`

---

## Step 9: DOCX Parsing

**File:** `backend/src/services/resumeParser/index.ts` — lines 30-40

Uses `mammoth` library to extract raw text from DOCX:

```typescript
const parseDOCX = async (filePath: string): Promise<ResumeContent> => {
  try {
    const mammoth = require('mammoth');        // Dynamic import
    const result = await mammoth.extractRawText({ path: filePath });

    // result.value = raw text content of the DOCX
    return parseTextToResume(result.value);    // Pass to text parser
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse DOCX file');
  }
};
```

**What mammoth does:**
- Opens the DOCX file
- Extracts raw text (ignores formatting, images, tables)
- Returns `{ value: "full raw text...", messages: [...] }`
- The `result.value` string is what gets passed to `parseTextToResume`

---

## Step 10: Text to ResumeContent Conversion

**File:** `backend/src/services/resumeParser/index.ts` — lines 42-189

This is the main parsing logic. Takes raw text and converts it to structured `ResumeContent`:

### 10a. Initialize and split into lines

```typescript
const parseTextToResume = (text: string): ResumeContent => {
  const lines = text.split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const content: ResumeContent = {
    personalInfo: {},
    experience: [],
    education: [],
    skills: [],
    projects: [],
  };
```

### 10b. Extract Contact Info (regex)

```typescript
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
  const linkedinRegex = /linkedin\.com\/in\/[a-zA-Z0-9-]+/gi;
  const urlRegex = /https?:\/\/[^\s]+/g;

  const emailMatch = text.match(emailRegex);
  const phoneMatch = text.match(phoneRegex);
  const linkedinMatch = text.match(linkedinRegex);
  const urlMatch = text.match(urlRegex);

  if (emailMatch) content.personalInfo.email = emailMatch[0];
  if (phoneMatch) content.personalInfo.whatsapp = phoneMatch[0];
  if (linkedinMatch) content.personalInfo.linkedIn = linkedinMatch[0];
  if (urlMatch) content.personalInfo.socialLinks = { portfolio: urlMatch[0] };
```

### 10c. Detect Name (first line heuristic)

```typescript
  const nameCandidate = lines[0];
  if (nameCandidate && !nameCandidate.includes('@') && nameCandidate.length < 50) {
    content.personalInfo.fullName = nameCandidate;
  }
```

### 10d. Detect Sections (regex pattern matching)

```typescript
  const sections: { [key: string]: { regex: RegExp; order: number } } = {
    summary:    { regex: /^(summary|objective|profile|professional\s+summary|about\s+me)/i, order: 0 },
    experience: { regex: /^(experience|work\s+experience|employment|professional\s+experience|work\s+history)/i, order: 1 },
    education:  { regex: /^(education|academic|qualification|academic\s+background)/i, order: 2 },
    skills:     { regex: /^(skills|technical\s+skills|core\s+competencies|technologies|tech\s+stack)/i, order: 3 },
    projects:   { regex: /^(projects|portfolio|key\s+projects|personal\s+projects|side\s+projects)/i, order: 4 },
  };

  const sectionPositions: { [key: string]: number } = {};

  // Find line number where each section starts
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const [section, { regex }] of Object.entries(sections)) {
      if (regex.test(line)) {
        sectionPositions[section] = i;  // e.g., { experience: 5, skills: 12, ... }
        break;
      }
    }
  }
```

### 10e. Extract Section Content

```typescript
  // Sort sections by their position in the document
  const sortedSections = Object.entries(sectionPositions)
    .sort(([, a], [, b]) => a - b)
    .map(([section]) => section);

  // For each section, extract content between this section header and the next
  for (let i = 0; i < sortedSections.length; i++) {
    const currentSection = sortedSections[i];
    const nextSection = sortedSections[i + 1];
    const startIdx = sectionPositions[currentSection] + 1;
    const endIdx = nextSection ? sectionPositions[nextSection] : lines.length;

    const sectionContent = lines.slice(startIdx, endIdx).join(' ');

    switch (currentSection) {
      case 'summary':
        if (sectionContent.length > 10) {
          content.summary = sectionContent;
        }
        break;
      case 'skills':
        // Split by comma, semicolon, pipe, or bullet
        const skillMatches = sectionContent
          .split(/[,;|•\n]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 1 && s.length < 40);
        if (skillMatches.length > 0) {
          content.skills = [...new Set(skillMatches)];  // Deduplicate
        }
        break;
      case 'experience':
        content.experience = parseExperienceSection(lines.slice(startIdx, endIdx));
        break;
      case 'education':
        content.education = parseEducationSection(lines.slice(startIdx, endIdx));
        break;
      case 'projects':
        content.projects = parseProjectsSection(lines.slice(startIdx, endIdx));
        break;
    }
  }
```

### 10f. Skill Fallback (scan full text for known skills)

```typescript
  // If no skills section was found, scan the entire text for common tech skills
  if (content.skills.length === 0) {
    const commonSkills = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'PHP',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'NestJS', 'Next.js',
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQL', 'Firebase', 'Elasticsearch',
      'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub',
      'HTML', 'CSS', 'SASS', 'Tailwind', 'REST', 'GraphQL', 'API', 'Linux',
    ];

    for (const skill of commonSkills) {
      if (text.toLowerCase().includes(skill.toLowerCase())) {
        if (!content.skills.includes(skill)) {
          content.skills.push(skill);
        }
      }
    }
  }

  return content;
};
```

---

## Step 11: Experience Sub-Parser

**File:** `backend/src/services/resumeParser/index.ts` — lines 191-322

Parses job entries using 4 regex patterns + heuristic fallback:

```typescript
const parseExperienceSection = (lines: string[]): ResumeContent['experience'] => {
  const experiences: ResumeContent['experience'] = [];

  // 4 regex patterns to match different resume formats
  const expPatterns = [
    /^(.+?)\s*(?:@|at)\s*(.+?)\s*[\(\(]([^)]+)[\)\)]/i,   // "Engineer @ Google (2020-2023)"
    /^(.+?),\s*(.+?)\s*[\(\(]([^)]+)[\)\)]/i,               // "Engineer, Google (2020-2023)"
    /^(.+?)\s*[-–]\s*(.+?)\s*[\(\(]([^)]+)[\)\)]/i,        // "Engineer - Google (2020-2023)"
    /^(.+?)\s*\|\s*(.+?)\s*\|\s*(.+)/i,                     // "Engineer | Google | 2020-2023"
  ];

  const dateRegex = /(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s*\d{4}|\d{1,2}\/\d{4}|\d{4}\s*[-–]\s*(?:present|current|\d{1,2}\/\d{4}|\d{4})/gi;
  const companyKeywords = /\b(Inc|LLC|Ltd|Corp|Co|Company|Technologies|Solutions|Systems|Labs|Studio|Group)\b/i;
  const titleKeywords = /\b(Engineer|Developer|Manager|Director|Lead|Senior|Junior|Intern|Analyst|Consultant|Architect|Designer|Specialist)\b/i;

  let currentExp: Partial<ResumeContent['experience'][0]> = {};
  let descriptionLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    // Try 4 regex patterns
    let expMatch = null;
    for (const pattern of expPatterns) {
      expMatch = trimmed.match(pattern);
      if (expMatch) break;
    }

    // If no pattern matched, try heuristic (title keyword + company keyword)
    if (!expMatch) {
      const hasTitleKeyword = titleKeywords.test(trimmed);
      const hasCompanyKeyword = companyKeywords.test(trimmed);
      const hasDate = dateRegex.test(trimmed);

      if (hasTitleKeyword && (hasCompanyKeyword || hasDate)) {
        const parts = trimmed.split(/[,|–-]/).map(p => p.trim()).filter(p => p);
        if (parts.length >= 2) {
          currentExp = { title: parts[0], company: parts[1], description: '' };
          descriptionLines = [];
          continue;
        }
      }
    }

    if (expMatch) {
      // Save previous experience
      if (currentExp.title) {
        currentExp.description = descriptionLines.join(' ');
        experiences.push(currentExp as ResumeContent['experience'][0]);
      }
      // New experience entry
      currentExp = { title: expMatch[1]?.trim(), company: expMatch[2]?.trim(), description: '' };
      descriptionLines = [];
    } else if (trimmed.length > 20) {
      // Description line
      descriptionLines.push(trimmed);
    }
  }

  // Save last experience
  if (currentExp.title) {
    currentExp.description = descriptionLines.join(' ');
    experiences.push(currentExp as ResumeContent['experience'][0]);
  }

  return experiences;
};
```

---

## Step 12: Education Sub-Parser

**File:** `backend/src/services/resumeParser/index.ts` — lines 324-362

```typescript
const parseEducationSection = (lines: string[]): ResumeContent['education'] => {
  const education: ResumeContent['education'] = [];
  const eduRegex = /^(.+?)(?:,|\s+at\s+)(.+?)(?:\(|（)([^)]+)\)?/i;
  const degreeKeywords = /bachelor|master|phd|doctorate|bs|ba|ms|ma|b\.sc|m\.sc|b\.e|m\.e|b\.tech|m\.tech/i;
  const dateRegex = /\d{4}\s*[-–]\s*\d{4}|\d{4}\s*[-–]\s*(?:present|current)|\d{4}/gi;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length < 5) continue;

    const eduMatch = trimmed.match(eduRegex);
    const hasDegree = degreeKeywords.test(trimmed);
    const dateMatch = trimmed.match(dateRegex);

    if (eduMatch || hasDegree) {
      const eduEntry: ResumeContent['education'][0] = { institution: '', degree: '' };

      if (eduMatch) {
        eduEntry.degree = eduMatch[1]?.trim() || trimmed;
        eduEntry.institution = eduMatch[2]?.trim() || '';
      } else {
        eduEntry.degree = trimmed;
      }

      if (dateMatch) eduEntry.date = dateMatch[0];

      if (eduEntry.degree || eduEntry.institution) {
        education.push(eduEntry);
      }
    }
  }
  return education;
};
```

---

## Step 13: Projects Sub-Parser

**File:** `backend/src/services/resumeParser/index.ts` — lines 364-406

```typescript
const parseProjectsSection = (lines: string[]): ResumeContent['projects'] => {
  const projects: ResumeContent['projects'] = [];
  const techRegex = /(?:tech|technology|technologies|built\s+with|used|stack)[:\s]+(.+)/i;
  const linkRegex = /(https?:\/\/[^\s]+|github\.com\/[^\s]+)/gi;

  let currentProject: Partial<ResumeContent['projects'][0]> = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Short line with bullet/dash = new project name
    if (trimmed.length < 50 && !trimmed.includes(':') && (trimmed.includes('-') || trimmed.includes('•'))) {
      if (currentProject.name && currentProject.description) {
        projects.push(currentProject as ResumeContent['projects'][0]);
      }
      currentProject = {
        name: trimmed.replace(/^[-•]\s*/, ''),
        description: '',
        technologies: [],
      };
    } else if (trimmed.length > 10) {
      // Check for tech stack line
      const techMatch = trimmed.match(techRegex);
      if (techMatch) {
        currentProject.technologies = techMatch[1].split(/[,;|]/).map((t) => t.trim());
      } else {
        currentProject.description += ' ' + trimmed;
      }
      // Check for links
      const linkMatch = trimmed.match(linkRegex);
      if (linkMatch) {
        currentProject.links = { live: linkMatch[0] };
      }
    }
  }

  if (currentProject.name) projects.push(currentProject as ResumeContent['projects'][0]);
  return projects;
};
```

---

## Step 14: Response Returns to Frontend

The controller sends back:

```json
{
  "success": true,
  "data": {
    "resumeName": "my_resume.pdf",
    "resumeContent": {
      "personalInfo": {
        "fullName": "John Doe",
        "email": "john@email.com",
        "whatsapp": "+1234567890",
        "linkedIn": "linkedin.com/in/johndoe",
        "socialLinks": { "portfolio": "https://johndoe.dev" }
      },
      "summary": "Experienced software engineer with 5+ years...",
      "experience": [
        {
          "title": "Software Engineer",
          "company": "Google",
          "startDate": "2020",
          "endDate": "2023",
          "description": "Built scalable microservices..."
        }
      ],
      "education": [
        {
          "institution": "MIT",
          "degree": "Bachelor of Science in Computer Science",
          "date": "2016-2020"
        }
      ],
      "skills": ["JavaScript", "TypeScript", "React", "Node.js", "Python"],
      "projects": [
        {
          "name": "E-commerce Platform",
          "description": "Full-stack e-commerce solution...",
          "technologies": ["React", "Node.js", "MongoDB"],
          "links": { "live": "https://github.com/user/project" }
        }
      ]
    }
  }
}
```

---

## Step 15: Frontend Receives Data

**File:** `frontend/src/pages/AtsScore.tsx`

```tsx
// line 66-70
const response = await resumeParserApi.parse(formData);
console.log("Parsed Resume Data:", response.data.data);  // See full object in browser console
setResumeName(response.data.data.resumeName);             // "my_resume.pdf"
setResumeContent(response.data.data.resumeContent);       // ResumeContent object
setStep("jobDescription");                                // Move to Step 2
```

The `resumeContent` state is now available for:
- Step 2: User pastes job description
- Step 3: Click "Scan" → sends `resumeContent` + `jobDescription` to ATS analysis API

---

## Output Type: ResumeContent

**File:** `backend/src/types/index.ts` — lines 36-86

```typescript
export interface ResumeContent {
  personalInfo: {
    fullName?: string;
    jobTitle?: string;
    email?: string;
    whatsapp?: string;
    address?: { city?: string; division?: string; zipCode?: string; };
    linkedIn?: string;
    socialLinks?: { github?: string; portfolio?: string; website?: string; };
  };
  summary?: string;
  experience: Array<{
    company: string;
    title: string;
    location?: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    links?: { live?: string; github?: string; caseStudy?: string; };
    technologies?: string[];
  }>;
  achievements?: Array<{ title: string; description?: string; date?: string; }>;
  education: Array<{
    institution: string;
    degree: string;
    date?: string;
  }>;
  skills: string[];
  [key: string]: any;  // Index signature for extra fields
}
```

---

## Summary: Complete Chain

```
[1] User selects PDF file
      ↓
[2] handleFileUpload() creates FormData with key "resume"
      ↓
[3] resumeParserApi.parse() → POST /api/resume-parser/parse
      ↓
[4] authenticate middleware → JWT check
      ↓
[5] upload.single('resume') → multer saves to /uploads/{uuid}.pdf
      ↓
[6] parseResume controller → gets req.file.path
      ↓
[7] parseResumeFile(filePath, mimeType) → checks extension
      ↓
[8] .pdf → parsePDF() → pdf-parse extracts raw text
      ↓
[9] parseTextToResume(raw text)
      ↓
[10] Regex scans for: email, phone, LinkedIn, URLs
      ↓
[11] First line → name detection
      ↓
[12] Regex scans for section headers: summary, experience, education, skills, projects
      ↓
[13] Lines between headers → dispatched to sub-parsers
      ↓
[14] parseExperienceSection() → 4 regex patterns + heuristic
      ↓
[15] parseEducationSection() → degree keyword detection
      ↓
[16] parseProjectsSection() → tech stack + link extraction
      ↓
[17] Skill fallback → scans full text for 38 common skills (if no skills section found)
      ↓
[18] Returns ResumeContent object
      ↓
[19] Controller deletes temp file, sends JSON response
      ↓
[20] Frontend: setResumeContent() → data ready for ATS analysis
```
