import { motion } from "framer-motion";
import { ReactNode } from "react";
import { AtsScoreHistory } from "../../types";
import ScoreCard from "../ui/ScoreCard";
import SectionScoreCard from "../SectionScoreCard";
import SuggestionList from "../SuggestionList";
import JobMatchBreakdown from "../JobMatchBreakdown";
import CategoryChecklist from "./CategoryChecklist";
import ReviewCard from "./ReviewCard";

interface AtsScoreResultProps {
  result: AtsScoreHistory;
  headerAction?: ReactNode;
  onRescan?: () => void;
}

export default function AtsScoreResult({ result, onRescan }: AtsScoreResultProps) {
  const hasFormattingData = !!(
    result.resumeContent?.layout && result.resumeContent?.fontCheck
  );

  return (
    <div className="space-y-6">
      {result.sectionScores.categories ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
          {/* LEFT: score circle + checklist of what was checked */}
          <div className="lg:col-span-4 xl:col-span-3 lg:sticky lg:top-24">
            <CategoryChecklist
              overallScore={result.overallScore}
              categories={result.sectionScores.categories}
              hasFormattingData={hasFormattingData}
              onRescan={onRescan}
            />
          </div>

          {/* RIGHT: review cards column (wider) */}
          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            {(
              [
                "searchability",
                "hardSkills",
                "softSkills",
                "recruiterTips",
                "formatting",
              ] as const
            ).map((key, idx) => (
              <ReviewCard
                key={key}
                category={result.sectionScores.categories![key]}
                index={idx}
                hasFormattingData={hasFormattingData}
              />
            ))}

            {/* {result.sectionScores.matchBreakdown && (
              <JobMatchBreakdown
                matchBreakdown={result.sectionScores.matchBreakdown}
              />
            )} */}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Improvement Suggestions
              </h2>
              <SuggestionList
                suggestions={result.suggestions}
                title="Suggested Improvements"
              />
            </motion.div>
          </div>
        </div>
      ) : (
        /* ---------- Legacy result layout (old analyses) ---------- */
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="md:col-span-1">
              <ScoreCard
                score={result.overallScore}
                label="Overall ATS Score"
                size="lg"
                showProgress
              />
            </div>

            <div className="md:col-span-2 bg-white p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Summary
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-100 p-4">
                  <p className="text-gray-600 text-sm mb-1">ATS Friendliness</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {result.atsFriendliness}%
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Section Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <SectionScoreCard
                sectionName="Summary"
                score={result.sectionScores.summary.score}
                review={result.sectionScores.summary.review}
              />
              <SectionScoreCard
                sectionName="Experience"
                score={result.sectionScores.experience.score}
                review={result.sectionScores.experience.review}
              />
              <SectionScoreCard
                sectionName="Projects"
                score={result.sectionScores.projects.score}
                review={result.sectionScores.projects.review}
              />
              <SectionScoreCard
                sectionName="Skills"
                score={result.sectionScores.skills.score}
                review={result.sectionScores.skills.review}
              />
              <SectionScoreCard
                sectionName="Contact Info"
                score={result.sectionScores.contactInfo.score}
                review={result.sectionScores.contactInfo.review}
                hasContactInfo={result.sectionScores.contactInfo.hasContactInfo}
              />
              <SectionScoreCard
                sectionName="Measurable Results"
                score={result.sectionScores.measurableResults?.score ?? 0}
                review={
                  result.sectionScores.measurableResults?.review ??
                  "No measurable result data available."
                }
              />
              <SectionScoreCard
                sectionName="Action Verbs"
                score={result.sectionScores.actionVerbs?.score ?? 0}
                review={
                  result.sectionScores.actionVerbs?.review ??
                  "No action verb data available."
                }
              />
            </div>
          </motion.div>

          {/* {result.sectionScores.matchBreakdown && (
            <JobMatchBreakdown
              matchBreakdown={result.sectionScores.matchBreakdown}
            />
          )} */}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Improvement Suggestions
            </h2>
            <SuggestionList
              suggestions={result.suggestions}
              title="Suggested Improvements"
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}
