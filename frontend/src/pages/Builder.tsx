import { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  User,
  FileText,
  Briefcase,
  Code,
  Award,
  GraduationCap,
  Wrench,
  Save,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAppSelector } from "../hooks/redux";
import { useResumeBuilder, useResumeContent } from "../hooks/useResumeBuilder";
import { Resume, ResumeContent } from "../types";
import { exportToPdf } from "../utils/pdfExport";
import BackButton from "../components/ui/BackButton";
import { resumeBuildHistoryApi } from "../api/api";
import PersonalInfoEditor from "../components/builder-editor/PersonalInfoEditor";
import SummaryEditorAI from "../components/builder-editor/SummaryEditorAI";
import ExperienceEditorAI from "../components/builder-editor/ExperienceEditorAI";
import ProjectsEditorAI from "../components/builder-editor/ProjectsEditorAI";
import AchievementsEditor from "../components/builder-editor/AchievementsEditor";
import EducationEditor from "../components/builder-editor/EducationEditor";
import SkillsEditorAI from "../components/builder-editor/SkillsEditorAI";
import { ResumePreview } from "@/components/builder-live-preview/ResumePreview";

const STORAGE_KEY = "resume_builder_state";

interface BuilderState {
  content: ResumeContent;
  currentStep: number;
  resumeId: string | null;
}

const defaultContent: ResumeContent = {
  personalInfo: {
    fullName: "",
    jobTitle: "",
    contact: {
      email: "",
      phone: "",
      address: { city: "", division: "", zipCode: "" },
      linkedIn: "",
      socialLinks: { github: "", portfolio: "", website: "" },
    },
  },
  summary: "",
  experience: [],
  projects: [],
  achievements: [],
  education: [],
  skills: [],
};

const saveToStorage = (state: BuilderState) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save to sessionStorage:", e);
  }
};

// const loadFromStorage = (): BuilderState | null => {
//   try {
//     const stored = sessionStorage.getItem(STORAGE_KEY);
//     if (stored) {
//       return JSON.parse(stored);
//     }
//   } catch (e) {
//     console.error("Failed to load from sessionStorage:", e);
//   }
//   return null;
// };

const clearStorage = () => {
  sessionStorage.removeItem(STORAGE_KEY);
};

interface Section {
  id: string;
  title: string;
  icon: React.ElementType;
  completed: boolean;
}

const SECTIONS: Section[] = [
  {
    id: "personal",
    title: "Personal Information",
    icon: User,
    completed: false,
  },
  {
    id: "summary",
    title: "Professional Summary",
    icon: FileText,
    completed: false,
  },
  {
    id: "experience",
    title: "Work Experience",
    icon: Briefcase,
    completed: false,
  },
  { id: "projects", title: "Projects", icon: Code, completed: false },
  { id: "achievements", title: "Achievements", icon: Award, completed: false },
  {
    id: "education",
    title: "Education",
    icon: GraduationCap,
    completed: false,
  },
  { id: "skills", title: "Skills", icon: Wrench, completed: false },
];

export default function Builder() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const { id: resumeId } = useParams<{ id: string }>();

  const builder = useResumeBuilder();
  const contentActions = useResumeContent(builder.content, builder.setContent);
  const [currentStep, setCurrentStep] = useState(0);
  const [sectionStates, setSectionStates] = useState<Section[]>(SECTIONS);
  const [loadingResume, setLoadingResume] = useState(false);

  const loadResumeById = useCallback(
    async (id: string) => {
      setLoadingResume(true);
      try {
        const response = await resumeBuildHistoryApi.getById(id);
        const resume = response.data.data;
        if (resume) {
          builder.setSelectedResume(resume as Resume);
          builder.setContent(resume.resumeContent);
          saveToStorage({
            content: resume.resumeContent,
            currentStep: 0,
            resumeId: id,
          });
        }
      } catch (error) {
        toast.error("Failed to load resume");
        navigate("/builder");
      } finally {
        setLoadingResume(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    if (resumeId) {
      loadResumeById(resumeId);
    } else {
      const passedResume = location.state?.resume as Resume | undefined;
      if (passedResume) {
        builder.setSelectedResume(passedResume);
        builder.setContent(passedResume.content);
        window.history.replaceState({}, document.title);
      } else {
        clearStorage();
        builder.setContent(defaultContent);
        builder.setSelectedResume(null as any);
        setCurrentStep(0);
      }
    }
  }, [resumeId, location.state]);

  useEffect(() => {
    if (builder.content || currentStep > 0) {
      saveToStorage({
        content: builder.content,
        currentStep,
        resumeId: builder.selectedResume?._id || null,
      });
    }
  }, [builder.content, currentStep, builder.selectedResume?._id]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  const checkSectionCompletion = (sectionId: string): boolean => {
    const { content } = builder;
    switch (sectionId) {
      case "personal":
        return (
          !!content.personalInfo?.fullName &&
          !!content.personalInfo?.contact?.email
        );
      case "summary":
        return !!content.summary && content.summary.length > 0;
      case "experience":
        return content.experience.length > 0;
      case "projects":
        return !!(content.projects && content.projects.length > 0);
      case "achievements":
        return !!(content.achievements && content.achievements.length > 0);
      case "education":
        return content.education.length > 0;
      case "skills":
        return (content.skills?.length || 0) > 0;
      default:
        return false;
    }
  };

  const goToNextStep = () => {
    const isCompleted = checkSectionCompletion(sectionStates[currentStep].id);
    if (isCompleted) {
      const updated = [...sectionStates];
      updated[currentStep] = { ...updated[currentStep], completed: true };
      setSectionStates(updated);
    }
    if (currentStep < sectionStates.length - 1) setCurrentStep(currentStep + 1);
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleExportPDF = async () => {
    try {
      await exportToPdf(builder.content);
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error(
        `Failed to export PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  const handleSave = async () => {
    const result = await builder.handleSaveResume();
    if (result?._id) {
      const newId = result._id;
      if (!builder.selectedResume?._id) {
        builder.setSelectedResume({ _id: newId } as Resume);
      }
      saveToStorage({
        content: builder.content,
        currentStep,
        resumeId: newId,
      });
    }
  };

  const renderSectionEditor = (section: Section) => {
    const { content, setContent } = builder;
    switch (section.id) {
      case "personal":
        return (
          <PersonalInfoEditor
            content={content}
            updateField={contentActions.updatePersonalInfo}
          />
        );
      case "summary":
        return (
          <SummaryEditorAI
            value={content.summary || ""}
            onChange={(val) => setContent({ ...content, summary: val })}
            personalInfo={content.personalInfo}
            skills={content.skills || []}
          />
        );
      case "experience":
        return (
          <ExperienceEditorAI
            experience={content.experience}
            onAdd={contentActions.addExperience}
            onUpdate={contentActions.updateExperience}
            onRemove={contentActions.removeExperience}
          />
        );
      case "projects":
        return (
          <ProjectsEditorAI
            projects={content.projects}
            onAdd={contentActions.addProject}
            onUpdate={contentActions.updateProject}
            onRemove={contentActions.removeProject}
          />
        );
      case "achievements":
        return (
          <AchievementsEditor
            achievements={content.achievements}
            onAdd={contentActions.addAchievement}
            onUpdate={contentActions.updateAchievement}
            onRemove={contentActions.removeAchievement}
          />
        );
      case "education":
        return (
          <EducationEditor
            education={content.education}
            onAdd={contentActions.addEducation}
            onUpdate={contentActions.updateEducation}
            onRemove={contentActions.removeEducation}
          />
        );
      case "skills":
        return (
          <SkillsEditorAI
            skills={content.skills || []}
            onAddSkill={contentActions.addSkill}
            onRemoveSkill={contentActions.removeSkill}
            jobTitle={content.personalInfo.jobTitle}
          />
        );
      default:
        return null;
    }
  };

  if (builder.loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );

  const currentSection = sectionStates[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === sectionStates.length - 1;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 pt-20 pb-12 relative">
      {/* Ambient emerald glow effect */}
      <div className="fixed top-20 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mt-6 mb-4">
          <BackButton />
        </div>

        {/* Two-Panel Layout */}
        <div className="flex flex-col lg:flex-row items-start justify-center gap-6">
          {/* Left Panel - Form Wizard */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[48%] flex-shrink-0"
          >
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-emerald-500/10 border border-emerald-500/20 overflow-hidden">
              {/* Progress Stepper - Green Gradient */}
              <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 p-4 relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2 lg:mb-3">
                    <p className="text-emerald-100 text-xs">
                      Step {currentStep + 1}/{sectionStates.length}
                    </p>
                    <p className="hidden lg:block text-emerald-100 text-xs font-medium">
                      {currentSection.title}
                    </p>
                  </div>
                  <div className="hidden lg:flex items-center justify-between gap-1">
                    {sectionStates.map((section, index) => {
                      const Icon = section.icon;
                      const isActive = index === currentStep;
                      const isCompleted =
                        section.completed || index < currentStep;
                      const displayTitle =
                        section.id === "summary"
                          ? "Summary"
                          : section.title.split(" ")[0];

                      return (
                        <button
                          key={section.id}
                          onClick={() => setCurrentStep(index)}
                          className="flex flex-col items-center gap-1"
                        >
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 ${
                              isActive
                                ? "bg-white text-emerald-700 shadow-xl ring-2 ring-white/50"
                                : isCompleted
                                  ? "bg-emerald-500 text-white"
                                  : "bg-white/20 text-white/60"
                            }`}
                          >
                            {isCompleted ? (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </div>
                          <span
                            className={`text-[9px] whitespace-nowrap ${
                              isActive
                                ? "text-white font-semibold"
                                : "text-emerald-100/70"
                            }`}
                          >
                            {displayTitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="lg:hidden flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1 pt-2">
                    {sectionStates.map((section, index) => {
                      const Icon = section.icon;
                      const isActive = index === currentStep;
                      const isCompleted =
                        section.completed || index < currentStep;
                      const displayTitle =
                        section.id === "summary"
                          ? "Summary"
                          : section.title.split(" ")[0];

                      return (
                        <button
                          key={section.id}
                          onClick={() => setCurrentStep(index)}
                          className="flex flex-col items-center gap-1 flex-shrink-0"
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                              isActive
                                ? "bg-white text-emerald-700 shadow-xl ring-2 ring-white/50 -mt-2"
                                : isCompleted
                                  ? "bg-emerald-500 text-white"
                                  : "bg-white/20 text-white/60"
                            }`}
                          >
                            {isCompleted ? (
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            ) : (
                              <Icon className="w-4 h-4" />
                            )}
                          </div>
                          <span
                            className={`text-[10px] whitespace-nowrap ${
                              isActive
                                ? "text-white font-semibold"
                                : "text-emerald-100/70"
                            }`}
                          >
                            {displayTitle}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Form Header - Green Theme */}
              <div className="bg-gradient-to-r from-emerald-800/20 via-emerald-700/10 to-emerald-600/20 p-4 border-b border-emerald-700/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <currentSection.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {currentSection.title}
                    </h2>
                    <p className="text-emerald-100 text-xs">
                      Fill in your details below
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <motion.div
                  key={currentSection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderSectionEditor(currentSection)}
                </motion.div>
              </div>

              {/* Form Footer - Navigation Buttons */}
              <div className="p-4 border-t border-emerald-700/20 bg-gray-900/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <motion.button
                    whileHover={{ scale: isFirstStep ? 1 : 1.02 }}
                    whileTap={{ scale: isFirstStep ? 1 : 0.98 }}
                    onClick={goToPreviousStep}
                    disabled={isFirstStep}
                    className={`hidden sm:flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${
                      isFirstStep
                        ? "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
                        : "bg-gray-800 text-white hover:bg-gray-700 border border-emerald-700/30"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </motion.button>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                    <motion.button
                      whileHover={{ scale: isFirstStep ? 1 : 1.02 }}
                      whileTap={{ scale: isFirstStep ? 1 : 0.98 }}
                      onClick={goToPreviousStep}
                      disabled={isFirstStep}
                      className={`sm:hidden flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all text-sm ${
                        isFirstStep
                          ? "bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700"
                          : "bg-gray-800 text-white hover:bg-gray-700 border border-emerald-700/30"
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" /> Previous
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSave}
                      disabled={builder.saving}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 gradient-btn font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4" /> Save
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={isLastStep ? handleExportPDF : goToNextStep}
                      disabled={builder.saving}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 gradient-btn font-medium text-sm"
                    >
                      {isLastStep ? (
                        <>
                          <ChevronRight className="w-4 h-4" /> Download PDF
                        </>
                      ) : (
                        <>
                          Next <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Live Resume Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-[52%] flex-shrink-0"
          >
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-2xl shadow-emerald-500/10 border border-emerald-500/20 overflow-hidden lg:sticky lg:top-24">
              {/* Preview Header */}
              <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-emerald-900 p-4 relative overflow-hidden">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between relative z-10 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white">
                        Live Resume Preview
                      </h2>
                      <p className="text-emerald-100 text-xs">
                        Updates as you type
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-2 px-4 py-2 bg-transparent border border-white rounded-lg text-white transition-all text-sm font-medium hover:bg-white/10"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Export PDF
                  </button>
                </div>
              </div>

              {/* Preview Content - No scrollbar, full width */}
              <div className="bg-gray-800/50">
                <div
                  className="bg-white min-h-[800px] w-full"
                  id="resume-preview-content"
                  style={{ padding: "12px" }}
                >
                  {/* Resume Personal Info */}
                  <ResumePreview content={builder.content} forPdf={true} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
