/* ===================================
Pending ATS Scan Draft
Preserves the resume file + job description across a login round-trip.
- In-memory File keeps the exact file for SPA navigation (email login).
- A base64 copy in sessionStorage survives the full-page Google OAuth
  redirect (only for files small enough to fit the ~5MB quota).
=================================== */
const SESSION_KEY = "pendingScanDraft";
const MAX_DATA_URL_SIZE = 3 * 1024 * 1024; // 3MB

export interface ScanDraftData {
  resumeFile: File | null;
  resumeName: string;
  jobDescription: string;
}

interface SessionDraft {
  resumeName: string;
  jobDescription: string;
  resumeFileDataUrl?: string;
}

let memoryDraft: ScanDraftData | null = null;

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

export const saveScanDraft = async (
  resumeFile: File,
  resumeName: string,
  jobDescription: string,
) => {
  memoryDraft = { resumeFile, resumeName, jobDescription };

  const sessionDraft: SessionDraft = { resumeName, jobDescription };
  if (resumeFile.size <= MAX_DATA_URL_SIZE) {
    try {
      sessionDraft.resumeFileDataUrl = await readFileAsDataUrl(resumeFile);
    } catch {
      // ignore - the in-memory copy is still available
    }
  }

  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionDraft));
  } catch {
    // quota exceeded - the in-memory copy is still available
  }
};

export const getScanDraft = (): ScanDraftData | null => {
  if (memoryDraft) return memoryDraft;

  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    const draft = JSON.parse(raw) as SessionDraft;
    let file: File | null = null;
    if (draft.resumeFileDataUrl) {
      const [, b64] = draft.resumeFileDataUrl.split(",");
      const binary = atob(b64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      file = new File([bytes], draft.resumeName, { type: "application/pdf" });
    }
    return {
      resumeFile: file,
      resumeName: draft.resumeName,
      jobDescription: draft.jobDescription,
    };
  } catch {
    return null;
  }
};

export const clearScanDraft = () => {
  memoryDraft = null;
  sessionStorage.removeItem(SESSION_KEY);
};