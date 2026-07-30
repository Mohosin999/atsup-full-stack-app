/* ===================================
Result Panel Component
=================================== */
import { motion } from "framer-motion";
import { Analysis } from "../types";
import ATSScoreBreakdown from "./ATSScoreBreakdown";
import OverallFeedback from "./OverallFeedback";
import SkillsAnalysis from "./SkillsAnalysis";
import MissingKeywords from "./MissingKeywords";

interface ResultPanelProps {
  analysis: Analysis;
}

export default function ResultPanel({ analysis }: ResultPanelProps) {
  const atsBreakdown = analysis.atsBreakdown as any;

  const atsItems = atsBreakdown ? [
    { label: "Keyword Match", score: atsBreakdown.keywordMatch?.score || 0, details: atsBreakdown.keywordMatch?.details || "", info: "30% weight - Keywords from job description" },
    { label: "Formatting & Structure", score: atsBreakdown.formattingCompatibility?.score || 0, details: atsBreakdown.formattingCompatibility?.details || "", info: "25% weight - ATS-readable format" },
    { label: "Skills Section", score: atsBreakdown.skillsSection?.score || 0, details: atsBreakdown.skillsSection?.details || "", info: "25% weight - Technical skills coverage" },
    { label: "Experience Relevance", score: atsBreakdown.experienceRelevance?.score || 0, details: atsBreakdown.experienceRelevance?.details || "", info: "15% weight - Relevant work history" },
    { label: "Readability & Length", score: atsBreakdown.readabilityLength?.score || 0, details: atsBreakdown.readabilityLength?.details || "", info: "5% weight - Content clarity" },
    { label: "Contact Information", score: atsBreakdown.contactInfo?.score || 0, details: atsBreakdown.contactInfo?.details || "", info: "Complete contact details" },
  ] : [];

  const atsSuggestions = analysis.atsSuggestions || [];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <ATSScoreBreakdown
        atsScore={analysis.atsScore || 0}
        breakdown={atsItems}
        suggestions={atsSuggestions}
      />

      <OverallFeedback analysis={analysis} />
      <SkillsAnalysis analysis={analysis} />
      {analysis.keywords?.missing?.length > 0 && <MissingKeywords keywords={analysis.keywords.missing} />}
    </motion.div>
  );
}
