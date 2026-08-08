/**
 * Whole-word dictionary matching helpers used across the dictionary parsers.
 * Matching is case-insensitive and boundary-aware to avoid false positives.
 */

export const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const normalize = (text: string): string => text.toLowerCase().trim();

/**
 * Find dictionary entries present in the given text as whole words.
 * Returns entries in the order they appear in the dictionary.
 */
export const matchDictionary = (
  text: string,
  dictionary: string[],
): string[] => {
  const haystack = text;
  const found: string[] = [];
  for (const entry of dictionary) {
    const escaped = escapeRegex(entry);
    const re = new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, "i");
    if (re.test(haystack)) found.push(entry);
  }
  // De-duplicate case-insensitively while preserving first-seen order.
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const entry of found) {
    const key = entry.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(entry);
    }
  }

  // Drop short generic terms that are contained inside a longer matched term
  // (e.g. "Node" is redundant when "Node.js" is present).
  const filtered = unique.filter(
    (entry) =>
      !unique.some(
        (other) =>
          other !== entry &&
          other.toLowerCase().includes(entry.toLowerCase()) &&
          entry.length < other.length,
      ),
  );

  return filtered;
};

/**
 * Count total occurrences of any dictionary entry in the text
 * (used for e.g. action-verb counts).
 */
export const countDictionaryMatches = (
  text: string,
  dictionary: string[],
): number => {
  const haystack = text;
  let total = 0;
  for (const entry of dictionary) {
    const escaped = escapeRegex(entry);
    const re = new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, "gi");
    const matches = haystack.match(re);
    if (matches) total += matches.length;
  }
  return total;
};

/** Returns true if text contains the exact word (case-insensitive). */
export const containsWord = (text: string, word: string): boolean => {
  const escaped = escapeRegex(word);
  return new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, "i").test(text);
};
