import { useLayoutEffect, useRef, useState } from "react";
import { ResumeContent } from "../../types";
import { ATS_STYLE, buildAtsResumeMarkup } from "../../utils/atsResume";

interface AtsResumePreviewProps {
  content: ResumeContent;
}

// A4 @96dpi — same width the PDF prints at, so line-breaks match.
const A4_WIDTH = 794;

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

  return (
    <div ref={outerRef} className="w-full overflow-hidden">
      <div style={{ height: paperHeight * scale }}>
        <div
          ref={paperRef}
          className="bg-white box-shadow overflow-hidden"
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
        </div>
      </div>
    </div>
  );
}
