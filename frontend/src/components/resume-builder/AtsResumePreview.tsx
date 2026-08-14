import { ResumeContent } from "../../types";
import { ATS_STYLE, buildAtsResumeMarkup } from "../../utils/atsResume";

interface AtsResumePreviewProps {
  content: ResumeContent;
}

export default function AtsResumePreview({ content }: AtsResumePreviewProps) {
  return (
    <div className="rounded-xl bg-white shadow-lg overflow-hidden">
      <style>{ATS_STYLE}</style>
      <div
        className="ats-resume"
        dangerouslySetInnerHTML={{ __html: buildAtsResumeMarkup(content) }}
      />
    </div>
  );
}
