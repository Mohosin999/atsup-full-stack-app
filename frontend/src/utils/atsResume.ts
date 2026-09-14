/* ===================================
ATS-Friendly Resume HTML/CSS Builder
Shared by the live preview and the PDF
export so they always match exactly.
=================================== */
import { ResumeContent, SECTION_KEYS, SectionKey } from "../types";
import { sortItemsByDateDesc } from "./sort";

export const DEFAULT_SECTION_TITLES: Record<SectionKey, string> = {
  summary: "Summary",
  experience: "Work Experience",
  skills: "Skills",
  education: "Education",
  projects: "Projects",
  achievements: "Achievements",
  certifications: "Certifications",
};

export const getSectionTitle = (
  content: ResumeContent,
  key: SectionKey,
): string => content.sectionTitles?.[key]?.trim() || DEFAULT_SECTION_TITLES[key];

const escapeHtml = (value?: string): string =>
  (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const formatDate = (value?: string): string => {
  if (!value) return "";
  const match = value.trim().match(/^(\d{4})-(\d{2})/);
  if (!match) return value.trim();
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[parseInt(match[2], 10) - 1];
  return month ? `${month} ${match[1]}` : match[1];
};

const dateRange = (start?: string, end?: string, current?: boolean): string => {
  const startText = formatDate(start);
  const endText = current ? "Present" : formatDate(end);
  if (!startText && !endText) return "";
  if (!startText) return endText;
  return `${startText} - ${endText}`;
};

const formatPhone = (phone?: string): string => {
  if (!phone) return "";
  const trimmed = phone.trim();
  if (/^(\+880|880)/.test(trimmed)) {
    return `(+880) ${trimmed.replace(/^(\+880|880)/, "")}`;
  }
  return trimmed;
};

const formatLinkedIn = (linkedIn?: string): string => {
  if (!linkedIn) return "";
  let clean = linkedIn
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "");
  if (!clean.startsWith("linkedin.com/in/")) {
    clean = `linkedin.com/in/${clean}`;
  }
  return clean;
};

// padding: 40px 46px 46px;

export const ATS_STYLE = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  .ats-resume {
    width: 100%;
    min-height: 1122px;
    padding: 60px 56px 56px;
    background: #ffffff;
    color: #444444;
    font-size: 10pt;
    font-family: Inter, Calibri, Arial, Helvetica, "Times New Roman";
    line-height: 1.45;
  }
  .ats-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0px;
  }
  .ats-header-title-date {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0px;
  }
  .ats-name {
    font-size: 17pt;
    font-weight: 500;
    text-transform: capitalize;
    letter-spacing: 0.5px;
    line-height: 1.15;
    color: #333333;
  }
  .ats-job-title {
    font-size: 13pt;
    margin-top: 4px;
    color: #444444;
  }
  .ats-contact {
    text-align: right;
    font-size: 10pt;
    color: #444444;
    line-height: 1.55;
  }
  .ats-contact div {
    margin-bottom: 1px;
  }
  .ats-section {
    margin-top: 24px;
  }
  .ats-section-title {
    font-size: 13pt;
    font-weight: 500;
    text-transform: capitalize;
    letter-spacing: 0.5px;
    margin-bottom: 14px;
    color: #333333;
  }
  .ats-item {
    margin-bottom: 14px;
  }
  .ats-item-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }
  .ats-strong {
    font-size: 11pt;
    font-weight: 500;
    color: #333333;
  }
  .ats-date {
    font-size: 10pt;
    color: #444444;
    white-space: nowrap;
  }
  .ats-sub {
    font-size: 10pt;
    color: #333333;
    margin-top: 1px;
    font-style: italic;
    
  }
  .ats-location {
    font-style: normal;
    color: #444444;
  }
  .ats-description {
    font-size: 10pt;
    color: #444444;
    margin-top: 1px;
    font-style: normal;
  }
  .ats-bullets {
    margin: 8px 0 0 0;
    padding-left: 22px;
    list-style: disc;
    list-style-position: outside;
  }
  .ats-bullets li {
    margin-bottom: 2px;
  }
  .ats-skill-line {
    margin-bottom: 2px;
  }
  .ats-skill-category {
    font-size: 10pt;
    font-weight: 600;
    color: #333333;
    margin-top: 6px;
    margin-bottom: 1px;
  }
  .ats-links {
    font-size: 10pt;
    color: #444444;
    margin-top: 1px;
  }
.ats-links .sep {
    margin: 0 5px;
  }
  .ats-link {
    color: #333333;
    font-size: 9pt;
    text-decoration: none;
  }
  .ats-link:hover {
    text-decoration: underline;
  }
`;

const buildPersonalInfo = (content: ResumeContent): string => {
  const pi = content.personalInfo || {};
  const contact = pi.contact || {};
  const address = contact.address || {};
  const location = [address.city, address.state].filter(Boolean).join(", ");

  const contactLines: string[] = [];
  if (contact.email) contactLines.push(escapeHtml(contact.email));
  if (contact.phone) contactLines.push(escapeHtml(formatPhone(contact.phone)));
  if (location) contactLines.push(escapeHtml(location));
  if (contact.linkedIn)
    contactLines.push(escapeHtml(formatLinkedIn(contact.linkedIn)));

  return `<div class="ats-header">
    <div>
      ${pi.fullName ? `<div class="ats-name">${escapeHtml(pi.fullName)}</div>` : ""}
      ${
        pi.jobTitle
          ? `<div class="ats-job-title">${escapeHtml(pi.jobTitle)}</div>`
          : ""
      }
    </div>
    ${
      contactLines.length
        ? `<div class="ats-contact">${contactLines
            .map((line) => `<div>${line}</div>`)
            .join("")}</div>`
        : ""
    }
  </div>`;
};

const buildSummary = (content: ResumeContent): string => {
  if (!content.summary?.trim()) return "";
  return `<div class="ats-section">
    <div class="ats-section-title">${escapeHtml(
      getSectionTitle(content, "summary"),
    )}</div>
    <div>${escapeHtml(content.summary.trim())}</div>
  </div>`;
};

const buildExperience = (content: ResumeContent): string => {
  const items = sortItemsByDateDesc(
    content.experience || [],
    (exp) => exp.startDate,
  ).filter((exp) => exp.title?.trim() || exp.company?.trim());
  if (items.length === 0) return "";
  return `<div class="ats-section">
    <div class="ats-section-title">${escapeHtml(
      getSectionTitle(content, "experience"),
    )}</div>
    ${items
      .map((exp) => {
        const dr = dateRange(exp.startDate, exp.endDate, exp.current);
        const location = exp.location
          ? `<span class="ats-location"> · ${escapeHtml(exp.location)}</span>`
          : "";
        const bullets = (exp.highlights || []).filter((h) => h.trim());
        return `<div class="ats-item">
          <div class="ats-header-title-date">
            <div class="ats-strong">${escapeHtml(exp.title)}</div>
            ${dr ? `<div class="ats-date">${escapeHtml(dr)}</div>` : ""}
          </div>
          ${
            exp.company || exp.location
              ? `<div class="ats-sub">${escapeHtml(exp.company)}${location}</div>`
              : ""
          }
          ${
            bullets.length
              ? `<ul class="ats-bullets">${bullets
                  .map((b) => `<li>${escapeHtml(b)}</li>`)
                  .join("")}</ul>`
              : ""
          }
        </div>`;
      })
      .join("")}
  </div>`;
};

const buildSkills = (content: ResumeContent): string => {
  const categories = (content.skillCategories || []).filter(
    (cat) => cat.name?.trim() && (cat.skills || []).some((s) => s.trim()),
  );
  const flatSkills = (content.skills || []).filter((s) => s.trim());
  if (categories.length === 0 && flatSkills.length === 0) return "";

  const lines: string[] = [];

  if (flatSkills.length > 0) {
    lines.push(
      `<div class="ats-skill-line">${escapeHtml(flatSkills.join(", "))}</div>`,
    );
  }

  for (const cat of categories) {
    const skills = (cat.skills || []).filter((s) => s.trim());
    if (skills.length === 0) continue;
    lines.push(
      `<div class="ats-skill-category">${escapeHtml(cat.name)}</div>
  <div class="ats-skill-line">${escapeHtml(skills.join(", "))}</div>`,
    );
  }

  if (lines.length === 0) return "";
  return `<div class="ats-section">
    <div class="ats-section-title">${escapeHtml(
      getSectionTitle(content, "skills"),
    )}</div>
    ${lines.join("")}
  </div>`;
};

const buildEducation = (content: ResumeContent): string => {
  const items = sortItemsByDateDesc(
    content.education || [],
    (edu) => edu.startDate,
  ).filter(
    (edu) =>
      edu.institution?.trim() ||
      edu.degree?.trim() ||
      edu.areaOfStudy?.trim(),
  );
  if (items.length === 0) return "";
  return `<div class="ats-section">
    <div class="ats-section-title">${escapeHtml(
      getSectionTitle(content, "education"),
    )}</div>
    ${items
      .map((edu) => {
        const dr = dateRange(edu.startDate, edu.endDate);
        const study = [edu.areaOfStudy?.trim(), edu.degree?.trim()]
          .filter(Boolean)
          .join(" | ");
        const parts: string[] = [];
        if (edu.institution?.trim())
          parts.push(
            `<div class="ats-header-title-date"><div class="ats-strong">${escapeHtml(
              edu.institution.trim(),
            )}</div>${
              dr ? `<div class="ats-date">${escapeHtml(dr)}</div>` : ""
            }</div>`,
          );
        if (study) parts.push(`<div class="ats-bullet">${escapeHtml(study)}</div>`);
        if (edu.gpa?.trim())
          parts.push(
            `<div class="ats-bullet">GPA: ${escapeHtml(edu.gpa.trim())}</div>`,
          );
        return `<div class="ats-item">${parts.join("")}</div>`;
      })
      .join("")}
  </div>`;
};

const buildProjects = (content: ResumeContent): string => {
  const items = sortItemsByDateDesc(
    content.projects || [],
    (proj) => proj.startDate,
  ).filter((proj) => proj.name?.trim());
  if (items.length === 0) return "";
  return `<div class="ats-section">
    <div class="ats-section-title">${escapeHtml(
      getSectionTitle(content, "projects"),
    )}</div>
    ${items
      .map((proj) => {
        const dr = dateRange(proj.startDate, proj.endDate, proj.current);
        const links: string[] = [];
        if (proj.links?.live)
          links.push(
            `<a class="ats-link" href="${escapeHtml(
              proj.links.live,
            )}">Live link</a>`,
          );
        const bullets = (proj.highlights || []).filter((h) => h.trim());
        return `<div class="ats-item">
          <div class="ats-header-title-date">
            <div class="ats-strong">${escapeHtml(proj.name)}</div>
            ${dr ? `<div class="ats-date">${escapeHtml(dr)}</div>` : ""}
          </div>
          ${
            links.length
              ? `<div class="ats-links">${links.join(
                  '<span class="sep">|</span>',
                )}</div>`
              : ""
          }
          ${
            bullets.length
              ? `<ul class="ats-bullets">${bullets
                  .map((b) => `<li>${escapeHtml(b)}</li>`)
                  .join("")}</ul>`
              : ""
          }
        </div>`;
      })
      .join("")}
  </div>`;
};

const buildAchievements = (content: ResumeContent): string => {
  const items = sortItemsByDateDesc(
    content.achievements || [],
    (ach) => ach.date,
  ).filter((ach) => ach.title?.trim());
  if (items.length === 0) return "";
  return `<div class="ats-section">
    <div class="ats-section-title">${escapeHtml(
      getSectionTitle(content, "achievements"),
    )}</div>
    ${items
      .map(
        (ach) => `<div class="ats-item">
          <div class="ats-item-head"><span class="ats-strong">${escapeHtml(
            ach.title,
          )}</span>${
            ach.date ? `<span class="ats-date">${escapeHtml(ach.date)}</span>` : ""
          }</div>
          ${
            ach.description
              ? `<div class="ats-description">${escapeHtml(ach.description)}</div>`
              : ""
          }
        </div>`,
      )
      .join("")}
  </div>`;
};

const buildCertifications = (content: ResumeContent): string => {
  const items = sortItemsByDateDesc(
    content.certifications || [],
    (cert) => cert.date,
  ).filter((cert) => cert.name?.trim());
  if (items.length === 0) return "";
  return `<div class="ats-section">
    <div class="ats-section-title">${escapeHtml(
      getSectionTitle(content, "certifications"),
    )}</div>
    ${items
      .map(
        (cert) => `<div class="ats-item">
          <div class="ats-item-head"><span class="ats-strong">${escapeHtml(
            cert.name,
          )}</span>${
            cert.date ? `<span class="ats-date">${escapeHtml(cert.date)}</span>` : ""
          }</div>
          ${
            cert.issuer
              ? `<div class="ats-sub">${escapeHtml(cert.issuer)}</div>`
              : ""
          }
        </div>`,
      )
      .join("")}
  </div>`;
};

const SECTION_BUILDERS: Record<SectionKey, (c: ResumeContent) => string> = {
  summary: buildSummary,
  experience: buildExperience,
  skills: buildSkills,
  education: buildEducation,
  projects: buildProjects,
  achievements: buildAchievements,
  certifications: buildCertifications,
};

export const buildAtsResumeMarkup = (content: ResumeContent): string => {
  const rawOrder =
    content.sectionOrder && content.sectionOrder.length
      ? content.sectionOrder
      : [...SECTION_KEYS];
  // Filter out invalid keys like "personalInfo" that AI sometimes returns
  const order = rawOrder.filter(
    (k): k is SectionKey => (SECTION_KEYS as readonly string[]).includes(k) && k in SECTION_BUILDERS,
  );
  const body = order.map((key) => {
      const builder = SECTION_BUILDERS[key];
      if (typeof builder !== 'function') {
        console.error(`Invalid section builder for key: ${key}`, builder);
        return "";
      }
      return builder(content) ?? "";
    }).join("");
  return `${buildPersonalInfo(content)}${body}`;
};

export const buildAtsResumeHtml = (content: ResumeContent): string => {
  const printCss = `@page {
    size: A4;
    margin: 0;
  }
  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
  }
  ${ATS_STYLE}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Resume</title>
<style>${printCss}</style>
</head>
<body>
<div class="ats-resume">
${buildAtsResumeMarkup(content)}
</div>
</body>
</html>`;
};

export const downloadAtsPdf = (content: ResumeContent): Promise<void> => {
  const html = buildAtsResumeHtml(content);
  return new Promise((resolve, reject) => {
    try {
      const iframe = document.createElement("iframe");
      const id = `ats-print-frame-${Date.now()}`;
      iframe.id = id;
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      document.body.appendChild(iframe);

      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) {
        throw new Error("Unable to create print frame");
      }

      doc.open();
      doc.write(html);
      doc.close();

      const doPrint = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          const frame = document.getElementById(id);
          if (frame) frame.remove();
          resolve();
        }, 600);
      };

      setTimeout(doPrint, 400);
    } catch (error) {
      reject(error);
    }
  });
};
