import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "react-toastify";
import {
  ResumeContent,
  SkillCategory,
  Experience,
  Project,
  Education,
  Achievement,
  Certification,
} from "../types";
import { downloadAtsPdf } from "../utils/atsResume";
import BackButton from "../components/ui/BackButton";
import ResumeBuilderSection from "../components/resume-builder/ResumeBuilderSection";
import PersonalInfoForm from "../components/resume-builder/PersonalInfoForm";
import SummaryForm from "../components/resume-builder/SummaryForm";
import ExperienceForm from "../components/resume-builder/ExperienceForm";
import SkillsForm from "../components/resume-builder/SkillsForm";
import EducationForm from "../components/resume-builder/EducationForm";
import ProjectsForm from "../components/resume-builder/ProjectsForm";
import AchievementsForm from "../components/resume-builder/AchievementsForm";
import CertificationsForm from "../components/resume-builder/CertificationsForm";
import AtsResumePreview from "../components/resume-builder/AtsResumePreview";
import Wrapper from "../components/Wrapper";

const STORAGE_KEY = "cvcoach-resume-builder";

const defaultContent = (): ResumeContent => ({
  personalInfo: {},
  summary: "",
  experience: [],
  projects: [],
  achievements: [],
  education: [],
  skills: [],
  skillCategories: [],
  certifications: [],
});

const loadSavedContent = (): ResumeContent => {
  const defaults = defaultContent();
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaults, ...parsed };
    }
  } catch {
    // ignore corrupted storage
  }
  return defaults;
};

export default function ResumeBuilder() {
  const [content, setContent] = useState<ResumeContent>(loadSavedContent);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
    } catch {
      // storage full / unavailable
    }
  }, [content]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadAtsPdf(content);
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        "Reset the builder? All entered resume data will be cleared.",
      )
    ) {
      setContent(defaultContent());
    }
  };

  // ---- updaters ----
  const updateContent = (patch: Partial<ResumeContent>) =>
    setContent((prev) => ({ ...prev, ...patch }));

  const updatePersonalInfo = (personalInfo: ResumeContent["personalInfo"]) =>
    setContent((prev) => ({ ...prev, personalInfo }));

  const setSkillCategories = (categories: SkillCategory[]) =>
    setContent((prev) => ({
      ...prev,
      skillCategories: categories,
      skills: categories.flatMap((c) =>
        (c.skills || []).map((s) => s.trim()).filter(Boolean),
      ),
    }));

  const addExperience = () =>
    setContent((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: "",
          title: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          highlights: [],
        },
      ],
    }));

  const updateExperience = (index: number, patch: Partial<Experience>) =>
    setContent((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, ...patch } : exp,
      ),
    }));

  const removeExperience = (index: number) =>
    setContent((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));

  const addProject = () =>
    setContent((prev) => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        {
          name: "",
          highlights: [],
          startDate: "",
          endDate: "",
          current: false,
          links: {},
        },
      ],
    }));

  const updateProject = (index: number, patch: Partial<Project>) =>
    setContent((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((proj, i) =>
        i === index ? { ...proj, ...patch } : proj,
      ),
    }));

  const removeProject = (index: number) =>
    setContent((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index),
    }));

  const addEducation = () =>
    setContent((prev) => ({
      ...prev,
      education: [...prev.education, { institution: "", degree: "", date: "" }],
    }));

  const updateEducation = (index: number, patch: Partial<Education>) =>
    setContent((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, ...patch } : edu,
      ),
    }));

  const removeEducation = (index: number) =>
    setContent((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));

  const addAchievement = () =>
    setContent((prev) => ({
      ...prev,
      achievements: [
        ...(prev.achievements || []),
        { title: "", date: "", description: "" },
      ],
    }));

  const updateAchievement = (index: number, patch: Partial<Achievement>) =>
    setContent((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).map((ach, i) =>
        i === index ? { ...ach, ...patch } : ach,
      ),
    }));

  const removeAchievement = (index: number) =>
    setContent((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).filter((_, i) => i !== index),
    }));

  const addCertification = () =>
    setContent((prev) => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        { name: "", issuer: "", date: "" },
      ],
    }));

  const updateCertification = (index: number, patch: Partial<Certification>) =>
    setContent((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).map((cert, i) =>
        i === index ? { ...cert, ...patch } : cert,
      ),
    }));

  const removeCertification = (index: number) =>
    setContent((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).filter((_, i) => i !== index),
    }));

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <Wrapper>
        <div className="mt-6 mb-4">
          <BackButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              ATS Resume Builder
            </h1>
            <p className="text-gray-600 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-green-600" />
              ATS-friendly layout — no images, emojis, tables or underlines.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {downloading ? "Preparing..." : "Download PDF"}
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* LEFT: form (1/3) */}
          <div className="lg:col-span-2 space-y-4">
            <ResumeBuilderSection
              title="Personal Info"
              subtitle="Name, title & contact details"
              defaultOpen
            >
              <PersonalInfoForm
                personalInfo={content.personalInfo}
                onChange={updatePersonalInfo}
              />
            </ResumeBuilderSection>

            <ResumeBuilderSection
              title="Summary"
              subtitle="Short professional summary"
            >
              <SummaryForm
                value={content.summary || ""}
                onChange={(value) => updateContent({ summary: value })}
              />
            </ResumeBuilderSection>

            <ResumeBuilderSection
              title="Work Experience"
              subtitle="Roles, companies & bullet points"
            >
              <ExperienceForm
                experience={content.experience}
                onAdd={addExperience}
                onUpdate={updateExperience}
                onRemove={removeExperience}
              />
            </ResumeBuilderSection>

            <ResumeBuilderSection
              title="Skills"
              subtitle="Group skills into categories"
            >
              <SkillsForm
                categories={content.skillCategories || []}
                onChange={setSkillCategories}
              />
            </ResumeBuilderSection>

            <ResumeBuilderSection
              title="Education"
              subtitle="Degrees & institutions"
            >
              <EducationForm
                education={content.education}
                onAdd={addEducation}
                onUpdate={updateEducation}
                onRemove={removeEducation}
              />
            </ResumeBuilderSection>

            <ResumeBuilderSection
              title="Projects"
              subtitle="Projects with bullet points"
            >
              <ProjectsForm
                projects={content.projects || []}
                onAdd={addProject}
                onUpdate={updateProject}
                onRemove={removeProject}
              />
            </ResumeBuilderSection>

            <ResumeBuilderSection
              title="Achievements"
              subtitle="Awards, recognitions & wins"
            >
              <AchievementsForm
                achievements={content.achievements || []}
                onAdd={addAchievement}
                onUpdate={updateAchievement}
                onRemove={removeAchievement}
              />
            </ResumeBuilderSection>

            <ResumeBuilderSection
              title="Certifications"
              subtitle="Licenses & certificates"
            >
              <CertificationsForm
                certifications={content.certifications || []}
                onAdd={addCertification}
                onUpdate={updateCertification}
                onRemove={removeCertification}
              />
            </ResumeBuilderSection>
          </div>

          {/* RIGHT: preview (2/3) */}
          <div className="lg:col-span-3 lg:sticky lg:top-20">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
              {/* <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Live Preview
                </h2>
                <span className="text-xs text-gray-600">
                  Auto-saved to your browser
                </span>
              </div> */}
              <AtsResumePreview content={content} />
            </div>
          </div>
        </div>
      </Wrapper>
    </div>
  );
}
