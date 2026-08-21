import { CATEGORY_WEIGHTS } from "./constants";
import { scoreFromChecks, scoreFromSubgroups, deriveFeedback } from "./utils";
const createCheckResult = (available, passed, passDetail, failDetail) => {
    if (!available) {
        return {
            status: "not-applicable",
            detail: "Requires original file analysis.",
        };
    }
    return passed
        ? { status: "passed", detail: passDetail }
        : { status: "failed", detail: failDetail };
};
// ============================================================
// Layout Subgroup Builder
// ============================================================
const buildLayoutSubgroup = (resume) => {
    const { layout } = resume;
    const checks = [
        {
            label: "Single Column",
            ...createCheckResult(!!layout, layout?.isSingleColumn === true, "Single column layout detected. This format is optimal for ATS parsing.", "Single column layout recommended for best ATS parsing compatibility."),
            weight: 32,
        },
        {
            label: "Multi-Column",
            ...createCheckResult(!!layout, layout?.hasMultiColumn !== true, "No multi-column layout detected. Content structure is ATS-friendly.", "Multi-column layouts should be avoided as ATS may misread content flow."),
            weight: 18,
        },
        {
            label: "Tables and Text Boxes",
            ...createCheckResult(!!layout, layout?.hasTables === false, "No tables or text boxes detected. Clean text extraction is possible.", "Tables and text boxes should be removed as they break ATS parsing algorithms."),
            weight: 30,
        },
        {
            label: "Images and Photos",
            ...createCheckResult(!!layout, layout?.hasImages === false, "No images or photos detected. Text-only content is fully ATS-parseable.", "Images and photos should be removed as they are ignored by ATS systems."),
            weight: 10,
        },
        {
            label: "Icons and Graphics",
            ...createCheckResult(!!layout, layout?.hasIcons === false, "No icons or graphics detected. Clean text-focused resume structure.", "Icons and graphics should be removed as they are not processed by ATS."),
            weight: 10,
        },
    ];
    const passedCount = checks.filter((check) => check.status === "passed").length;
    const totalChecks = checks.length;
    return {
        key: "layout",
        title: "Layout",
        score: scoreFromChecks(checks),
        weight: 60,
        summary: passedCount === totalChecks
            ? "Excellent layout. Fully ATS-compatible single-column structure detected."
            : `${passedCount} of ${totalChecks} layout standards met. Improvements needed in some areas.`,
        checks,
    };
};
// ============================================================
// Font Subgroup Builder
// ============================================================
const buildFontSubgroup = (resume) => {
    const { fontCheck } = resume;
    const checks = [
        {
            label: "ATS-Friendly Font",
            ...createCheckResult(!!fontCheck, fontCheck?.isStandardFont === true, fontCheck?.fontName
                ? `${fontCheck.fontName} detected. Standard ATS-compatible font in use.`
                : "Standard ATS-friendly font detected.", "Standard ATS-friendly font recommended (Arial, Calibri, Times New Roman, Verdana)."),
            weight: 50,
        },
        {
            label: "Font Name",
            ...createCheckResult(!!fontCheck, !!fontCheck?.fontName, fontCheck?.fontName
                ? `Font identified as ${fontCheck.fontName}.`
                : "Font name successfully identified from the document.", "Font name could not be identified from the resume document."),
            weight: 20,
        },
        {
            label: "Font Size",
            ...createCheckResult(!!fontCheck, fontCheck?.isReadableSize === true, "Readable font size detected. Body text appears to be 10-12pt with headings at 14-16pt.", "Readable font sizes recommended. Use 10-12pt for body text and 14-16pt for headings."),
            weight: 30,
        },
    ];
    const passedCount = checks.filter((check) => check.status === "passed").length;
    const totalChecks = checks.length;
    return {
        key: "font",
        title: "Font",
        score: scoreFromChecks(checks),
        weight: 40,
        summary: passedCount === totalChecks
            ? "Excellent font choices. Fully ATS-compatible typography detected."
            : `${passedCount} of ${totalChecks} font standards met. Improvements needed in some areas.`,
        checks,
    };
};
// ============================================================
// Main Formatting Category Builder
// ============================================================
export const buildFormatting = (resume, atsFriendliness) => {
    // Build individual subgroup evaluations
    const subgroups = [buildLayoutSubgroup(resume), buildFontSubgroup(resume)];
    // Flatten all checks for comprehensive feedback
    const allChecks = subgroups.flatMap((subgroup) => subgroup.checks);
    // Generate strengths and improvement areas
    const { strengths, improvements } = deriveFeedback(allChecks);
    // Determine summary based on overall score
    const getSummary = (score) => {
        if (score >= 80) {
            return "Excellent formatting. Document structure and typography are fully optimized for ATS parsing.";
        }
        if (score >= 60) {
            return "Acceptable formatting. Some improvements needed for optimal ATS compatibility.";
        }
        return "Weak formatting. Significant improvements needed in layout and typography.";
    };
    return {
        key: "formatting",
        title: "Formatting",
        score: scoreFromSubgroups(subgroups),
        weight: CATEGORY_WEIGHTS.formatting,
        summary: getSummary(atsFriendliness),
        checks: allChecks,
        subgroups,
        strengths,
        improvements,
    };
};
