import { useEffect } from "react";
import api from "../api/api";

function generateFingerprint(): string {
  const stored = localStorage.getItem("cvcoach_fp");
  if (stored) return stored;

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "",
    navigator.platform || "",
  ];

  let hash = 0;
  const str = components.join("|||");
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  const fp = "fp_" + Math.abs(hash).toString(36);
  localStorage.setItem("cvcoach_fp", fp);
  return fp;
}

export function useVisitorTracking() {
  useEffect(() => {
    const track = async () => {
      try {
        const fingerprint = generateFingerprint();
        await api.post("/visitor/track", { fingerprint });
      } catch {
        // silent fail
      }
    };

    track();
  }, []);
}
