export const sortItemsByDateDesc = <T>(
  items: T[],
  getDate: (item: T) => string | undefined,
): T[] => {
  const score = (raw?: string): number | null => {
    const value = raw?.trim() || "";
    if (!value) return null;
    const monthMatch = value.match(/^(\d{4})-(\d{2})/);
    if (monthMatch)
      return parseInt(monthMatch[1], 10) * 12 + parseInt(monthMatch[2], 10) - 1;
    const yearMatch = value.match(/(\d{4})/);
    if (yearMatch) return parseInt(yearMatch[1], 10) * 12 + 6;
    return null;
  };
  return [...items].sort((a, b) => {
    const sa = score(getDate(a));
    const sb = score(getDate(b));
    if (sa !== null && sb !== null) return sb - sa;
    if (sa === null && sb === null) return 0;
    return sa === null ? 1 : -1;
  });
};
