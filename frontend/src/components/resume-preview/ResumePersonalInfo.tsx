/* ===================================
Resume Personal Info Component
=================================== */
import { ResumeContent } from "../../types";

interface ResumePersonalInfoProps {
  content: ResumeContent;
  forPdf?: boolean;
}

export default function ResumePersonalInfo({
  content,
  forPdf = false,
}: ResumePersonalInfoProps) {
  // Format phone number with (+880) prefix
  const formatPhoneNumber = (phone: string) => {
    const cleanNumber = phone.replace(/^(\+880|880)/, "");
    return `(+880) ${cleanNumber}`;
  };

  // Format LinkedIn URL - just show the path
  const formatLinkedIn = (linkedIn: string) => {
    const clean = linkedIn.replace(/^https?:\/\//, "").replace(/^www\./, "");
    return clean.startsWith("linkedin.com/in/")
      ? clean
      : `linkedin.com/in/${linkedIn}`;
  };

  // Build location string (comma after city, then spaces)
  const locationParts = [
    content.personalInfo.contact?.address?.city,
    content.personalInfo.contact?.address?.state,
  ].filter(Boolean);
  const locationString =
    locationParts.length > 0
      ? locationParts[0] +
        (locationParts.length > 1 ? ", " : "") +
        locationParts.slice(1).join(" ")
      : "";

  return (
    <div className="px-6 pt-6 pb-6">
      <div className="flex justify-between items-start">
        {/* Left Side - Name and Title */}
        <div className="min-w-[220px]">
          <h1 className="text-5xl font-bold text-[#222222] uppercase tracking-wide leading-tight">
            {content.personalInfo.fullName || "MOHOSIN HASAN AKASH"}
          </h1>
          {content.personalInfo.jobTitle && (
            <p className="text-lg font-medium text-[#222222] mt-1.5 leading-tight">
              {content.personalInfo.jobTitle}
            </p>
          )}
        </div>

        {/* Right Side - Contact Info */}
        <div className="mt-auto items-end text-right min-w-[200px]">
          {/* First Line: Location • Phone */}
          <div className="text-sm text-[#222222] leading-snug">
            <span>
              {[
                locationString || "",
                content.personalInfo.contact?.phone
                  ? formatPhoneNumber(content.personalInfo.contact.phone)
                  : "",
              ]
                .filter(Boolean)
                .join(" • ")}
            </span>
          </div>
          {/* Second Line: Email • LinkedIn */}
          <div className="text-sm text-[#222222] leading-snug mt-0.5">
            <span>
              {[
                content.personalInfo.contact?.email || "",
                content.personalInfo.contact?.linkedIn
                  ? formatLinkedIn(content.personalInfo.contact.linkedIn)
                  : "",
              ]
                .filter(Boolean)
                .join(" • ")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
