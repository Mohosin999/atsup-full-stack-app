/* ===================================
Resume Summary Component
=================================== */
import { ResumeContent } from "../../types";

interface ResumeSummaryProps {
  content: ResumeContent;
  forPdf?: boolean;
}

export default function ResumeSummary({ content, forPdf }: ResumeSummaryProps) {
  const textColor = forPdf
    ? "text-gray-800"
    : "text-gray-800 dark:text-gray-800";
  const titleColor = forPdf ? "text-black" : "text-gray-800 dark:text-white";
  const borderColor = forPdf
    ? "border-gray-200"
    : "border-gray-200 dark:border-gray-300";

  const cleanHtmlContent = (html: string) => {
    return html
      .replace(/<p[^>]*>/gi, '<p>')
      .replace(/<span[^>]*>/gi, '<span>')
      .replace(/<strong[^>]*>/gi, '<strong>')
      .replace(/<em[^>]*>/gi, '<em>')
      .replace(/<u[^>]*>/gi, '<u>')
      .replace(/<ul[^>]*>/gi, '<ul>')
      .replace(/<ol[^>]*>/gi, '<ol>')
      .replace(/<li[^>]*>/gi, '<li>')
      .replace(/<br[^>]*>/gi, '<br>');
  };

  if (!content.summary) return null;

  return (
    <div className="mb-4">
      <h2
        className={`text-base font-bold ${titleColor} uppercase tracking-wide border-b ${borderColor} pb-1 mb-3`}
      >
        SUMMARY
      </h2>
      {content.summary.includes("<") && content.summary.includes(">") ? (
        <div
          className="text-sm ql-editor leading-relaxed"
          style={{ padding: 0, color: '#000000' }}
          dangerouslySetInnerHTML={{
            __html: cleanHtmlContent(content.summary),
          }}
        />
      ) : (
        <p className={`${textColor} text-sm leading-relaxed`}>
          {content.summary}
        </p>
      )}
    </div>
  );
}
