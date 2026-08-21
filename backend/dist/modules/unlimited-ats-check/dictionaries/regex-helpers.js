/**
 * Regex + string helpers for dictionary-based parsing (no LLM).
 * All regex logic is encapsulated here so callers never handle regex directly.
 */
// ---- Contact extraction ----
export const extractEmail = (text) => {
    const match = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
    return match ? match[0] : "";
};
export const extractPhone = (text) => {
    const match = text.match(/(?:\+?\d[\d\s\-().]{7,}\d)/);
    return match ? match[0].trim() : "";
};
export const extractLinkedIn = (text) => {
    const match = text.match(/(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com\/in\/|linkedin\.com\/)[\w\-./]+/i);
    return match ? match[0] : "";
};
export const extractGithub = (text) => {
    const match = text.match(/(?:https?:\/\/)?(?:www\.)?(?:github\.com\/|github\.io\/)[\w\-./]+/i);
    return match ? match[0] : "";
};
export const extractPortfolio = (text) => {
    // Prefer explicit links first (http/https/www).
    const explicit = text.match(/(?:\bhttps?:\/\/)?(?:www\.)[\w-]+\.(?:com|net|org|dev|io|me|link|site|app|xyz|info)\b[\w\-./]*/i);
    const candidate = explicit ? explicit[0] : "";
    // Exclude social/known non-portfolio domains.
    if (/(linkedin|github|gitlab|behance|dribbble|twitter|facebook|fb\.)/i.test(candidate)) {
        return "";
    }
    if (candidate)
        return candidate;
    // Fallback: bare domains, but only when they are NOT the email domain.
    const emailDomain = (text.match(/[\w.-]+@([\w-]+\.\w+)/) || [])[1] || "";
    const bare = text.match(/(?:\bhttps?:\/\/)?(?:www\.)?[\w-]+\.(?:com|net|org|dev|io|me|link|site|app|xyz|info)\b[\w\-./]*/i);
    if (!bare)
        return "";
    const bareCandidate = bare[0];
    if (/(linkedin|github|gitlab|behance|dribbble|twitter|facebook|fb\.)/i.test(bareCandidate)) {
        return "";
    }
    if (emailDomain && bareCandidate.toLowerCase().endsWith(emailDomain.toLowerCase())) {
        return "";
    }
    return bareCandidate;
};
// ---- Counting ----
export const countWords = (text) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
};
// ---- Measurable results ----
// A metric token: a number followed by a unit (% , time, money, scale, count).
const METRIC_TOKEN_RE = /(?:\d+(?:\.\d+)?)\s*(?:%|x|×|times?|seconds?|secs?|minutes?|mins?|hours?|hrs?|days?|weeks?|months?|years?|\+|\$|USD|Tk|BDT|k|million|billion|ms|users|customers|clients|downloads|requests|products|countries|cities|developers|members|features|pages|projects|orders|sales|leads|conversions?|signups?|subscribers|followers|impressions|clicks|queries)/i;
export const MEASURABLE_RESULT_RE = METRIC_TOKEN_RE;
// Achievement/impact verbs that mark a line as a quantified outcome rather
// than a role-scope statement or a plain sentence.
const IMPACT_VERB_RE = /\b(?:increase|increased|increasing|boost|boosted|boosting|grow|grew|grown|growing|reduce|reduced|reducing|decrease|decreased|decreasing|cut|cutting|slash|slashed|lower|lowered|lowering|improve|improved|improving|improvement|optimize|optimized|optimizing|streamline|streamlined|automate|automated|accelerate|accelerated|speed|speeding|sped|enhance|enhanced|expand|expanded|double|doubled|triple|tripled|maximize|maximized|minimize|minimized|raise|raised|save|saved|saving|achieve|achieved|surpass|surpassed|exceed|exceeded|generate|generated|generating|deliver|delivered|delivering|drive|drove|driven|enable|enabled|maintain|maintained|handle|handled|manage|managed|managing|lead|led|built|build|develop|developed|developing|design|designed|create|created|launch|launched|scale|scaled|complete|completed|completion)\b/i;
// Business/performance metric words that, combined with a number, signal a
// quantified outcome even when the line lacks an explicit impact verb.
const METRIC_WORD_RE = /\b(?:sales|revenue|traffic|conversion|conversions|engagement|performance|efficiency|speed|load\s*time|response\s*time|uptime|cost|expense|profit|margin|growth|productivity|accuracy|error\s*rate|bounce\s*rate|downtime|throughput|latency|retention|satisfaction|savings|turnaround|completion|coverage|downloads)\b/i;
// Lines like "3+ years of experience ..." describe role scope, not impact.
const EXPERIENCE_DURATION_RE = /\b\d+(?:\.\d+)?\s*\+?\s*(?:years?|yrs?)\s+of\s+experience\b/i;
export const extractMeasurableResults = (text) => {
    const results = [];
    const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
        if (line.length > 300)
            continue;
        if (!METRIC_TOKEN_RE.test(line))
            continue;
        // "3+ years of experience ..." is a role-scope statement, not a result.
        if (EXPERIENCE_DURATION_RE.test(line) && !IMPACT_VERB_RE.test(line))
            continue;
        const hasImpactVerb = IMPACT_VERB_RE.test(line);
        const hasMetricWord = METRIC_WORD_RE.test(line);
        if (hasImpactVerb || hasMetricWord) {
            results.push(line.slice(0, 200));
        }
    }
    // De-duplicate while preserving order
    return Array.from(new Set(results));
};
// ---- Dates ----
export const NORMAL_DATE_RE = /^(?:present|current|now|ongoing|to date|till date|till now|until now|\d{1,2}[\/-]\d{1,2}(?:\/\d{4}|\d{2})?|\d{1,2}[\/-]\d{2,4}|\d{4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{0,4})$/i;
const SINGLE_DATE_TOKEN = /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{1,2}[\/-]\d{2,4}|\d{4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{0,4}|present|current|now|ongoing/i;
/** A line that is purely a date range, e.g. "Jan 2021 - Present" or "2018 - 2020". */
export const DATE_RANGE_RE = new RegExp(`^\\s*(${SINGLE_DATE_TOKEN.source})\\s*[-–—]\\s*(${SINGLE_DATE_TOKEN.source})\\s*$`, "i");
export const parseExperienceYears = (raw) => {
    const m = String(raw).match(/(\d+)\s*(?:[-+]|\+)?\s*(?:years?|yrs?)/i);
    return m ? parseInt(m[1], 10) : 0;
};
export const ISO_ISH_DATE_RE = /^(?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2})$/;
