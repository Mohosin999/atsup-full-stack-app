import FingerprintJS from "@fingerprintjs/fingerprintjs";

let fpPromise: Promise<string> | null = null;

/**
 * Get browser fingerprint (cached per session).
 * Returns a stable hash string that identifies this browser+device.
 */
export const getFingerprint = (): Promise<string> => {
  if (!fpPromise) {
    fpPromise = (async () => {
      // Check cache first
      const cached = sessionStorage.getItem("cv_fingerprint");
      if (cached) return cached;

      const fp = await FingerprintJS.load();
      const result = await fp.get();
      const visitorId = result.visitorId;

      sessionStorage.setItem("cv_fingerprint", visitorId);
      return visitorId;
    })();
  }
  return fpPromise;
};
