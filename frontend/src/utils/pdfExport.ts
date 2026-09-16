// import { ResumeContent } from "../types";

// export const exportToPdf = async (content: ResumeContent): Promise<void> => {
//   try {
//     const printContent = generateHtmlContent(content);

//     const iframe = document.createElement("iframe");
//     iframe.id = `print-frame-${Date.now()}`;
//     iframe.style.width = "0";
//     iframe.style.height = "0";
//     iframe.style.border = "0";
//     iframe.style.position = "absolute";
//     iframe.style.top = "-9999px";
//     iframe.style.left = "-9999px";
//     document.body.appendChild(iframe);

//     const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
//     if (!iframeDoc) {
//       throw new Error("Unable to create print frame");
//     }

//     iframeDoc.open();
//     iframeDoc.write(printContent);
//     iframeDoc.close();

//     const printHandler = () => {
//       setTimeout(() => {
//         const frameToRemove = document.getElementById(iframe.id);
//         if (frameToRemove) {
//           frameToRemove.remove();
//         }
//       }, 1000);
//     };

//     iframe.onload = () => {
//       setTimeout(() => {
//         iframe.contentWindow?.print();
//         printHandler();
//       }, 500);
//     };
//   } catch (error) {
//     console.error("PDF export error:", error);
//     throw error;
//   }
// };

// function generateHtmlContent(content: ResumeContent): string {
//   return `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Resume - CVCoach</title>
//   <script src="https://cdn.tailwindcss.com"></script>
//   <style>
//     @page {
//       size: A4;
//       margin: 0;
//     }

//     * {
//       -webkit-print-color-adjust: exact !important;
//       print-color-adjust: exact !important;
//       color-adjust: exact !important;
//     }

//     html, body {
//       width: 210mm;
//       min-height: 297mm;
//       margin: 0;
//       padding: 0;
//       background: white !important;
//     }

//     body {
//       font-size: 10pt;
//       line-height: 1.4;
//       color: #222222;
//     }

//     .resume-container {
//       width: 210mm;
//       min-height: 297mm;
//       padding: 15mm;
//       background: white;
//       margin: 0;
//       box-sizing: border-box;
//     }

//     .resume-container * {
//       box-sizing: border-box;
//     }

//     .resume-name {
//       font-size: 16pt !important;
//       line-height: 1.1 !important;
//       letter-spacing: 0.02em;
//     }

//     .resume-job-title {
//       font-size: 12pt !important;
//       margin-top: 4px;
//     }

//     .resume-section {
//       margin-top: 12pt;
//     }

//     .resume-section-title {
//       font-size: 11pt;
//       font-weight: 600;
//       color: #222222;
//       border-bottom: 1pt solid #444444;
//       padding-bottom: 2pt;
//       margin-bottom: 6pt;
//     }

//     .resume-item {
//       margin-bottom: 8pt;
//     }

//     .resume-item-header {
//       display: flex;
//       justify-content: space-between;
//       align-items: baseline;
//     }

//     .resume-company,
//     .resume-school {
//       font-weight: 600;
//       font-size: 10pt;
//       color: #222222;
//     }

//     .resume-date {
//       font-size: 9pt;
//       color: #4b5563;
//     }

//     .resume-position,
//     .resume-degree {
//       font-size: 10pt;
//       color: #374151;
//       font-style: normal;
//     }

//     .resume-position em {
//       font-style: italic;
//     }

//     .resume-description {
//       margin-top: 3pt;
//       margin-left: 12pt;
//       font-size: 10pt;
//       line-height: 1.4;
//       color: #374151;
//     }

//     .resume-description ul {
//       margin: 2pt 0 0 0;
//       padding-left: 12pt;
//       list-style-type: disc;
//     }

//     .resume-description li {
//       margin: 1pt 0;
//       list-style-type: disc;
//     }

//     .resume-skills-grid {
//       display: flex;
//       flex-wrap: wrap;
//       gap: 4pt;
//     }

//     .resume-skill-tag {
//       font-size: 9pt;
//       color: #374151;
//     }

//     .resume-contact-line {
//       font-size: 9pt;
//       line-height: 1.3;
//       color: #222222;
//     }

//     .resume-contact-line span {
//       margin: 0 3pt;
//     }

//     a {
//       color: #2563eb !important;
//       text-decoration: none !important;
//     }

//     .ql-editor {
//       padding: 0 !important;
//     }

//     .ql-editor p {
//       margin: 0 !important;
//     }
//   </style>
// </head>
// <body>
//   <div class="resume-container">
//     <!-- Header - Name and Title -->
//     <div style="margin-bottom: 14pt;">
//       <div style="display: flex; justify-content: space-between; align-items: flex-start;">
//         <div style="min-width: 220px;">
//           <h1 class="resume-name" style="font-weight: bold; color: #222222; text-transform: uppercase;">
//             ${content.personalInfo.fullName || ""}
//           </h1>
//           ${content.personalInfo.jobTitle ? `<p class="resume-job-title" style="color: #222222;">${content.personalInfo.jobTitle}</p>` : ""}
//         </div>
//         <div style="text-align: right; min-width: 200px;">
//           ${buildContactInfo(content)}
//         </div>
//       </div>
//     </div>

//     <!-- Summary -->
//     ${
//       content.summary
//         ? `
//     <div class="resume-section">
//       <h2 class="resume-section-title">SUMMARY</h2>
//       <p style="font-size: 10pt; line-height: 1.4; color: #374151;">${content.summary}</p>
//     </div>
//     `
//         : ""
//     }

//     <!-- Experience -->
//     ${
//       content.experience.length > 0
//         ? `
//     <div class="resume-section">
//       <h2 class="resume-section-title">EXPERIENCE</h2>
//       ${content.experience
//         .map(
//           (exp) => `
//         <div class="resume-item">
//           <div class="resume-item-header">
//             <span class="resume-company">${exp.company}</span>
//             <span class="resume-date">
//               ${formatDateRange(exp.startDate, exp.endDate)}
//             </span>
//           </div>
//           <p class="resume-position">${exp.title}${exp.topSkills ? ` - <em>${exp.topSkills.join(", ")}</em>` : ""}</p>
//           ${exp.description ? `<div class="resume-description">${formatDescriptionHtml(exp.description)}</div>` : ""}
//         </div>
//       `,
//         )
//         .join("")}
//     </div>
//     `
//         : ""
//     }

//     <!-- Projects -->
//     ${
//       content.projects && content.projects.length > 0
//         ? `
//     <div class="resume-section">
//       <h2 class="resume-section-title">PROJECTS</h2>
//       ${content.projects
//         .map(
//           (proj) => `
//         <div class="resume-item">
//           <div class="resume-item-header">
//             <span class="resume-company">${proj.name}</span>

//             <span>
//               ${
//                 proj.links?.live
//                   ? `<a href="${proj.links.live}" target="_blank">Live</a>`
//                   : ""
//               }

//               ${
//                 proj.links?.github
//                   ? `<a href="${proj.links.github}" target="_blank" style="margin-left: 6px;">GitHub</a>`
//                   : ""
//               }
//             </span>
//           </div>
//           ${proj.description ? `<div class="resume-description">${formatDescriptionHtml(proj.description)}</div>` : ""}
//         </div>
//       `,
//         )
//         .join("")}
//     </div>
//     `
//         : ""
//     }

//     <!-- Achievements -->
//     ${
//       content.achievements && content.achievements.length > 0
//         ? `
//     <div class="resume-section">
//       <h2 class="resume-section-title">ACHIEVEMENTS</h2>
//       <ul style="margin: 0; padding-left: 0; list-style: none;">
//         ${content.achievements
//           .map(
//             (ach) => `
//             <li style="margin-bottom: 8pt;">

//               <!-- Top row: Title + Date -->
//               <div style="display: flex; justify-content: space-between; align-items: center;">
//                 <span style="font-weight: 600; font-size: 10pt;">
//                   ${ach.title}
//                 </span>
//                 ${
//                   ach.date
//                     ? `<span style="font-size: 10pt; color: #6b7280;">${ach.date}</span>`
//                     : ""
//                 }
//               </div>

//               <!-- Description -->
//               ${
//                 ach.description
//                   ? `<p style="margin: 2pt 0 0; font-size: 10pt; color: #374151;">
//                       ${ach.description}
//                     </p>`
//                   : ""
//               }

//             </li>
//           `,
//           )
//           .join("")}
//       </ul>
//     </div>
//     `
//         : ""
//     }

//     <!-- Education -->
//     ${
//       content.education.length > 0
//         ? `
//     <div class="resume-section">
//       <h2 class="resume-section-title">EDUCATION</h2>
//       ${content.education
//         .map(
//           (edu) => `
//         <div class="resume-item">
//           <div class="resume-item-header">
//             <span class="resume-school">${edu.institution}</span>
//             <span class="resume-date">${edu.date || ""}</span>
//           </div>
//           <p class="resume-degree">${edu.degree}</p>
//         </div>
//       `,
//         )
//         .join("")}
//     </div>
//     `
//         : ""
//     }

//     <!-- Skills -->
//     ${
//       content.technicalSkills?.length > 0 || content.softSkills?.length > 0
//         ? `
//     <div class="resume-section">
//       <h2 class="resume-section-title">SKILLS</h2>
//       <div style="margin-bottom: 6pt;">
//         ${content.technicalSkills?.length > 0 ? `<span style="font-weight: 600;">Technical: </span>` : ""}
//         <span class="resume-skills-grid" style="display: inline;">
//           ${
//             content.technicalSkills
//               ?.map(
//                 (skill, index, arr) => `
//               <span class="resume-skill-tag">
//                 ${skill}${index < arr.length - 1 ? ", " : ""}
//               </span>
//           `,
//               )
//               .join("") || ""
//           }
//         </span>
//       </div>
//       ${
//         content.softSkills?.length > 0
//           ? `
//       <div>
//         <span style="font-weight: 600;">Soft: </span>
//         <span class="resume-skills-grid" style="display: inline;">
//           ${
//             content.softSkills
//               ?.map(
//                 (skill, index, arr) => `
//             <span class="resume-skill-tag">
//               ${skill}${index < arr.length - 1 ? ", " : ""}
//             </span>
//           `,
//               )
//               .join("") || ""
//           }
//         </span>
//       </div>
//       `
//           : ""
//       }
//     </div>
//     `
//         : ""
//     }
//   </div>

//   <script>
// </body>
// </html>`;
// }

// function buildContactInfo(content: ResumeContent): string {
//   const parts: string[] = [];

//   const locationParts = [
//     content.personalInfo.address?.city,
//     content.personalInfo.address?.division,
//     content.personalInfo.address?.zipCode,
//   ].filter(Boolean);

//   if (locationParts.length > 0) {
//     parts.push(locationParts.join(", "));
//   }

//   if (content.personalInfo.phone) {
//     const phone = content.personalInfo.phone.replace(/^(\+880|880)/, "");
//     parts.push(`(+880) ${phone}`);
//   }

//   const firstLine = parts.join(" • ");

//   const secondLineParts: string[] = [];

//   if (content.personalInfo.email) {
//     secondLineParts.push(content.personalInfo.email);
//   }

//   if (content.personalInfo.linkedIn) {
//     let linkedin = content.personalInfo.linkedIn
//       .replace(/^https?:\/\//, "")
//       .replace(/^www\./, "");
//     if (!linkedin.startsWith("linkedin.com/in/")) {
//       linkedin = "linkedin.com/in/" + linkedin;
//     }
//     secondLineParts.push(linkedin);
//   }

//   const socialParts: string[] = [];

//   if (content.personalInfo.socialLinks?.github) {
//     let github = content.personalInfo.socialLinks.github
//       .replace(/^https?:\/\//, "")
//       .replace(/^www\./, "");
//     socialParts.push(`github.com/${github.replace(/^github\.com\//, "")}`);
//   }

//   if (content.personalInfo.socialLinks?.portfolio) {
//     let portfolio = content.personalInfo.socialLinks.portfolio
//       .replace(/^https?:\/\//, "")
//       .replace(/^www\./, "");
//     socialParts.push(portfolio);
//   }

//   if (content.personalInfo.socialLinks?.website) {
//     let website = content.personalInfo.socialLinks.website
//       .replace(/^https?:\/\//, "")
//       .replace(/^www\./, "");
//     socialParts.push(website);
//   }

//   let html = '<div class="resume-contact-line">';
//   if (firstLine) {
//     html += `<div>${firstLine}</div>`;
//   }
//   if (secondLineParts.length > 0) {
//     html += `<div>${secondLineParts.join(" • ")}</div>`;
//   }
//   if (socialParts.length > 0) {
//     html += `<div>${socialParts.join(" • ")}</div>`;
//   }
//   html += "</div>";

//   return html;
// }

// function formatDateRange(startDate?: string, endDate?: string): string {
//   const start = startDate || "";
//   const end = endDate || "Present";

//   return `${start} - ${end}`;
// }

// function formatDescriptionHtml(desc: string): string {
//   if (!desc) return "";

//   let lines: string[] = [];

//   if (desc.includes("<") && desc.includes(">")) {
//     const tempDiv = document.createElement("div");
//     tempDiv.innerHTML = desc;
//     const paragraphs = tempDiv.querySelectorAll("p, li, br");
//     paragraphs.forEach((p) => {
//       const text = p.textContent?.trim();
//       if (text) lines.push(text);
//     });
//     if (lines.length === 0 && tempDiv.textContent) {
//       lines = tempDiv.textContent.split("\n").filter((l) => l.trim());
//     }
//   } else {
//     lines = desc.split("\n").filter((line) => line.trim());
//   }

//   if (lines.length === 0) return "";

//   return `<ul style="margin: 2pt 0 0 0; padding-left: 14pt;">${lines
//     .map((line) => {
//       const cleanLine = line.replace(/^[•\-\*]\s*/, "").trim();
//       return cleanLine ? `<li style="margin: 1pt 0;">${cleanLine}</li>` : "";
//     })
//     .join("")}</ul>`;
// }

import { ResumeContent } from "../types";

export const exportToPdf = async (content: ResumeContent): Promise<void> => {
  try {
    const printContent = generateHtmlContent(content);

    const iframe = document.createElement("iframe");
    iframe.id = `print-frame-${Date.now()}`;
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.style.position = "absolute";
    iframe.style.top = "-9999px";
    iframe.style.left = "-9999px";
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      throw new Error("Unable to create print frame");
    }

    iframeDoc.open();
    iframeDoc.write(printContent);
    iframeDoc.close();

    const printHandler = () => {
      setTimeout(() => {
        const frameToRemove = document.getElementById(iframe.id);
        if (frameToRemove) {
          frameToRemove.remove();
        }
      }, 1000);
    };

    iframe.onload = () => {
      setTimeout(() => {
        iframe.contentWindow?.print();
        printHandler();
      }, 500);
    };
  } catch (error) {
    console.error("PDF export error:", error);
    throw error;
  }
};

function generateHtmlContent(content: ResumeContent): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume - ATSUp</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
    }
    
    html, body {
      width: 210mm;
      min-height: 297mm;
      margin: 0;
      padding: 0;
      background: white !important;
    }
    
    body {
      font-size: 10pt;
      line-height: 1.4;
      color: #222222;
    }
    
    .resume-container {
      width: 210mm;
      min-height: 297mm;
      padding: 15mm;
      background: white;
      margin: 0;
      box-sizing: border-box;
    }
    
    .resume-container * {
      box-sizing: border-box;
    }
    
    .resume-name {
      font-size: 16pt !important;
      line-height: 1.1 !important;
      letter-spacing: 0.02em;
    }
    
    .resume-job-title {
      font-size: 12pt !important;
      margin-top: 4px;
    }
    
    .resume-section {
      margin-top: 12pt;
    }
    
    .resume-section-title {
      font-size: 11pt;
      font-weight: 600;
      color: #222222;
      border-bottom: 1pt solid #444444;
      padding-bottom: 2pt;
      margin-bottom: 6pt;
    }
    
    .resume-item {
      margin-bottom: 8pt;
    }
    
    .resume-item-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    
    .resume-company,
    .resume-school {
      font-weight: 600;
      font-size: 10pt;
      color: #222222;
    }
    
    .resume-date {
      font-size: 9pt;
      color: #4b5563;
    }
    
    .resume-position,
    .resume-degree {
      font-size: 10pt;
      color: #374151;
      font-style: normal;
    }

    .resume-position em {
      font-style: italic;
    }
    
    .resume-description {
      margin-top: 3pt;
      margin-left: 12pt;
      font-size: 10pt;
      line-height: 1.4;
      color: #374151;
    }
    
    .resume-description ul {
      margin: 2pt 0 0 0;
      padding-left: 12pt;
      list-style-type: disc;
    }
    
    .resume-description li {
      margin: 1pt 0;
      list-style-type: disc;
    }
    
    .resume-skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 4pt;
    }
    
    .resume-skill-tag {
      font-size: 9pt;
      color: #374151;
    }
    
    .resume-contact-line {
      font-size: 9pt;
      line-height: 1.3;
      color: #222222;
    }
    
    .resume-contact-line span {
      margin: 0 3pt;
    }
    
    a {
      color: #222222 !important;
      text-decoration: none !important;
    }
    
    .ql-editor {
      padding: 0 !important;
    }
    
    .ql-editor p {
      margin: 0 !important;
    }
  </style>
</head>
<body>
  <div class="resume-container">
    <!-- Header - Name and Title -->
    <div style="margin-bottom: 14pt;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div style="min-width: 220px;">
          <h1 class="resume-name" style="font-weight: bold; color: #222222; text-transform: uppercase;">
            ${content.personalInfo.fullName || ""}
          </h1>
          ${content.personalInfo.jobTitle ? `<p class="resume-job-title" style="color: #222222;">${content.personalInfo.jobTitle}</p>` : ""}
        </div>
        <div style="text-align: right; min-width: 200px;">
          ${buildContactInfo(content)}
        </div>
      </div>
    </div>

    <!-- Summary -->
    ${
      content.summary
        ? `
    <div class="resume-section">
      <h2 class="resume-section-title">SUMMARY</h2>
      <p style="font-size: 10pt; line-height: 1.4; color: #374151;">${content.summary}</p>
    </div>
    `
        : ""
    }

    <!-- Experience -->
    ${
      content.experience.length > 0
        ? `
    <div class="resume-section">
      <h2 class="resume-section-title">EXPERIENCE</h2>
      ${content.experience
        .map(
          (exp) => `
        <div class="resume-item">
          <div class="resume-item-header">
            <span class="resume-company">${exp.company}</span>
            <span class="resume-date">
              ${formatDateRange(exp.startDate, exp.endDate)}
            </span>
          </div>
          <p class="resume-position">${exp.title}${exp.topSkills ? ` - <em>${exp.topSkills.join(", ")}</em>` : ""}</p>
          ${exp.highlights?.length ? `<div class="resume-description">${formatHighlightsHtml(exp.highlights)}</div>` : ""}
        </div>
      `,
        )
        .join("")}
    </div>
    `
        : ""
    }

    <!-- Projects -->
    ${
      content.projects && content.projects.length > 0
        ? `
    <div class="resume-section">
      <h2 class="resume-section-title">PROJECTS</h2>
      ${content.projects
        .map(
          (proj) => `
        <div class="resume-item">
          <div class="resume-item-header">
            <span class="resume-company">${proj.name}</span>
            <span class="resume-date">${formatDateRange(proj.startDate, proj.endDate)}</span>

            <span>
              ${
                proj.links?.live
                  ? `<a href="${proj.links.live}" target="_blank">Live link</a>`
                  : ""
              }
            </span>
          </div>
          ${proj.highlights?.length ? `<div class="resume-description">${formatHighlightsHtml(proj.highlights)}</div>` : ""}
        </div>
      `,
        )
        .join("")}
    </div>
    `
        : ""
    }

    <!-- Achievements -->
    ${
      content.achievements && content.achievements.length > 0
        ? `
    <div class="resume-section">
      <h2 class="resume-section-title">ACHIEVEMENTS</h2>
      <ul style="margin: 0; padding-left: 0; list-style: none;">
        ${content.achievements
          .map(
            (ach) => `
            <li style="margin-bottom: 8pt;">
              
              <!-- Top row: Title + Date -->
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-weight: 600; font-size: 10pt;">
                  ${ach.title}
                </span>
                ${
                  ach.date
                    ? `<span style="font-size: 10pt; color: #6b7280;">${ach.date}</span>`
                    : ""
                }
              </div>

              <!-- Description -->
              ${
                ach.description
                  ? `<p style="margin: 2pt 0 0; font-size: 10pt; color: #374151;">
                      ${ach.description}
                    </p>`
                  : ""
              }

            </li>
          `,
          )
          .join("")}
      </ul>
    </div>
    `
        : ""
    }

    <!-- Education -->
    ${
      content.education.length > 0
        ? `
    <div class="resume-section">
      <h2 class="resume-section-title">EDUCATION</h2>
      ${content.education
        .map(
          (edu) => `
        <div class="resume-item">
          <div class="resume-item-header">
            <span class="resume-school">${edu.institution}</span>
            <span class="resume-date">${[edu.startDate, edu.endDate].filter(Boolean).join(" - ") || ""}</span>
          </div>
          <p class="resume-degree">${edu.degree}</p>
        </div>
      `,
        )
        .join("")}
    </div>
    `
        : ""
    }

    <!-- Skills -->
    ${
      (content.skills?.length || 0) > 0
        ? `
    <div class="resume-section">
      <h2 class="resume-section-title">SKILLS</h2>
      <div style="margin-bottom: 6pt;">
        <span class="resume-skills-grid" style="display: inline;">
          ${
            content.skills
              ?.map(
                (skill, index, arr) => `
              <span class="resume-skill-tag">
                ${skill}${index < arr.length - 1 ? ", " : ""}
              </span>
          `,
              )
              .join("") || ""
          }
        </span>
      </div>
    </div>
    `
        : ""
    }
  </div>

  <script>
</body>
</html>`;
}

function buildContactInfo(content: ResumeContent): string {
  const parts: string[] = [];

  const locationParts = [
    content.personalInfo.contact?.address?.city,
    content.personalInfo.contact?.address?.state,
  ].filter(Boolean);

  if (locationParts.length > 0) {
    parts.push(locationParts.join(", "));
  }

  if (content.personalInfo.contact?.phone) {
    const phone = content.personalInfo.contact.phone.replace(/^(\+880|880)/, "");
    parts.push(`(+880) ${phone}`);
  }

  const firstLine = parts.join(" • ");

  const secondLineParts: string[] = [];

  if (content.personalInfo.contact?.email) {
    secondLineParts.push(content.personalInfo.contact.email);
  }

  if (content.personalInfo.contact?.linkedIn) {
    let linkedin = content.personalInfo.contact.linkedIn
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "");
    if (!linkedin.startsWith("linkedin.com/in/")) {
      linkedin = "linkedin.com/in/" + linkedin;
    }
    secondLineParts.push(linkedin);
  }

  const socialParts: string[] = [];

  if (content.personalInfo.contact?.socialLinks?.github) {
    let github = content.personalInfo.contact.socialLinks.github
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "");
    socialParts.push(`github.com/${github.replace(/^github\.com\//, "")}`);
  }

  if (content.personalInfo.contact?.socialLinks?.portfolio) {
    let portfolio = content.personalInfo.contact.socialLinks.portfolio
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "");
    socialParts.push(portfolio);
  }

  if (content.personalInfo.contact?.socialLinks?.website) {
    let website = content.personalInfo.contact.socialLinks.website
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "");
    socialParts.push(website);
  }

  let html = '<div class="resume-contact-line">';
  if (firstLine) {
    html += `<div>${firstLine}</div>`;
  }
  if (secondLineParts.length > 0) {
    html += `<div>${secondLineParts.join(" • ")}</div>`;
  }
  if (socialParts.length > 0) {
    html += `<div>${socialParts.join(" • ")}</div>`;
  }
  html += "</div>";

  return html;
}

function formatDateRange(startDate?: string, endDate?: string): string {
  const start = startDate || "";
  const end = endDate || "Present";

  return `${start} - ${end}`;
}

function formatHighlightsHtml(highlights: string[]): string {
  const lines = (highlights || []).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return "";

  return `<ul style="margin: 2pt 0 0 0; padding-left: 14pt;">${lines
    .map((line) => {
      const cleanLine = line.replace(/^[•\-\*]\s*/, "").trim();
      return cleanLine ? `<li style="margin: 1pt 0;">${cleanLine}</li>` : "";
    })
    .join("")}</ul>`;
}

function formatDescriptionHtml(desc: string): string {
  if (!desc) return "";

  let lines: string[] = [];

  if (desc.includes("<") && desc.includes(">")) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = desc;
    const paragraphs = tempDiv.querySelectorAll("p, li, br");
    paragraphs.forEach((p) => {
      const text = p.textContent?.trim();
      if (text) lines.push(text);
    });
    if (lines.length === 0 && tempDiv.textContent) {
      lines = tempDiv.textContent.split("\n").filter((l) => l.trim());
    }
  } else {
    lines = desc.split("\n").filter((line) => line.trim());
  }

  if (lines.length === 0) return "";

  return `<ul style="margin: 2pt 0 0 0; padding-left: 14pt;">${lines
    .map((line) => {
      const cleanLine = line.replace(/^[•\-\*]\s*/, "").trim();
      return cleanLine ? `<li style="margin: 1pt 0;">${cleanLine}</li>` : "";
    })
    .join("")}</ul>`;
}
