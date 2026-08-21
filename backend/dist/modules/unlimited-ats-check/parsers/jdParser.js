import { HARD_SKILLS_DICTIONARY } from "../dictionaries/hard-skills.dictionary";
import { SOFT_SKILLS_DICTIONARY } from "../dictionaries/soft-skills.dictionary";
import { DEGREE_KEYWORDS, FIELD_OF_STUDY_KEYWORDS, EDUCATION_LEVELS, } from "../dictionaries/education.dictionary";
import { matchDictionary } from "../dictionaries/matcher";
import { JOB_TITLES_DICTIONARY } from "../dictionaries/job-titles.dictionary";
const detectJobTitle = (text) => {
    const lowerText = text.toLowerCase();
    let earliestIndex = Infinity;
    let detectedTitle = "";
    for (const title of JOB_TITLES_DICTIONARY) {
        const index = lowerText.indexOf(title.toLowerCase());
        if (index !== -1 && index < earliestIndex) {
            earliestIndex = index;
            detectedTitle = title;
        }
    }
    return detectedTitle;
};
const extractYears = (text) => {
    const range = text.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*(?:years?|yrs?)/i);
    if (range) {
        return {
            years: Math.round(parseFloat(range[2])),
            raw: range[0],
        };
    }
    const single = text.match(/(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)/i);
    if (single) {
        return {
            years: Math.round(parseFloat(single[1])),
            raw: single[0],
        };
    }
    return { years: 0, raw: "" };
};
export const parseJdByDictionary = (description) => {
    const text = description.trim();
    if (!text) {
        throw new Error("Job description is empty");
    }
    const lines = text
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
    const jobTitle = detectJobTitle(text);
    const hardSkills = matchDictionary(text, HARD_SKILLS_DICTIONARY);
    const softSkills = matchDictionary(text, SOFT_SKILLS_DICTIONARY);
    const degree = matchDictionary(text, DEGREE_KEYWORDS).find((d) => d.toLowerCase() !== "certification") || "";
    const field = matchDictionary(text, FIELD_OF_STUDY_KEYWORDS)[0] || "";
    const educationLevel = matchDictionary(text, EDUCATION_LEVELS)[0] || "";
    const years = extractYears(text);
    const json = {
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
    const structured = {
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
