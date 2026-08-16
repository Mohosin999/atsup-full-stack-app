/**
 * Whole-word dictionary matching helpers used across the dictionary parsers.
 * Matching is case-insensitive and boundary-aware to avoid false positives.
 *
 * Dictionaries use grouped format: string[][] where each group is
 * [canonical, alias1, alias2, ...]. On match, the canonical (first) name is returned.
 */

export const escapeRegex = (str: string): string =>
  str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const normalize = (text: string): string => text.toLowerCase().trim();

/**
 * Find dictionary groups present in the given text as whole words.
 * Returns the canonical (first) name from each matched group.
 * Groups are checked in order; shorter contained terms are dropped.
 */
export const matchDictionary = (
  text: string,
  dictionary: string[][],
): string[] => {
  const haystack = text;
  const found: string[] = [];

  for (const group of dictionary) {
    if (!group || !group.length) continue;
    const canonical = group[0];

    // Check if ANY variant in the group matches
    let matched = false;
    for (const variant of group) {
      const escaped = escapeRegex(variant);
      const re = new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, "i");
      if (re.test(haystack)) {
        matched = true;
        break;
      }
    }

    if (matched) {
      // Deduplicate case-insensitively (only add canonical once per group)
      const key = canonical.toLowerCase();
      if (!found.some((f) => f.toLowerCase() === key)) {
        found.push(canonical);
      }
    }
  }

  // Drop short generic terms that are contained inside a longer matched term
  // (e.g. "Node" is redundant when "Node.js" is present).
  const filtered = found.filter(
    (entry) =>
      !found.some(
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
  dictionary: string[][],
): number => {
  const haystack = text;
  let total = 0;
  for (const group of dictionary) {
    if (!group || !group.length) continue;
    for (const variant of group) {
      const escaped = escapeRegex(variant);
      const re = new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, "gi");
      const matches = haystack.match(re);
      if (matches) total += matches.length;
    }
  }
  return total;
};

/** Returns true if text contains the exact word (case-insensitive). */
export const containsWord = (text: string, word: string): boolean => {
  const escaped = escapeRegex(word);
  return new RegExp(`(?<![\\w-])${escaped}(?![\\w-])`, "i").test(text);
};
