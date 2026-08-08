/* ===================================
ATS Resume Live Preview
Renders the exact same markup/CSS used
for the PDF export, scaled to fit.
=================================== */
import { useEffect, useRef, useState } from "react";
import { ResumeContent } from "../../types";
import { ATS_STYLE, buildAtsResumeMarkup } from "../../utils/atsResume";

const SHEET_WIDTH = 794;
const SHEET_HEIGHT = 1122;

interface AtsResumePreviewProps {
  content: ResumeContent;
}

export default function AtsResumePreview({ content }: AtsResumePreviewProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [sheetHeight, setSheetHeight] = useState(SHEET_HEIGHT);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => {
      setScale(Math.min(1, el.clientWidth / SHEET_WIDTH));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (sheetRef.current) {
      setSheetHeight(sheetRef.current.offsetHeight);
    }
  }, [content]);

  const markup = buildAtsResumeMarkup(content);

  return (
    <div ref={wrapRef} className="w-full">
      <div
        className="relative mx-auto overflow-hidden"
        style={{ height: Math.ceil(sheetHeight * scale) }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: SHEET_WIDTH,
            boxShadow: "0 12px 32px rgba(0,0,0,0.45)",
          }}
        >
          <style>{ATS_STYLE}</style>
          <div
            ref={sheetRef}
            className="ats-resume"
            dangerouslySetInnerHTML={{ __html: markup }}
          />
        </div>
      </div>
    </div>
  );
}
