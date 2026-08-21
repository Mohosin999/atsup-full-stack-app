import { CATEGORY_WEIGHTS } from "./constants";
import { deriveFeedback } from "./utils";
// =============================================================
// Hard skills
// =============================================================
export const buildHardSkills = (resumeHardSkills, jd, hardSkillsMatch) => {
    let checks = [
        {
            label: "Technical skills present",
            status: resumeHardSkills.length > 0
                ? "passed"
                : "failed",
            detail: `${resumeHardSkills.length} technical skill(s) identified.`,
            weight: 100,
        },
    ];
    let summary = `${resumeHardSkills.length} technical skills identified.`;
    let score = 0;
    let matched = [];
    let missing = [];
    if (jd && hardSkillsMatch.items.length > 0) {
        matched = hardSkillsMatch.matched;
        missing = hardSkillsMatch.missing;
        score = hardSkillsMatch.score;
        const total = matched.length + missing.length;
        checks = [
            {
                label: "Required hard skills matched",
                status: missing.length === 0 ? "passed" : "failed",
                detail: `${matched.length} of ${total} required technical skills found.`,
                weight: 100,
            },
            ...(missing.length > 0
                ? [
                    {
                        label: "Missing hard skills",
                        status: "failed",
                        detail: `Add: ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? "…" : ""}.`,
                        weight: 0,
                    },
                ]
                : []),
        ];
        summary = `${matched.length} of ${total} required technical skills matched.`;
    }
    else if (jd) {
        score = 0;
        missing = jd.skills?.hardSkills;
        checks = [
            {
                label: "Required hard skills matched",
                status: "failed",
                detail: "No job-required technical skills detected.",
                weight: 100,
            },
        ];
        summary =
            "No hard skills detected from your provided job description. Please add a perfect job description of your role before applying.";
    }
    const { strengths, improvements } = deriveFeedback(checks);
    return {
        key: "hardSkills",
        title: "Hard Skills",
        score,
        weight: CATEGORY_WEIGHTS.hardSkills,
        summary,
        checks,
        strengths,
        improvements,
        matched,
        missing,
    };
};
// =============================================================
// Soft skills
// =============================================================
export const buildSoftSkills = (resume, jd, softSkillsMatch) => {
    const resumeSoft = (resume.skills?.softSkills || []).filter(Boolean);
    let checks = [
        {
            label: "Soft skills highlighted",
            status: resumeSoft.length > 0
                ? "passed"
                : "failed",
            detail: resumeSoft.length > 0
                ? `${resumeSoft.length} soft skill(s) highlighted.`
                : "No explicit soft skills section.",
            weight: 100,
        },
    ];
    let summary = resumeSoft.length > 0
        ? `${resumeSoft.length} soft skill(s) highlighted.`
        : "Soft skills not explicitly listed.";
    let score = 0;
    let matched = [];
    let missing = [];
    if (jd && softSkillsMatch.items.length > 0) {
        matched = softSkillsMatch.matched;
        missing = softSkillsMatch.missing;
        score = softSkillsMatch.score;
        const total = matched.length + missing.length;
        checks = [
            {
                label: "Soft skills matched",
                status: missing.length === 0 ? "passed" : "failed",
                detail: `${matched.length} of ${total} soft skills found.`,
                weight: 100,
            },
        ];
        summary = `${matched.length} of ${total} expected soft skills found.`;
    }
    else if (jd) {
        score = 0;
        missing = jd.skills?.softSkills;
        checks = [
            {
                label: "Soft skills matched",
                status: "failed",
                detail: "No soft skills detected.",
                weight: 100,
            },
        ];
        summary =
            "No soft skills detected from job description. Please add a perfect job description of your role before applying.";
    }
    const { strengths, improvements } = deriveFeedback(checks);
    return {
        key: "softSkills",
        title: "Soft Skills",
        score,
        weight: CATEGORY_WEIGHTS.softSkills,
        summary,
        checks,
        strengths,
        improvements,
        matched,
        missing,
    };
};
