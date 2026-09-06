import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Wrench } from "lucide-react";
import { AtsScoreHistory } from "../../types";
import ScoreCard from "../ui/ScoreCard";
import SectionScoreCard from "../SectionScoreCard";
import SuggestionList from "../SuggestionList";
import JobMatchBreakdown from "../JobMatchBreakdown";
import CategoryChecklist from "./CategoryChecklist";
import ReviewCard from "./ReviewCard";
import { atsScoreApi } from "../../api/api";
import { useAppDispatch } from "@/hooks";
import { setUserAiScanState } from "@/store/slices/authSlice";
import AnalysisProgressModal, { PipelineStep } from "../ui/AnalysisProgressModal";

interface AtsScoreResultProps {
  result: AtsScoreHistory;
  headerAction?: ReactNode;
  onRescan?: () => void;
}

const FIX_STEPS: PipelineStep[] = [
  { id: "analyze", label: "Analyzing failed checks" },
  { id: "fix", label: "AI fixing resume" },
  { id: "ready", label: "Preparing builder" },
];
const FIX_MESSAGES = ["Analyzing failed checks...", "AI fixing resume...", "Preparing builder...", "Ready!"];

export default function AtsScoreResult({ result, onRescan }: AtsScoreResultProps) {
  const hasFormattingData = !!(
    result.resumeContent?.layout && result.resumeContent?.fontCheck
  );
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [fixing, setFixing] = useState(false);
  const [fixOpen, setFixOpen] = useState(false);
  const [fixStep, setFixStep] = useState(0);
  const [fixCompleted, setFixCompleted] = useState<string[]>([]);
  const [fixMsg, setFixMsg] = useState(FIX_MESSAGES[0]);

  const categories = result.sectionScores.categories;
  const hasFixable = !!categories && (
    (categories.hardSkills?.missing?.length ?? 0) > 0 ||
    (categories.softSkills?.missing?.length ?? 0) > 0 ||
    categories.searchability?.checks?.some((c) => c.status === "failed") ||
    categories.formatting?.checks?.some((c) => c.status === "failed") ||
    categories.recruiterTips?.subgroups?.some((s) => s.checks.some((c) => c.status === "failed")) ||
    categories.recruiterTips?.checks?.some((c) => c.status === "failed")
  );

  const buildFailedChecks = () => {
    if (!categories) return [] as Array<{ category: string; label: string; detail: string; status: string }>;
    const out: Array<{ category: string; label: string; detail: string; status: string }> = [];
    const pushFrom = (catKey: string, checks?: Array<{ label: string; detail: string; status: string; weight?: number }>) => {
      (checks || []).forEach((c) => {
        if (c.status === "failed") out.push({ category: catKey, label: c.label, detail: c.detail, status: c.status });
      });
    };
    pushFrom("searchability", categories.searchability?.checks);
    pushFrom("hardSkills", categories.hardSkills?.checks);
    pushFrom("softSkills", categories.softSkills?.checks);
    pushFrom("recruiterTips", categories.recruiterTips?.checks);
    (categories.recruiterTips?.subgroups || []).forEach((s) => pushFrom("recruiterTips", s.checks));
    pushFrom("formatting", categories.formatting?.checks);
    return out.slice(0, 12);
  };

  const handleFix = async () => {
    if (!categories) return;
    setFixing(true);
    setFixOpen(true);
    setFixStep(0);
    setFixCompleted([]);
    setFixMsg(FIX_MESSAGES[0]);
    try {
      setFixMsg(FIX_MESSAGES[0]);
      await new Promise((r) => setTimeout(r, 600));
      setFixCompleted(["analyze"]);
      setFixStep(1);
      setFixMsg(FIX_MESSAGES[1]);

      const hardMissing = categories.hardSkills?.missing || [];
      const softMissing = categories.softSkills?.missing || [];
      const rt = categories.recruiterTips;
      const rtFailed = (rt?.subgroups || []).flatMap((s) => s.checks).concat(rt?.checks || []);
      const needSummary = rtFailed.some((c) => c.label.toLowerCase().includes("summary") && c.status === "failed");
      const needActionVerbs = rtFailed.some((c) => c.label.toLowerCase().includes("action verb") && c.status === "failed");
      const needMeasurable = rtFailed.some((c) => c.label.toLowerCase().includes("measurable") && c.status === "failed");
      const failedChecks = buildFailedChecks();

      const res = await atsScoreApi.fixResume({
        resumeContent: result.resumeContent,
        failed: { hardSkills: hardMissing, softSkills: softMissing, summary: needSummary, actionVerbs: needActionVerbs, measurable: needMeasurable },
        failedChecks,
        suggestions: result.suggestions || [],
      } as any);

      if (res.data?.aiScan) {
        dispatch(setUserAiScanState({ credits: res.data.aiScan.credits ?? 0, lastAiScanResetDate: res.data.aiScan.lastAiScanResetDate }));
      } else if (res.data?.credits !== undefined) {
        dispatch(setUserAiScanState({ credits: res.data.credits, lastAiScanResetDate: new Date().toISOString().slice(0, 10) }));
      }

      setFixCompleted(["analyze", "fix"]);
      setFixStep(2);
      setFixMsg(FIX_MESSAGES[2]);
      await new Promise((r) => setTimeout(r, 400));
      setFixCompleted(["analyze", "fix", "ready"]);
      setFixMsg(FIX_MESSAGES[3]);
      setFixOpen(false);
      setFixing(false);
      navigate("/resume-builder/new", { state: { fixedContent: res.data.data } });
    } catch (e: any) {
      setFixOpen(false);
      setFixing(false);
      toast.error(e.response?.data?.message || e.message || "Failed to fix resume");
    }
  };

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
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Improvement Suggestions
              </h2>
              <SuggestionList
                suggestions={result.suggestions}
                title="Suggested Improvements"
              />
              {hasFixable && (
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleFix}
                    disabled={fixing}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 rounded-lg"
                  >
                    <Wrench className="w-4 h-4" />
                    {fixing ? "Fixing..." : "Fix All Issues with AI (1 credit)"}
                  </button>
                </div>
              )}
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

            <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
                Summary
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-100 dark:bg-gray-700 p-4">
                  <p className="text-gray-600 text-sm mb-1 dark:text-gray-400">ATS Friendliness</p>
                  <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
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
      <AnalysisProgressModal isOpen={fixOpen} steps={FIX_STEPS} activeStep={fixStep} completedSteps={fixCompleted} currentMessage={fixMsg} />
    </div>
  );
}
