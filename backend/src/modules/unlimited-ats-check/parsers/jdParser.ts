import { HARD_SKILLS_DICTIONARY } from "../dictionaries/hard-skills.dictionary";
import { SOFT_SKILLS_DICTIONARY } from "../dictionaries/soft-skills.dictionary";
import {
  DEGREE_KEYWORDS,
  FIELD_OF_STUDY_KEYWORDS,
  EDUCATION_LEVELS,
} from "../dictionaries/education.dictionary";
import { matchDictionary } from "../dictionaries/matcher";
import { DictionaryJdJson, JdParseOutput } from "../unlimitedAts.types";
import { StructuredJD } from "../../../shared/types";

const TITLE_KEYWORDS =
  /(Engineer|Developer|Designer|Manager|Analyst|Architect|Scientist|Consultant|Lead|Director|Specialist|Administrator|Coordinator|Tester|Researcher|Writer|Intern|Trainee|Executive|Head|Principal|Officer|Support|Recruiter|Data|Machine Learning|Software|Product|UX|UI|Full Stack|Full-Stack|Backend|Back-end|Frontend|Front-end|DevOps|QA|Cloud|Security|Mobile|Web)/i;

const detectJobTitle = (lines: string[]): string => {
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.length > 60) continue;
    if (/^\d/.test(line)) continue;
    if (/^about the role|^we are looking|^the role|^responsibilities|^requirements|^job description/i.test(line)) break;
    if (/\b(?:job|position|role|title)\b\s*:/i.test(line)) {
      const m = line.match(/:\s*(.+)/);
      if (m && m[1]) return m[1].trim();
    }
    if (
      TITLE_KEYWORDS.test(line) &&
      /^[A-Z][A-Za-z+.#&\-\s]+$/.test(line) &&
      !/^\s*[a-z]/.test(line) &&
      line.split(/\s+/).length <= 6
    ) {
      return line;
    }
  }
  return "";
};

const extractYears = (text: string): { years: number; raw: string } => {
  const range = text.match(
    /(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i,
  );
  if (range) {
    return {
      years: Math.round(parseFloat(range[2])),
      raw: range[0],
    };
  }

  const single = text.match(
    /(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)/i,
  );
  if (single) {
    return {
      years: Math.round(parseFloat(single[1])),
      raw: single[0],
    };
  }

  return { years: 0, raw: "" };
};

export const parseJdByDictionary = (description: string): JdParseOutput => {
  const text = description.trim();
  if (!text) {
    throw new Error("Job description is empty");
  }

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const jobTitle = detectJobTitle(lines);

  const hardSkills = matchDictionary(text, HARD_SKILLS_DICTIONARY);
  const softSkills = matchDictionary(text, SOFT_SKILLS_DICTIONARY);

  const degree =
    matchDictionary(text, DEGREE_KEYWORDS).find(
      (d) => d.toLowerCase() !== "certification",
    ) || "";
  const field = matchDictionary(text, FIELD_OF_STUDY_KEYWORDS)[0] || "";
  const educationLevel = matchDictionary(text, EDUCATION_LEVELS)[0] || "";

  const years = extractYears(text);

  const json: DictionaryJdJson = {
    jobTitle,
    education: {
      degree,
      field,
      education_level: educationLevel,
    },
    skills: {
      hardSkills,
      softSkills,
    },
    yearsOfExperience: years.raw,
  };

  const educationRequirement = [field, degree]
    .filter(Boolean)
    .join("|") || null;

  const structured: StructuredJD = {
    jobTitle,
    education: {
      degree,
      field,
      education_level: educationLevel,
    },
    skills: {
      hardSkills,
      softSkills,
    },
    yearsOfExperience: years.raw,
    experienceYearsRequired: years.years,
  };

  return { json, structured };
};
