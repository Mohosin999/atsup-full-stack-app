/**
 * Regex + string helpers for dictionary-based parsing (no LLM).
 * All regex logic is encapsulated here so callers never handle regex directly.
 */

// ---- Contact extraction ----
export const extractEmail = (text: string): string => {
  const match = text.match(/[\w.+-]+@[\w-]+\.[\w.-]+/);
  return match ? match[0] : "";
};

export const extractPhone = (text: string): string => {
  const match = text.match(/(?:\+?\d[\d\s\-().]{7,}\d)/);
  return match ? match[0].trim() : "";
};

export const extractLinkedIn = (text: string): string => {
  const match = text.match(
    /(?:https?:\/\/)?(?:www\.)?(?:linkedin\.com\/in\/|linkedin\.com\/)[\w\-./]+/i,
  );
  return match ? match[0] : "";
};

export const extractGithub = (text: string): string => {
  const match = text.match(
    /(?:https?:\/\/)?(?:www\.)?(?:github\.com\/|github\.io\/)[\w\-./]+/i,
  );
  return match ? match[0] : "";
};

export const extractPortfolio = (text: string): string => {
  // Prefer explicit links first (http/https/www).
  const explicit = text.match(
    /(?:\bhttps?:\/\/)?(?:www\.)[\w-]+\.(?:com|net|org|dev|io|me|link|site|app|xyz|info)\b[\w\-./]*/i,
  );
  const candidate = explicit ? explicit[0] : "";

  // Exclude social/known non-portfolio domains.
  if (/(linkedin|github|gitlab|behance|dribbble|twitter|facebook|fb\.)/i.test(candidate)) {
    return "";
  }

  if (candidate) return candidate;

  // Fallback: bare domains, but only when they are NOT the email domain.
  const emailDomain = (text.match(/[\w.-]+@([\w-]+\.\w+)/) || [])[1] || "";
  const bare = text.match(
    /(?:\bhttps?:\/\/)?(?:www\.)?[\w-]+\.(?:com|net|org|dev|io|me|link|site|app|xyz|info)\b[\w\-./]*/i,
  );
  if (!bare) return "";
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
export const countWords = (text: string): number => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return words.length;
};

// ---- Measurable results ----
export const MEASURABLE_RESULT_RE =
  /(?:\d+(?:\.\d+)?)\s*(?:%|x|x|×|hours?|hrs?|days?|weeks?|months?|years?|times?|\+|\$|USD|Tk|BDT)/i;

export const extractMeasurableResults = (text: string): string[] => {
  const results: string[] = [];
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    if (MEASURABLE_RESULT_RE.test(line)) {
      results.push(line.slice(0, 200));
    }
  }
  // De-duplicate while preserving order
  return Array.from(new Set(results));
};

// ---- Dates ----
export const NORMAL_DATE_RE =
  /^(?:present|current|now|ongoing|to date|till date|till now|until now|\d{1,2}[\/-]\d{2}(?:\/\d{4}|\d{2})?|\d{4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{0,4})$/i;

const SINGLE_DATE_TOKEN =
  /\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{0,4}|present|current|now|ongoing/i;

/** A line that is purely a date range, e.g. "Jan 2021 - Present" or "2018 - 2020". */
export const DATE_RANGE_RE = new RegExp(
  `^\\s*(${SINGLE_DATE_TOKEN.source})\\s*[-–—]\\s*(${SINGLE_DATE_TOKEN.source})\\s*$`,
  "i",
);

export const parseExperienceYears = (raw: string): number => {
  const m = String(raw).match(/(\d+)\s*(?:[-+]|\+)?\s*(?:years?|yrs?)/i);
  return m ? parseInt(m[1], 10) : 0;
};

export const ISO_ISH_DATE_RE = /^(?:\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}|\d{4}[\/-]\d{1,2}[\/-]\d{1,2})$/;