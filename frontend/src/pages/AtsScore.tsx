// ============================================================================
// ORIGINAL AtsScore PAGE (ats-score-check endpoint version) — KEPT FOR REFERENCE.
// The entire original code below is COMMENTED OUT.
// The active code is the "UNLIMITED ATS CHECK VERSION" further down, which calls
// POST /api/unlimited-ats-check/analyze (no AI credits, no LLM).
// ============================================================================

// import { useState, useEffect } from "react";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import { motion } from "framer-motion";
// import { Upload, CheckCircle, XCircle, Scan, X } from "lucide-react";
// import { toast } from "react-toastify";
// import { atsScoreApi, resumeParserApi, jobApi } from "../api/api";
// import { useAppDispatch } from "../hooks/redux";
// import { setUserCredits } from "../store/slices/authSlice";
// import BackButton from "../components/ui/BackButton";
// import ScoreCard from "../components/ui/ScoreCard";
// import SectionScoreCard from "../components/SectionScoreCard";
// import SuggestionList from "../components/SuggestionList";
// import LoadingSpinner from "../components/ui/LoadingSpinner";
// import JobMatchBreakdown from "../components/JobMatchBreakdown";
// import CategoryChecklist from "../components/ats-result/CategoryChecklist";
// import FeedbackCard from "../components/ats-result/FeedbackCard";
// import AnalysisProgressModal, {
//   PipelineStep,
// } from "../components/ui/AnalysisProgressModal";
// import { AtsScoreHistory } from "../types";
// import Wrapper from "../components/Wrapper";
// import Button from "@/components/ui/Button";
//
// const PIPELINE_STEPS: PipelineStep[] = [
//   { id: "resume", label: "Resume Analysis" },
//   { id: "jd", label: "Job Description Analysis" },
//   { id: "ats", label: "ATS Score Calculation" },
// ];
//
// const PIPELINE_MESSAGES = [
//   "Sending resume to AI...",
//   "Converting resume to JSON...",
//   "Resume JSON received",
//   "Sending job description to AI...",
//   "Converting job description to JSON...",
//   "Job description JSON received",
//   "Calculating ATS score...",
//   "Analysis complete!",
// ];
//
// export default function AtsScorePage() {
//   const navigate = useNavigate();
//   const { id: analysisId } = useParams<{ id: string }>();
//   const location = useLocation();
//   const dispatch = useAppDispatch();
//   const [resumeName, setResumeName] = useState("");
//   const [resumeFile, setResumeFile] = useState<File | null>(null);
//   const [jobDescription, setJobDescription] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [analyzing, setAnalyzing] = useState(false);
//   const [result, setResult] = useState<AtsScoreHistory | null>(null);
//   const [pipelineOpen, setPipelineOpen] = useState(false);
//   const [activeStep, setActiveStep] = useState(0);
//   const [completedSteps, setCompletedSteps] = useState<string[]>([]);
//   const [currentMessage, setCurrentMessage] = useState(PIPELINE_MESSAGES[0]);
//
//
//   const bothFieldsReady = !!resumeFile && !!jobDescription.trim();
//
//   useEffect(() => {
//     if (analysisId) {
//       const preloaded = (
//         location.state as { result?: AtsScoreHistory } | undefined
//       )?.result;
//       if (preloaded && preloaded.id === analysisId) {
//         setResult(preloaded);
//         setResumeName(preloaded.resumeName);
//       } else {
//         loadAnalysis(analysisId);
//       }
//     } else {
//       setResult(null);
//       setResumeName("");
//       setResumeFile(null);
//       setJobDescription("");
//     }
//   }, [analysisId]);
//
//   const handleJobDescriptionChange = (value: string) => {
//     setJobDescription(value);
//   };
//
//   const loadAnalysis = async (id: string) => {
//     setLoading(true);
//     try {
//       const response = await atsScoreApi.getById(id);
//       if (response.data.data) {
//         setResult(response.data.data);
//         setResumeName(response.data.data.resumeName);
//       }
//     } catch (error) {
//       toast.error("Failed to load analysis");
//       navigate("/ats-score");
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   const handleFileUpload = async (file: File) => {
//     setResumeFile(file);
//     setResumeName(file.name);
//   };
//
//   const showMessage = (index: number, delay = 950) =>
//     new Promise<void>((resolve) => {
//       setCurrentMessage(PIPELINE_MESSAGES[index]);
//       window.setTimeout(resolve, delay);
//     });
//
//   const handleAnalyze = async () => {
//     if (!resumeFile) {
//       toast.error("Please upload a resume");
//       return;
//     }
//     if (!jobDescription.trim()) {
//       toast.error("Please paste a job description");
//       return;
//     }
//
//     setPipelineOpen(true);
//     setAnalyzing(true);
//     setActiveStep(0);
//     setCompletedSteps([]);
//     setCurrentMessage(PIPELINE_MESSAGES[0]);
//
//     try {
//       setCurrentMessage(PIPELINE_MESSAGES[0]);
//       const formData = new FormData();
//       formData.append("resume", resumeFile);
//       const parseResponse = await resumeParserApi.parse(formData);
//       const aiResearch = parseResponse.data.data?.aiResearch;
//       if (!aiResearch) {
//         throw new Error("AI returned no resume data");
//       }
//
//       await showMessage(1);
//       await showMessage(2);
//       setCompletedSteps(["resume"]);
//       setActiveStep(1);
//
//       setCurrentMessage(PIPELINE_MESSAGES[3]);
//       const jdResponse = await jobApi.parse(jobDescription.trim());
//       const structuredJD = jdResponse.data.data;
//       if (!structuredJD) {
//         throw new Error("AI returned no job description data");
//       }
//
//       await showMessage(4);
//       await showMessage(5);
//       setCompletedSteps(["resume", "jd"]);
//       setActiveStep(2);
//
//       setCurrentMessage(PIPELINE_MESSAGES[6]);
//       const response = await atsScoreApi.analyze({
//         resumeName,
//         aiResearch,
//         jobDescription: jobDescription.trim(),
//         structuredJD,
//       });
//
//       if (response.data.credits !== undefined) {
//         dispatch(setUserCredits(response.data.credits));
//       }
//
//       await showMessage(7, 1600);
//       setCompletedSteps(["resume", "jd", "ats"]);
//
//       await new Promise((r) => window.setTimeout(r, 600));
//       setPipelineOpen(false);
//       setAnalyzing(false);
//       navigate(`/ats-score/${response.data.data.id}`, {
//         state: { result: response.data.data },
//       });
//     } catch (error: any) {
//       console.error("Analysis pipeline error:", error);
//       setPipelineOpen(false);
//       setAnalyzing(false);
//       toast.error(
//         error.response?.data?.message ||
//           error.message ||
//           "Failed to analyze resume",
//       );
//     }
//   };
//
//   const handleReset = () => {
//     setResult(null);
//     setResumeName("");
//     setResumeFile(null);
//     setJobDescription("");
//     if (analysisId) navigate("/ats-score");
//   };
//
//   return (
//     <div className="min-h-screen bg-[#F6F9FC] pt-20 pb-12">
//       <Wrapper>
//
//         {/* <div className="mt-6 mb-4">
//           <BackButton />
//         </div> */}
//
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="my-8"
//         >
//           <h1 className="text-lg font-bold text-gray-900 mb-1">
//             ATS Score Check
//           </h1>
//           <p className="text-sm text-gray-600">
//             Analyze your resume for ATS (Applicant Tracking System)
//             compatibility
//           </p>
//         </motion.div>
//
//         {!result ? (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.1 }}
//             className="bg-white rounded-lg p-6 shadow-[0_0_3px_rgba(0,0,0,0.2)]"
//           >
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
//               {/* LEFT: Upload Resume */}
//               <div className="flex flex-col">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div
//                     className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${resumeFile ? "bg-green-500/20 text-green-600" : "bg-gray-100 text-gray-600"}`}
//                   >
//                     {resumeFile ? (
//                       <CheckCircle className="w-5 h-5" />
//                     ) : (
//                       "1"
//                     )}
//                   </div>
//                   <h2 className="text-xl font-semibold text-gray-900">
//                     Upload Resume
//                   </h2>
//                 </div>
//
//                 {resumeFile ? (
//                   <div className="relative flex-1 min-h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-green-400 bg-green-50 rounded-lg">
//                     <div className="flex flex-col items-center gap-2">
//                       <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
//                         <CheckCircle className="w-8 h-8 text-green-500" />
//                       </div>
//                       <p className="text-sm font-medium text-gray-900 text-center px-4">
//                         {resumeName}
//                       </p>
//                     </div>
//                     <button
//                       onClick={() => {
//                         setResumeFile(null);
//                         setResumeName("");
//                       }}
//                       className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 rounded-lg transition-colors shadow-sm"
//                     >
//                       <X className="w-3.5 h-3.5" />
//                       Clear
//                     </button>
//                   </div>
//                 ) : (
//                   <label className="relative flex-1 min-h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-white hover:bg-gray-100 cursor-pointer rounded-lg transition-colors">
//                     {loading ? (
//                       <LoadingSpinner />
//                     ) : (
//                       <>
//                         <Upload className="w-8 h-8 text-gray-600 mb-2" />
//                         <p className="text-sm text-gray-600">
//                           <span className="font-semibold">Click to upload</span>{" "}
//                           or drag and drop
//                         </p>
//                         <p className="text-xs text-gray-500 mt-1">
//                           PDF only (MAX. 10MB)
//                         </p>
//                       </>
//                     )}
//                     <input
//                       type="file"
//                       className="hidden"
//                       accept=".pdf"
//                       onChange={(e) => {
//                         const file = e.target.files?.[0];
//                         if (file) handleFileUpload(file);
//                       }}
//                     />
//                   </label>
//                 )}
//               </div>
//
//               {/* RIGHT: Job Description */}
//               <div className="flex flex-col">
//                 <div className="flex items-center gap-3 mb-4">
//                   <div
//                     className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${jobDescription ? "bg-green-500/20 text-green-600" : "bg-gray-100 text-gray-600"}`}
//                   >
//                     {jobDescription ? (
//                       <CheckCircle className="w-5 h-5" />
//                     ) : (
//                       "2"
//                     )}
//                   </div>
//                   <h2 className="text-xl font-semibold text-gray-900">
//                     Paste Job Description
//                   </h2>
//                 </div>
//
//                 <textarea
//                   value={jobDescription}
//                   onChange={(e) => handleJobDescriptionChange(e.target.value)}
//                   placeholder="Paste the job description here..."
//                   className="flex-1 min-h-[280px] w-full bg-gray-100 border border-gray-300 rounded-lg p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
//                 />
//               </div>
//             </div>
//
//             {/* Scan Button */}
//             {/* <div className="mt-6 flex justify-end relative group">
//               <button
//                 onClick={handleAnalyze}
//                 disabled={!bothFieldsReady || analyzing}
//                 className="h-14 px-8 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/25"
//               >
//                 {analyzing ? (
//                   <span className="flex items-center justify-center gap-2">
//                     <LoadingSpinner /> Scanning...
//                   </span>
//                 ) : (
//                   <>
//                     <Scan className="w-5 h-5" />
//                     Scan Resume
//                   </>
//                 )}
//               </button>
//               {!bothFieldsReady && (
//                 <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-10">
//                   <div className="bg-gray-100 text-gray-900 text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
//                     {!resumeFile &&
//                       !jobDescription.trim() &&
//                       "Upload resume and paste job description"}
//                     {!resumeFile &&
//                       jobDescription.trim() &&
//                       "Upload resume to continue"}
//                     {resumeFile &&
//                       !jobDescription.trim() &&
//                       "Paste job description to continue"}
//                   </div>
//                 </div>
//               )}
//             </div> */}
//             <div className="mt-6 flex justify-end" >
//               <Button onClick={handleAnalyze} disabled={!bothFieldsReady || analyzing}>Analyze</Button>
//             </div>
//           </motion.div>
//         ) : (
//           <div className="space-y-6">
//             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   {result.resumeName}
//                 </h2>
//                 <p className="text-sm text-gray-600">
//                   Analyzed {new Date(result.createdAt).toLocaleDateString()} ·
//                   ATS compatibility report
//                 </p>
//               </div>
//               <button
//                 onClick={handleReset}
//                 className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg transition-colors"
//               >
//                 Analyze Another Resume
//               </button>
//             </div>
//
//             {result.sectionScores.categories ? (
//               <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
//                 {/* LEFT: score circle + checklist of what was checked */}
//                 <div className="lg:col-span-4">
//                   <CategoryChecklist
//                     overallScore={result.overallScore}
//                     categories={result.sectionScores.categories}
//                   />
//                 </div>
//
//                 {/* RIGHT: feedback cards column (wider) */}
//                 <div className="lg:col-span-8 space-y-4">
//                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//                     <div className="bg-white/80 border border-gray-200/60 rounded-xl p-4">
//                       <p className="text-gray-600 text-xs mb-1">
//                         ATS Friendliness
//                       </p>
//                       <p className="text-xl font-bold text-gray-900">
//                         {result.atsFriendliness}%
//                       </p>
//                     </div>
//                     <div className="bg-white/80 border border-gray-200/60 rounded-xl p-4">
//                       <p className="text-gray-600 text-xs mb-1">
//                         Spelling & Grammar
//                       </p>
//                       <p className="text-xl font-bold text-gray-900">
//                         {result.spellingGrammar.score}%
//                       </p>
//                     </div>
//                     <div className="bg-white/80 border border-gray-200/60 rounded-xl p-4">
//                       <p className="text-gray-600 text-xs mb-1">
//                         Measurable Results
//                       </p>
//                       <p className="text-xl font-bold text-gray-900">
//                         {result.sectionScores.measurableResults.count} / 5+
//                       </p>
//                     </div>
//                     <div className="bg-white/80 border border-gray-200/60 rounded-xl p-4">
//                       <p className="text-gray-600 text-xs mb-1">
//                         Action Verbs Used
//                       </p>
//                       <p className="text-xl font-bold text-gray-900">
//                         {result.sectionScores.categories.recruiterTips.checks.find(
//                           (c) => c.label === "Action verbs",
//                         )?.status === "passed"
//                           ? "Good"
//                           : "Needs work"}
//                       </p>
//                     </div>
//                   </div>
//
//                   {(
//                     [
//                       "searchability",
//                       "hardSkills",
//                       "softSkills",
//                       "recruiterTips",
//                       "formatting",
//                     ] as const
//                   ).map((key, idx) => (
//                     <FeedbackCard
//                       key={key}
//                       category={result.sectionScores.categories![key]}
//                       index={idx}
//                     />
//                   ))}
//
//                   {result.sectionScores.matchBreakdown && (
//                     <JobMatchBreakdown
//                       matchBreakdown={result.sectionScores.matchBreakdown}
//                     />
//                   )}
//
//                   {result.spellingGrammar.errors.length > 0 && (
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                     >
//                       <h2 className="text-xl font-semibold text-gray-900 mb-4">
//                         Spelling & Grammar Errors
//                       </h2>
//                       <div className="bg-white rounded-lg p-6">
//                         <div className="space-y-3">
//                           {result.spellingGrammar.errors.map((error, idx) => (
//                             <div
//                               key={idx}
//                               className="bg-red-50 border border-red-200 rounded-lg p-4"
//                             >
//                               <div className="flex items-start gap-3">
//                                 <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
//                                 <div>
//                                   <p className="text-red-600 font-medium">
//                                     {error.message}
//                                   </p>
//                                   <p className="text-sm text-gray-600 mt-1">
//                                     Suggestion: {error.suggestion}
//                                   </p>
//                                 </div>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       </div>
//                     </motion.div>
//                   )}
//
//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                   >
//                     <h2 className="text-xl font-semibold text-gray-900 mb-4">
//                       Improvement Suggestions
//                     </h2>
//                     <SuggestionList
//                       suggestions={result.suggestions}
//                       title="Suggested Improvements"
//                     />
//                   </motion.div>
//                 </div>
//               </div>
//             ) : (
//               /* ---------- Legacy result layout (old analyses) ---------- */
//               <div className="space-y-6">
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   className="grid grid-cols-1 md:grid-cols-3 gap-4"
//                 >
//                   <div className="md:col-span-1">
//                     <ScoreCard
//                       score={result.overallScore}
//                       label="Overall ATS Score"
//                       size="lg"
//                       showProgress
//                     />
//                   </div>
//                   <div className="md:col-span-2 bg-white rounded-lg p-6">
//                     <h2 className="text-xl font-semibold text-gray-900 mb-4">
//                       Summary
//                     </h2>
//                     <div className="grid grid-cols-2 gap-4 mb-4">
//                       <div className="bg-gray-100 rounded-lg p-4">
//                         <p className="text-gray-600 text-sm mb-1">
//                           ATS Friendliness
//                         </p>
//                         <p className="text-2xl font-bold text-gray-900">
//                           {result.atsFriendliness}%
//                         </p>
//                       </div>
//                       <div className="bg-gray-100 rounded-lg p-4">
//                         <p className="text-gray-600 text-sm mb-1">
//                           Spelling & Grammar
//                         </p>
//                         <p className="text-2xl font-bold text-gray-900">
//                           {result.spellingGrammar.score}%
//                         </p>
//                       </div>
//                     </div>
//                     <button
//                       onClick={handleReset}
//                       className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg transition-colors"
//                     >
//                       Analyze Another Resume
//                     </button>
//                   </div>
//                 </motion.div>
//
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.1 }}
//                 >
//                   <h2 className="text-xl font-semibold text-gray-900 mb-4">
//                     Section Breakdown
//                   </h2>
//                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                     <SectionScoreCard
//                       sectionName="Summary"
//                       score={result.sectionScores.summary.score}
//                       feedback={result.sectionScores.summary.feedback}
//                     />
//                     <SectionScoreCard
//                       sectionName="Experience"
//                       score={result.sectionScores.experience.score}
//                       feedback={result.sectionScores.experience.feedback}
//                     />
//                     <SectionScoreCard
//                       sectionName="Projects"
//                       score={result.sectionScores.projects.score}
//                       feedback={result.sectionScores.projects.feedback}
//                     />
//                     <SectionScoreCard
//                       sectionName="Skills"
//                       score={result.sectionScores.skills.score}
//                       feedback={result.sectionScores.skills.feedback}
//                     />
//                     <SectionScoreCard
//                       sectionName="Contact Info"
//                       score={result.sectionScores.contactInfo.score}
//                       feedback={result.sectionScores.contactInfo.feedback}
//                       hasContactInfo={
//                         result.sectionScores.contactInfo.hasContactInfo
//                       }
//                     />
//                     <SectionScoreCard
//                       sectionName="Measurable Results"
//                       score={result.sectionScores.measurableResults?.score ?? 0}
//                       feedback={
//                         result.sectionScores.measurableResults?.feedback ??
//                         "No measurable result data available."
//                       }
//                     />
//                   </div>
//                 </motion.div>
//
//                 {result.sectionScores.matchBreakdown && (
//                   <JobMatchBreakdown
//                     matchBreakdown={result.sectionScores.matchBreakdown}
//                   />
//                 )}
//
//                 {result.spellingGrammar.errors.length > 0 && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: 0.2 }}
//                   >
//                     <h2 className="text-xl font-semibold text-gray-900 mb-4">
//                       Spelling & Grammar Errors
//                     </h2>
//                     <div className="bg-white rounded-lg p-6">
//                       <div className="space-y-3">
//                         {result.spellingGrammar.errors.map((error, idx) => (
//                           <div
//                             key={idx}
//                             className="bg-red-50 border border-red-200 rounded-lg p-4"
//                           >
//                             <div className="flex items-start gap-3">
//                               <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
//                               <div>
//                                 <p className="text-red-600 font-medium">
//                                   {error.message}
//                                 </p>
//                                 <p className="text-sm text-gray-600 mt-1">
//                                   Suggestion: {error.suggestion}
//                                 </p>
//                               </div>
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ delay: 0.3 }}
//                 >
//                   <h2 className="text-xl font-semibold text-gray-900 mb-4">
//                     Improvement Suggestions
//                   </h2>
//                   <SuggestionList
//                     suggestions={result.suggestions}
//                     title="Suggested Improvements"
//                   />
//                 </motion.div>
//               </div>
//             )}
//           </div>
//         )}
//       </Wrapper>
//
//       <AnalysisProgressModal
//         isOpen={pipelineOpen}
//         steps={PIPELINE_STEPS}
//         activeStep={activeStep}
//         completedSteps={completedSteps}
//         currentMessage={currentMessage}
//       />
//     </div>
//   );
// }
//

// ============================================================================
// UNLIMITED ATS CHECK VERSION — ACTIVE (ats-score-check endpoint is OFF)
// ============================================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, CheckCircle, XCircle, X } from "lucide-react";
import { toast } from "react-toastify";
import { unlimitedAtsApi } from "../api/api";
import ScoreCard from "../components/ui/ScoreCard";
import SectionScoreCard from "../components/SectionScoreCard";
import SuggestionList from "../components/SuggestionList";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import JobMatchBreakdown from "../components/JobMatchBreakdown";
import CategoryChecklist from "../components/ats-result/CategoryChecklist";
import FeedbackCard from "../components/ats-result/FeedbackCard";
import AnalysisProgressModal, {
  PipelineStep,
} from "../components/ui/AnalysisProgressModal";
import { AtsScoreHistory, ResumeContent } from "../types";
import Wrapper from "../components/Wrapper";
import Button from "@/components/ui/Button";

const PIPELINE_STEPS: PipelineStep[] = [
  { id: "resume", label: "Resume Analysis" },
  { id: "jd", label: "Job Description Analysis" },
  { id: "ats", label: "ATS Score Calculation" },
];

const PIPELINE_MESSAGES = [
  "Sending resume & job description...",
  "Extracting resume data...",
  "Parsing job description...",
  "Calculating ATS score...",
  "Analysis complete!",
];

export default function AtsScorePage() {
  const navigate = useNavigate();
  const [resumeName, setResumeName] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AtsScoreHistory | null>(null);
  const [pipelineOpen, setPipelineOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState(PIPELINE_MESSAGES[0]);

  const bothFieldsReady = !!resumeFile && !!jobDescription.trim();

  const handleJobDescriptionChange = (value: string) => {
    setJobDescription(value);
  };

  const handleFileUpload = async (file: File) => {
    setResumeFile(file);
    setResumeName(file.name);
  };

  const showMessage = (index: number, delay = 950) =>
    new Promise<void>((resolve) => {
      setCurrentMessage(PIPELINE_MESSAGES[index]);
      window.setTimeout(resolve, delay);
    });

  const handleAnalyze = async () => {
    if (!resumeFile) {
      toast.error("Please upload a resume");
      return;
    }
    if (!jobDescription.trim()) {
      toast.error("Please paste a job description");
      return;
    }

    setPipelineOpen(true);
    setAnalyzing(true);
    setActiveStep(0);
    setCompletedSteps([]);
    setCurrentMessage(PIPELINE_MESSAGES[0]);

    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription.trim());

      const response = await unlimitedAtsApi.analyze(formData);
      const data = response.data.data;

      console.log(data);
      if (!data || !data.score) {
        throw new Error("ATS analysis failed");
      }

      setCompletedSteps(["resume", "jd", "ats"]);
      setActiveStep(2);
      setCurrentMessage(PIPELINE_MESSAGES[3]);

      await showMessage(4, 1200);

      const score = data.score;
      const analysisResult: AtsScoreHistory = {
        id: `unlimited-${Date.now()}`,
        _id: `unlimited-${Date.now()}`,
        userId: "",
        title: resumeName,
        resumeName,
        overallScore: score.overallScore,
        sectionScores: {
          ...score.sectionScores,
          categories: score.categories,
          matchBreakdown: score.matchBreakdown,
        },
        spellingGrammar: score.spellingGrammar,
        atsFriendliness: score.atsFriendliness,
        suggestions: score.suggestions,
        resumeContent: {} as ResumeContent,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setPipelineOpen(false);
      setAnalyzing(false);
      setResult(analysisResult);
    } catch (error: any) {
      console.error("Analysis error:", error);
      setPipelineOpen(false);
      setAnalyzing(false);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to analyze resume",
      );
    }
  };

  const handleReset = () => {
    setResult(null);
    setResumeName("");
    setResumeFile(null);
    setJobDescription("");
  };

  return (
    <div className="min-h-screen bg-[#F6F9FC] pt-20 pb-12">
      <Wrapper>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-8"
        >
          <h1 className="text-lg font-bold text-gray-900 mb-1">
            ATS Score Check
          </h1>
          <p className="text-sm text-gray-600">
            Analyze your resume for ATS (Applicant Tracking System)
            compatibility — unlimited, no credits used
          </p>
        </motion.div>

        {!result ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg p-6 shadow-[0_0_3px_rgba(0,0,0,0.2)]"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* LEFT: Upload Resume */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${resumeFile ? "bg-green-500/20 text-green-600" : "bg-gray-100 text-gray-600"}`}
                  >
                    {resumeFile ? <CheckCircle className="w-5 h-5" /> : "1"}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Upload Resume
                  </h2>
                </div>

                {resumeFile ? (
                  <div className="relative flex-1 min-h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-green-400 bg-green-50 rounded-lg">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 text-center px-4">
                        {resumeName}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setResumeFile(null);
                        setResumeName("");
                      }}
                      className="absolute bottom-2 right-2 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300 rounded-lg transition-colors shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  </div>
                ) : (
                  <label className="relative flex-1 min-h-[280px] flex flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-white hover:bg-gray-100 cursor-pointer rounded-lg transition-colors">
                    {loading ? (
                      <LoadingSpinner />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-gray-600 mb-2" />
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF only (MAX. 10MB)
                        </p>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </label>
                )}
              </div>

              {/* RIGHT: Job Description */}
              <div className="flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${jobDescription ? "bg-green-500/20 text-green-600" : "bg-gray-100 text-gray-600"}`}
                  >
                    {jobDescription ? <CheckCircle className="w-5 h-5" /> : "2"}
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Paste Job Description
                  </h2>
                </div>

                <textarea
                  value={jobDescription}
                  onChange={(e) => handleJobDescriptionChange(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="flex-1 min-h-[280px] w-full bg-gray-100 border border-gray-300 rounded-lg p-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleAnalyze}
                disabled={!bothFieldsReady || analyzing}
              >
                Analyze
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {result.resumeName}
                </h2>
                <p className="text-sm text-gray-600">
                  Analyzed {new Date(result.createdAt).toLocaleDateString()} ·
                  ATS compatibility report
                </p>
              </div>
              <button
                onClick={handleReset}
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg transition-colors"
              >
                Analyze Another Resume
              </button>
            </div>

            {result.sectionScores.categories ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LEFT: score circle + checklist of what was checked */}
                <div className="lg:col-span-4">
                  <CategoryChecklist
                    overallScore={result.overallScore}
                    categories={result.sectionScores.categories}
                  />
                </div>

                {/* RIGHT: feedback cards column (wider) */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white/80 border border-gray-200/60 rounded-xl p-4">
                      <p className="text-gray-600 text-xs mb-1">
                        ATS Friendliness
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {result.atsFriendliness}%
                      </p>
                    </div>
                    <div className="bg-white/80 border border-gray-200/60 rounded-xl p-4">
                      <p className="text-gray-600 text-xs mb-1">
                        Spelling & Grammar
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {result.spellingGrammar.score}%
                      </p>
                    </div>
                    <div className="bg-white/80 border border-gray-200/60 rounded-xl p-4">
                      <p className="text-gray-600 text-xs mb-1">
                        Measurable Results
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {result.sectionScores.measurableResults.count} / 5+
                      </p>
                    </div>
                    <div className="bg-white/80 border border-gray-200/60 rounded-xl p-4">
                      <p className="text-gray-600 text-xs mb-1">
                        Action Verbs Used
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {result.sectionScores.categories.recruiterTips.checks.find(
                          (c) => c.label === "Action verbs",
                        )?.status === "passed"
                          ? "Good"
                          : "Needs work"}
                      </p>
                    </div>
                  </div>

                  {(
                    [
                      "searchability",
                      "hardSkills",
                      "softSkills",
                      "recruiterTips",
                      "formatting",
                    ] as const
                  ).map((key, idx) => (
                    <FeedbackCard
                      key={key}
                      category={result.sectionScores.categories![key]}
                      index={idx}
                    />
                  ))}

                  {result.sectionScores.matchBreakdown && (
                    <JobMatchBreakdown
                      matchBreakdown={result.sectionScores.matchBreakdown}
                    />
                  )}

                  {result.spellingGrammar.errors.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Spelling & Grammar Errors
                      </h2>
                      <div className="bg-white rounded-lg p-6">
                        <div className="space-y-3">
                          {result.spellingGrammar.errors.map((error, idx) => (
                            <div
                              key={idx}
                              className="bg-red-50 border border-red-200 rounded-lg p-4"
                            >
                              <div className="flex items-start gap-3">
                                <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                                <div>
                                  <p className="text-red-600 font-medium">
                                    {error.message}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Suggestion: {error.suggestion}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
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
                  <div className="md:col-span-2 bg-white rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Summary
                    </h2>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-100 rounded-lg p-4">
                        <p className="text-gray-600 text-sm mb-1">
                          ATS Friendliness
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {result.atsFriendliness}%
                        </p>
                      </div>
                      <div className="bg-gray-100 rounded-lg p-4">
                        <p className="text-gray-600 text-sm mb-1">
                          Spelling & Grammar
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {result.spellingGrammar.score}%
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleReset}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 px-4 rounded-lg transition-colors"
                    >
                      Analyze Another Resume
                    </button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Section Breakdown
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SectionScoreCard
                      sectionName="Summary"
                      score={result.sectionScores.summary.score}
                      feedback={result.sectionScores.summary.feedback}
                    />
                    <SectionScoreCard
                      sectionName="Experience"
                      score={result.sectionScores.experience.score}
                      feedback={result.sectionScores.experience.feedback}
                    />
                    <SectionScoreCard
                      sectionName="Projects"
                      score={result.sectionScores.projects.score}
                      feedback={result.sectionScores.projects.feedback}
                    />
                    <SectionScoreCard
                      sectionName="Skills"
                      score={result.sectionScores.skills.score}
                      feedback={result.sectionScores.skills.feedback}
                    />
                    <SectionScoreCard
                      sectionName="Contact Info"
                      score={result.sectionScores.contactInfo.score}
                      feedback={result.sectionScores.contactInfo.feedback}
                      hasContactInfo={
                        result.sectionScores.contactInfo.hasContactInfo
                      }
                    />
                    <SectionScoreCard
                      sectionName="Measurable Results"
                      score={result.sectionScores.measurableResults?.score ?? 0}
                      feedback={
                        result.sectionScores.measurableResults?.feedback ??
                        "No measurable result data available."
                      }
                    />
                  </div>
                </motion.div>

                {result.sectionScores.matchBreakdown && (
                  <JobMatchBreakdown
                    matchBreakdown={result.sectionScores.matchBreakdown}
                  />
                )}

                {result.spellingGrammar.errors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      Spelling & Grammar Errors
                    </h2>
                    <div className="bg-white rounded-lg p-6">
                      <div className="space-y-3">
                        {result.spellingGrammar.errors.map((error, idx) => (
                          <div
                            key={idx}
                            className="bg-red-50 border border-red-200 rounded-lg p-4"
                          >
                            <div className="flex items-start gap-3">
                              <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                              <div>
                                <p className="text-red-600 font-medium">
                                  {error.message}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  Suggestion: {error.suggestion}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
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
        )}
      </Wrapper>

      <AnalysisProgressModal
        isOpen={pipelineOpen}
        steps={PIPELINE_STEPS}
        activeStep={activeStep}
        completedSteps={completedSteps}
        currentMessage={currentMessage}
      />
    </div>
  );
}
