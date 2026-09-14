export const MAX_RESUMES = 5;
export const MAX_ATS_SCANS = 5;

export interface OldestInfo {
  name: string;
  sub?: string;
  date: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const fmtDate = (iso?: string) => {
  try {
    const d = new Date(iso || '');
    if (isNaN(d.getTime())) return '—';
    return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
  } catch {
    return '—';
  }
};

export const oldestResumeInfo = (items: any[]): OldestInfo | null => {
  if (!items.length) return null;
  const oldest = items[items.length - 1];
  const personalInfo = oldest?.content?.personalInfo || {};
  const name = personalInfo?.fullName || oldest?.metadata?.originalName || 'Untitled Resume';
  const sub = personalInfo?.jobTitle || undefined;
  return { name, sub, date: fmtDate(oldest?.createdAt) };
};

export const oldestScanInfo = (items: any[]): OldestInfo | null => {
  if (!items.length) return null;
  const oldest = items[items.length - 1];
  const name = oldest?.title || oldest?.resumeName || 'Untitled Scan';
  return { name, date: fmtDate(oldest?.createdAt) };
};

// export const limitMessage = (kind: 'resume' | 'scan', oldest: OldestInfo) => {
//   const item = oldest.sub ? `"${oldest.name}" (${oldest.sub})` : `"${oldest.name}"`;
//   const max = kind === 'resume' ? MAX_RESUMES : MAX_ATS_SCANS;
//   const noun = kind === 'resume' ? 'resumes' : 'scans';
//   return `You already have ${max} saved ${noun}. If you save this one, your oldest【${item} - ${oldest.date}】will be permanently deleted from the list.`;
// };

export const limitMessage = (kind: 'resume' | 'scan', oldest: OldestInfo) => {
  const item = oldest.sub ? `"${oldest.sub}"` : `"${oldest.name}"`;
  const max = kind === 'resume' ? MAX_RESUMES : MAX_ATS_SCANS;
  const noun = kind === 'resume' ? 'resumes' : 'scans';
  return `You already have ${max} saved ${noun}. If you save this one, your oldest【${item} - ${oldest.date}】will be permanently deleted from the list.`;
};