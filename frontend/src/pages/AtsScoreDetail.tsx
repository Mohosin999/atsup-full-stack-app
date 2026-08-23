import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { atsScoreApi } from "../api/api";
import { AtsScoreHistory, ResumeContent } from "../types";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import AtsScoreResult from "../components/ats-result/AtsScoreResult";
import Wrapper from "../components/Wrapper";

export default function AtsScoreDetail() {
  const navigate = useNavigate();
  const { id: historyId } = useParams<{ id: string }>();
  const [result, setResult] = useState<AtsScoreHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!historyId) {
      setError("No ATS report specified.");
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");
    atsScoreApi
      .getById(historyId)
      .then((res) => {
        if (!active) return;
        const score = res.data?.data;
        if (!score) {
          setError("ATS report not found.");
          return;
        }
        const analysisResult: AtsScoreHistory = {
          id: score.id,
          _id: score.id,
          userId: score.userId || "",
          title: score.title,
          resumeName: score.resumeName,
          overallScore: score.overallScore,
          sectionScores: {
            ...score.sectionScores,
            categories: score.sectionScores?.categories,
            matchBreakdown: score.sectionScores?.matchBreakdown,
          },
          atsFriendliness: score.atsFriendliness,
          suggestions: score.suggestions,
          resumeContent: score.resumeContent || ({} as ResumeContent),
          createdAt: score.createdAt || new Date().toISOString(),
          updatedAt: score.updatedAt || new Date().toISOString(),
        };
        setResult(analysisResult);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Failed to load ATS score:", err);
        setError(err?.response?.data?.message || "Failed to load ATS report.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [historyId]);

  return (
    <div className="min-h-screen bg-[#F6F9FC] pt-20 pb-12">
      <Wrapper className="!px-4 lg:!px-16">
        <div className="my-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-800 mb-1">
              ATS Score Report
            </h1>
            <p className="text-sm text-gray-600">
              Saved analysis details
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={() => navigate("/ats-scan")}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
            >
              Go to ATS Score
            </button>
          </div>
        ) : result ? (
          <AtsScoreResult result={result} />
        ) : null}
      </Wrapper>
    </div>
  );
}
