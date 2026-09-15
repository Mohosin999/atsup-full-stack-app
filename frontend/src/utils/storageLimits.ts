// Storage limits removed — unlimited saves.
// Kept for backward compat if any stale import remains (no-op).
export const MAX_RESUMES = Infinity as unknown as number;
export const MAX_ATS_SCANS = Infinity as unknown as number;
export interface OldestInfo { name: string; sub?: string; date: string; }
export const fmtDate = () => "";
export const oldestResumeInfo = () => null;
export const oldestScanInfo = () => null;
export const limitMessage = () => "";
