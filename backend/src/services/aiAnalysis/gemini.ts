import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../../config/env';
import { ResumeContent } from '../../types';

const genAI = new GoogleGenerativeAI(env.geminiApiKey);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// AI Career Assistant System Prompt - Credit-Based Usage
const AI_CAREER_ASSISTANT_PROMPT = `
You are a professional AI Career Assistant with a strict real-time credit-based usage system.

User has limited credits. The system automatically deducts credits before you generate content.

Credit deduction rules (already handled by the system):
• Resume Build → 1 credit (already deducted)
• ATS Score Analysis / ATS Check → 1 credit (already deducted)
• Job Match Analysis / Job Fit Score → 1 credit (already deducted)
• Generate Section Content → 1 credit (already deducted)
• Improve Resume Section → 1 credit (already deducted)
• Resume Rewrite and Resume Optimization → 0 credits (FREE, no deduction)

Your responsibilities:
1. Provide high-quality, professional career assistance
2. Be concise and actionable in your responses
3. Focus on delivering value for the credits spent
4. For paid tasks, the system has already deducted credits - just provide the best result
5. For FREE tasks (Resume Rewrite/Optimization), provide help without any credit mention

Always be transparent and helpful. Maximize user's success with their credits.
`;

export interface AtsAnalysisResult {
  overallScore: number;
  sectionScores: {
    summary: { score: number; feedback: string };
    experience: { score: number; feedback: string };
    projects: { score: number; feedback: string };
    skills: { score: number; feedback: string };
    contactInfo: { score: number; feedback: string; hasContactInfo: boolean };
  };
  spellingGrammar: {
    score: number;
    errors: Array<{ type: string; message: string; suggestion: string }>;
  };
  atsFriendliness: number;
  suggestions: string[];
}

export interface JobMatchResult {
  matchPercentage: number;
  breakdown: {
    keywords: { score: number; matched: string[]; missing: string[] };
    skills: { score: number; matched: string[]; missing: string[] };
    education: { score: number; details: string };
    experience: { score: number; yearsMatched: number; yearsRequired?: number };
  };
  missingSkills: string[];
  missingKeywords: string[];
  suggestions: string[];
}

export interface AISectionSuggestion {
  section: string;
  content: string;
  tips: string[];
}

export const analyzeAtsScore = async (
  resume: ResumeContent,
  jobDescription?: string
): Promise<AtsAnalysisResult> => {
  const resumeText = JSON.stringify(resume, null, 2);

  const jobDescriptionSection = jobDescription
    ? `\n\nTarget Job Description:\n${jobDescription}\n\nUse the job description to provide more targeted feedback on keyword matching, skills relevance, and experience alignment.`
    : '';

  const prompt = `
Analyze this resume for ATS (Applicant Tracking System) compatibility and provide a detailed assessment.

Resume Content:
${resumeText}
${jobDescriptionSection}

Provide your analysis in the following JSON format ONLY (no additional text):
{
  "overallScore": number (0-100),
  "sectionScores": {
    "summary": { "score": number (0-100), "feedback": string },
    "experience": { "score": number (0-100), "feedback": string },
    "projects": { "score": number (0-100), "feedback": string },
    "skills": { "score": number (0-100), "feedback": string },
    "contactInfo": { "score": number (0-100), "feedback": string, "hasContactInfo": boolean }
  },
  "spellingGrammar": {
    "score": number (0-100),
    "errors": [
      { "type": "spelling" | "grammar" | "punctuation" | "formatting" | "redundancy" | "content/formatting" | "grammar/punctuation", "message": string, "suggestion": string }
    ]
  },
  "atsFriendliness": number (0-100),
  "suggestions": [string]
}

IMPORTANT: For the spellingGrammar.errors[].type field, ONLY use these exact values:
- "spelling"
- "grammar"
- "punctuation"
- "formatting"
- "redundancy"

Do NOT use "content/formatting" or "grammar/punctuation" - these will cause validation errors.

Return ONLY valid JSON.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('ATS Analysis error:', error);
    throw new Error('Failed to analyze resume ATS score');
  }
};

export const analyzeJobMatch = async (
  resume: ResumeContent,
  jobDescription: string,
  jobTitle?: string,
  company?: string
): Promise<JobMatchResult> => {
  const resumeText = JSON.stringify(resume, null, 2);

  const prompt = `
Analyze how well this resume matches the job description.

Resume Content:
${resumeText}

Job Title: ${jobTitle || 'Not specified'}
Company: ${company || 'Not specified'}

Job Description:
${jobDescription}

Provide your analysis in the following JSON format ONLY (no additional text):
{
  "matchPercentage": number (0-100),
  "breakdown": {
    "keywords": { "score": number (0-100), "matched": [string], "missing": [string] },
    "skills": { "score": number (0-100), "matched": [string], "missing": [string] },
    "education": { "score": number (0-100), "details": string },
    "experience": { "score": number (0-100), "yearsMatched": number, "yearsRequired": number }
  },
  "missingSkills": [string],
  "missingKeywords": [string],
  "suggestions": [string]
}

Evaluation criteria:
1. Keywords: Match important keywords from JD in resume
2. Skills: Compare required/preferred skills with resume skills
3. Education: Check if education requirements are met
4. Experience: Match years of experience and relevance

Return ONLY valid JSON.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    return analysis;
  } catch (error) {
    console.error('Job Match Analysis error:', error);
    throw new Error('Failed to analyze job match');
  }
};

export const generateSectionContent = async (
  section: string,
  context?: {
    jobTitle?: string;
    industry?: string;
    experience?: string;
    skills?: string[];
  }
): Promise<AISectionSuggestion> => {
  const contextStr = context
    ? `
Context:
- Job Title: ${context.jobTitle || 'Not specified'}
- Industry: ${context.industry || 'Not specified'}
- Experience: ${context.experience || 'Not specified'}
- Skills: ${context.skills?.join(', ') || 'Not specified'}
`
    : '';

  let prompt: string;

  if (section === 'Work Experience') {
    prompt = `
Generate exactly 3 bullet points for a ${context?.jobTitle || 'professional'} position.

${contextStr}

Follow this exact format (3 bullet points, each on its own line starting with •):
Example: "• Led development of customer-facing web applications using React and Node.js, improving user engagement by 35%
• Collaborated with cross-functional teams to deliver 15+ projects on time and within budget
• Mentored junior developers and conducted code reviews to ensure code quality standards"

The content should be:
- Exactly 3 bullet points
- Each bullet point on a separate line starting with •
- ATS-friendly (no tables, images, or complex formatting)
- Professional and compelling
- Focus on quantifiable achievements and key responsibilities
- Use action verbs (Led, Developed, Managed, Improved, etc.)

Provide your response in the following JSON format ONLY:
{
  "section": "${section}",
  "content": string (the generated content with 3 bullet points separated by newlines, each starting with •),
  "tips": [string] (tips for customizing this section)
}

Return ONLY valid JSON.
`;
  } else if (section === 'Project Description') {
    prompt = `
Generate exactly 3 bullet points for a project: "${context?.jobTitle || 'Project Name'}".
${context?.skills && context.skills.length > 0 ? `Technologies used: ${context.skills.join(', ')}.` : ''}

${contextStr}

Follow this exact format (3 bullet points, each on its own line starting with •):
Example: "• Developed a full-stack e-commerce platform using React, Node.js, and MongoDB with payment integration
• Implemented user authentication and authorization using JWT for secure access control
• Deployed application on AWS with CI/CD pipeline, reducing deployment time by 50%"

The content should be:
- Exactly 3 bullet points
- Each bullet point on a separate line starting with •
- ATS-friendly (no tables, images, or complex formatting)
- Professional and compelling
- Focus on key features, technologies used, and measurable outcomes
- Use action verbs (Developed, Implemented, Designed, Built, Created, etc.)

Provide your response in the following JSON format ONLY:
{
  "section": "${section}",
  "content": string (the generated content with 3 bullet points separated by newlines, each starting with •),
  "tips": [string] (tips for customizing this section)
}

Return ONLY valid JSON.
`;
  } else if (section === 'Technical Skills') {
    prompt = `
Generate exactly 10 technical skills for a ${context?.jobTitle || 'Software Developer'}.

${contextStr}

Follow this exact format (10 skills separated by commas, no bullet points):
Example: "React, JavaScript, Node.js, TypeScript, MongoDB, Docker, AWS, Git, REST APIs, GraphQL"

The skills should be:
- Exactly 10 skills
- Only use direct technology names, frameworks, or tools
- NO phrases like "with hands", "experience in", "developing skills", "proficiency in"
- NO descriptions, only pure skill names like: React, Python, Docker, AWS, Git, SQL, etc.
- Each skill should be a single technology, framework, or tool name

Provide your response in the following JSON format ONLY:
{
  "section": "${section}",
  "content": string (exactly 10 skills separated by commas, no bullet points),
  "tips": [string] (tips for customizing this section)
}

Return ONLY valid JSON.
`;
  } else {
    prompt = `
Generate a professional ${section} for a ${context?.jobTitle || 'professional'} based on their job title and skills.

${contextStr}

Follow this exact format (4-5 sentences, each sentence on its own line):
Example: "A self-motivated front-end developer with 4+ years of experience, skilled in building high-performance and scalable web applications using React, Next.js, and TypeScript. Experienced in developing RESTful APIs using Node.js and Express, JSON data handling, and integrating AI solutions using OpenAI and Gemini APIs. Quick learner with strong problem-solving and debugging skills."

The content should be:
- Exactly 4-5 complete sentences
- Each sentence on a separate line
- ATS-friendly (no tables, images, or complex formatting)
- Professional and compelling
- First sentence: Experience level and primary expertise
- Middle sentences: Key skills and technical competencies
- Final sentence: Personal qualities or soft skills

Provide your response in the following JSON format ONLY:
{
  "section": "${section}",
  "content": string (the generated content with sentences separated by newlines),
  "tips": [string] (tips for customizing this section)
}

Return ONLY valid JSON.
`;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from AI');
    }

    const suggestion = JSON.parse(jsonMatch[0]);
    return suggestion;
  } catch (error) {
    console.error('Section Generation error:', error);
    throw new Error('Failed to generate section content');
  }
};

export const improveResumeSection = async (
  section: string,
  currentContent: string
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
      throw new Error('Invalid response format from AI');
    }

    const improvement = JSON.parse(jsonMatch[0]);
    return improvement;
  } catch (error) {
    console.error('Section Improvement error:', error);
    throw new Error('Failed to improve section content');
  }
};
