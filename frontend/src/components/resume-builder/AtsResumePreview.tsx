import { useLayoutEffect, useRef, useState } from "react";
import { ResumeContent } from "../../types";
import { ATS_STYLE, buildAtsResumeMarkup } from "../../utils/atsResume";

interface AtsResumePreviewProps {
  content: ResumeContent;
}

// A4 @96dpi — same width the PDF prints at, so line-breaks match.
const A4_WIDTH = 794;
// Must match .ats-resume min-height / @page size — this is where the PDF paginates.
const PAGE_HEIGHT = 1122;

export default function AtsResumePreview({ content }: AtsResumePreviewProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const paperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [paperHeight, setPaperHeight] = useState(1122);

  // Shrink-only scale so the 794px layout always fits the column.
  // Layout width stays 794px (line-breaks identical to PDF), only visually scaled.
  useLayoutEffect(() => {
    const outer = outerRef.current;
    if (!outer) return;
    const update = () => {
      const w = outer.clientWidth;
      setScale(w >= A4_WIDTH || w === 0 ? 1 : w / A4_WIDTH);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(outer);
    return () => ro.disconnect();
  }, []);

  // Track paper height so the outer box wraps the scaled paper exactly.
  useLayoutEffect(() => {
    const paper = paperRef.current;
    if (!paper) return;
    const update = () => setPaperHeight(paper.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(paper);
    return () => ro.disconnect();
  }, [content]);

  const pages = Math.max(1, Math.ceil(paperHeight / PAGE_HEIGHT));
  const overflow = paperHeight > PAGE_HEIGHT;

  return (
    <div className="w-full">
      <div ref={outerRef} className="w-full overflow-hidden">
        <div style={{ height: paperHeight * scale }}>
          <div
            ref={paperRef}
            className="relative bg-white overflow-hidden border border-stone-200 dark:border-stone-700"
            style={{
              width: A4_WIDTH,
              maxWidth: "none",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            <style>{ATS_STYLE}</style>
            <div
              className="ats-resume"
              dangerouslySetInnerHTML={{ __html: buildAtsResumeMarkup(content) }}
            />

            {/* Page-break markers — preview only, not in PDF */}
            {Array.from({ length: pages - 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 pointer-events-none select-none"
                style={{ top: PAGE_HEIGHT * (i + 1) - 60 }}
                aria-hidden="true"
              >
                <div className="relative border-t-2 border-dashed border-red-400 dark:border-red-500">
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full whitespace-nowrap shadow">
                    End of page {i + 1} · continues on page {i + 2}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
