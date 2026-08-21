// import { getSkillAliases } from "../skills/skillNormalizer";
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
// ============================================================
// Job Title Normalization
// ============================================================
function normalizeJobTitle(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "")
        .trim();
}
export function jobTitleMatches(resumeText, jdTitle) {
    if (!jdTitle)
        return false;
    const normalizedJd = normalizeJobTitle(jdTitle);
    const normalizedResume = normalizeJobTitle(resumeText);
    if (!normalizedJd)
        return false;
    if (normalizedResume.includes(normalizedJd))
        return true;
    const jdTokens = normalizedJd.split(/\s+/).filter(Boolean);
    return jdTokens.length > 0 && jdTokens.every((t) => normalizedResume.includes(t));
}
// NOTE: maybe no need it anymore
export function extractSkillsFromResume(resume) {
    const skills = [];
    if (Array.isArray(resume.skills)) {
        resume.skills.forEach((skill) => {
            if (skill && typeof skill === "string") {
                skills.push(skill.toLowerCase().trim());
            }
        });
    }
    return skills;
}
export function getSkillVariants(canonical) {
    // return getSkillAliases(canonical);
    return [canonical];
}
export function countVariantsInText(text, variants) {
    const textLower = text.toLowerCase();
    return variants.reduce((total, variant, index) => {
        const isAlias = index > 0;
        const escaped = escapeRegex(variant);
        const pattern = isAlias
            ? `(?<![\\w.-])${escaped}(?![\\w-])`
            : `\\b${escaped}\\b`;
        const matches = textLower.match(new RegExp(pattern, "gi"));
        return total + (matches ? matches.length : 0);
    }, 0);
}
