import { ResumeContent } from "@/types";

export function PersonalInfoPreview({
  content,
}: {
  content: ResumeContent;
  forPdf: boolean;
}) {
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
    content.personalInfo.contact?.address?.division,
    content.personalInfo.contact?.address?.zipCode,
  ].filter(Boolean);
  const locationString =
    locationParts.length > 0
      ? locationParts[0] +
        (locationParts.length > 1 ? ", " : "") +
        locationParts.slice(1).join(" ")
      : "";

  return (
    <div className="px-2 lg:px-6 pt-4 lg:pt-6 pb-4 lg:pb-6">
      <div className="flex justify-between items-start gap-2">
        {/* Left Side - Name and Title */}
        <div className="min-w-0 flex-1">
          <h1 className="text-base font-bold text-black uppercase tracking-wide leading-tight truncate">
            {content.personalInfo.fullName || ""}
          </h1>
          {content.personalInfo.jobTitle && (
            <p className="text-xs font-medium text-black mt-0.5 leading-tight truncate">
              {content.personalInfo.jobTitle}
            </p>
          )}
        </div>

        {/* Right Side - Contact Info */}
        <div className="mt-auto items-end text-right min-w-0">
          {/* First Line: Location • Phone */}
          <div className="text-[9px] lg:text-[10px] text-black leading-snug">
            <span className="truncate block">
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
          <div className="text-[9px] lg:text-[10px] text-black leading-snug mt-0.5 flex items-center justify-end gap-1 flex-wrap">
            {content.personalInfo.contact?.email && (
              <a
                href={`mailto:${content.personalInfo.contact.email}`}
                className="text-black truncate max-w-[120px] lg:max-w-none"
                style={{ color: "#000000" }}
              >
                {content.personalInfo.contact.email}
              </a>
            )}
            {content.personalInfo.contact?.email &&
              content.personalInfo.contact?.linkedIn && (
              <span className="text-black"> • </span>
            )}
            {content.personalInfo.contact?.linkedIn && (
              <a
                href={
                  content.personalInfo.contact.linkedIn.startsWith("http")
                    ? content.personalInfo.contact.linkedIn
                    : `https://${content.personalInfo.contact.linkedIn}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-black truncate max-w-[100px] lg:max-w-none"
                style={{ color: "#000000" }}
              >
                {formatLinkedIn(content.personalInfo.contact.linkedIn)}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
