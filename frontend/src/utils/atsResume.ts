/* ===================================
ATS-Friendly Resume HTML/CSS Builder
Shared by the live preview and the PDF
export so they always match exactly.
=================================== */
import { ResumeContent } from "../types";

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
  let clean = linkedIn.trim().replace(/^https?:\/\//, "").replace(/^www\./, "");
  if (!clean.startsWith("linkedin.com/in/")) {
    clean = `linkedin.com/in/${clean}`;
  }
  return clean;
};

export const ATS_STYLE = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  .ats-resume {
    width: 794px;
    min-height: 1122px;
    padding: 40px 46px 46px;
    background: #ffffff;
    color: #1f1f1f;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11pt;
    line-height: 1.45;
  }
  .ats-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  .ats-name {
    font-size: 22pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    line-height: 1.15;
    color: #111111;
  }
  .ats-job-title {
    font-size: 12pt;
    margin-top: 4px;
    color: #222222;
  }
  .ats-contact {
    text-align: right;
    font-size: 10pt;
    color: #333333;
    line-height: 1.55;
  }
  .ats-contact div {
    margin-bottom: 1px;
  }
  .ats-section {
    margin-top: 14px;
  }
  .ats-section-title {
    font-size: 11pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
    color: #111111;
  }
  .ats-item {
    margin-bottom: 8px;
  }
  .ats-item-head {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: 12px;
  }
  .ats-strong {
    font-weight: 700;
    color: #111111;
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
  }
  .ats-bullets {
    margin: 3px 0 0 0;
    padding-left: 16px;
  }
  .ats-bullets li {
    margin-bottom: 2px;
  }
  .ats-skill-line {
    margin-bottom: 2px;
  }
  .ats-links {
    font-size: 10pt;
    color: #333333;
    margin-top: 1px;
  }
  .ats-links .sep {
    margin: 0 5px;
    color: #666666;
  }
`;

const buildPersonalInfo = (content: ResumeContent): string => {
  const pi = content.personalInfo || {};
  const contact = pi.contact || {};
  const address = contact.address || {};
  const location = [address.city, address.state || address.division]
    .filter(Boolean)
    .join(", ");

  const contactLines: string[] = [];
  if (contact.email) contactLines.push(escapeHtml(contact.email));
  if (contact.phone) contactLines.push(escapeHtml(formatPhone(contact.phone)));
  if (location) contactLines.push(escapeHtml(location));
  if (contact.linkedIn)
    contactLines.push(escapeHtml(formatLinkedIn(contact.linkedIn)));

  return `<div class="ats-header">
    <div>
      <div class="ats-name">${escapeHtml(pi.fullName) || "Your Name"}</div>
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
    <div class="ats-section-title">Summary</div>
    <div>${escapeHtml(content.summary.trim())}</div>
  </div>`;
};

const buildExperience = (content: ResumeContent): string => {
  const items = (content.experience || []).filter(
    (exp) => exp.title?.trim() || exp.company?.trim(),
  );
  if (items.length === 0) return "";
  return `<div class="ats-section">
    <div class="ats-section-title">Work Experience</div>
    ${items
      .map((exp) => {
        const dr = dateRange(exp.startDate, exp.endDate, exp.current);
        const location = exp.location ? ` · ${escapeHtml(exp.location)}` : "";
        const bullets = (exp.highlights || []).filter((h) => h.trim());
        return `<div class="ats-item">
          <div class="ats-item-head">
            <span class="ats-strong">${escapeHtml(exp.title)}</span>
            ${
              dr ? `<span class="ats-date">${escapeHtml(dr)}</span>` : ""
            }
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

  let body = "";
  if (categories.length > 0) {
    body = categories
      .map((cat) => {
        const skills = cat.skills.filter((s) => s.trim());
        if (skills.length === 0) return "";
        return `<div class="ats-skill-line"><span class="ats-strong">${escapeHtml(
          cat.name,
        )}:</span> ${escapeHtml(skills.join(", "))}</div>`;
      })
      .join("");
  } else {
    body = `<div class="ats-skill-line">${escapeHtml(flatSkills.join(", "))}</div>`;
  }
  if (!body) return "";
  return `<div class="ats-section">
    <div class="ats-section-title">Skills</div>
    ${body}
  </div>`;
};

const buildEducation = (content: ResumeContent): string => {
  const items = (content.education || []).filter(
    (edu) => edu.degree?.trim() || edu.institution?.trim(),
  );
  if (items.length === 0) return "";
  return `<div class="ats-section">
    <div class="ats-section-title">Education</div>
    ${items
      .map(
        (edu) => `<div class="ats-item">
          <div class="ats-item-head">
            <span class="ats-strong">${escapeHtml(edu.degree)}</span>
            ${
              edu.date ? `<span class="ats-date">${escapeHtml(edu.date)}</span>` : ""
            }
          </div>
          ${
            edu.institution
              ? `<div class="ats-sub">${escapeHtml(edu.institution)}</div>`
              : ""
          }
        </div>`,
      )
      .join("")}
  </div>`;
};

const buildProjects = (content: ResumeContent): string => {
  const items = (content.projects || []).filter((proj) => proj.name?.trim());
  if (items.length === 0) return "";
  return `<div class="ats-section">
    <div class="ats-section-title">Projects</div>
    ${items
      .map((proj) => {
        const dr = dateRange(proj.startDate, proj.endDate, proj.current);
        const links: string[] = [];
        if (proj.links?.live) links.push(escapeHtml(proj.links.live));
        if (proj.links?.github) links.push(escapeHtml(proj.links.github));
        const bullets = (proj.highlights || []).filter((h) => h.trim());
        return `<div class="ats-item">
          <div class="ats-item-head">
            <span class="ats-strong">${escapeHtml(proj.name)}</span>
            ${
              dr ? `<span class="ats-date">${escapeHtml(dr)}</span>` : ""
            }
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
  const items = (content.achievements || []).filter((ach) => ach.title?.trim());
  if (items.length === 0) return "";
  return `<div class="ats-section">
    <div class="ats-section-title">Achievements</div>
    ${items
      .map(
        (ach) => `<div class="ats-item">
          <div class="ats-item-head">
            <span class="ats-strong">${escapeHtml(ach.title)}</span>
            ${
              ach.date ? `<span class="ats-date">${escapeHtml(ach.date)}</span>` : ""
            }
          </div>
          ${
            ach.description
              ? `<div class="ats-sub">${escapeHtml(ach.description)}</div>`
              : ""
          }
        </div>`,
      )
      .join("")}
  </div>`;
};

const buildCertifications = (content: ResumeContent): string => {
  const items = (content.certifications || []).filter((cert) => cert.name?.trim());
  if (items.length === 0) return "";
  return `<div class="ats-section">
    <div class="ats-section-title">Certifications</div>
    ${items
      .map(
        (cert) => `<div class="ats-item">
          <div class="ats-item-head">
            <span class="ats-strong">${escapeHtml(cert.name)}</span>
            ${
              cert.date
                ? `<span class="ats-date">${escapeHtml(cert.date)}</span>`
                : ""
            }
          </div>
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

export const buildAtsResumeMarkup = (content: ResumeContent): string =>
  [
    buildPersonalInfo(content),
    buildSummary(content),
    buildExperience(content),
    buildSkills(content),
    buildEducation(content),
    buildProjects(content),
    buildAchievements(content),
    buildCertifications(content),
  ].join("");

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
