import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Download, RotateCcw, Sparkles, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  ResumeContent,
  SkillCategory,
  Experience,
  Project,
  Education,
  Achievement,
  Certification,
  SECTION_KEYS,
  SectionKey,
} from "../types";
import { downloadAtsPdf, getSectionTitle } from "../utils/atsResume";
import { resumeApi } from "../api/api";
import { goToLogin } from "../utils/authGuard";
import { useAppSelector } from "@/hooks";
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
import LoadingSpinner from "../components/ui/LoadingSpinner";
import Wrapper from "../components/Wrapper";

const SECTION_SUBTITLES: Record<SectionKey, string> = {
  summary: "Highlight your top skills and achievements",
  experience: "List relevant jobs and key accomplishments",
  skills: "Add your main skills for recruiters to see at a glance",
  education: "Include degrees, schools, and graduation years",
  projects: "Projects you've worked on",
  achievements: "Awards, recognitions & wins",
  certifications: "Licenses & certificates",
};

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
  sectionTitles: {},
  sectionOrder: [...SECTION_KEYS],
});

export default function ResumeBuilder() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const isNew = location.pathname === "/resume-builder/new";
  const [content, setContent] = useState<ResumeContent>(defaultContent);
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(isNew ? false : true);
  const [downloading, setDownloading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);
  const initializedRef = useRef(false);
  const skipAutosaveRef = useRef(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const sectionOrder =
    content.sectionOrder && content.sectionOrder.length
      ? content.sectionOrder
      : [...SECTION_KEYS];

  const EXTRA_SECTIONS: SectionKey[] = ["achievements", "certifications"];
  const visibleSections = sectionOrder.filter(
    (key) => !EXTRA_SECTIONS.includes(key),
  );

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sectionOrder.indexOf(active.id as SectionKey);
    const newIndex = sectionOrder.indexOf(over.id as SectionKey);
    if (oldIndex === -1 || newIndex === -1) return;
    setContent((prev) => ({
      ...prev,
      sectionOrder: arrayMove(sectionOrder, oldIndex, newIndex),
    }));
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (!user) {
      setLoading(false);
      goToLogin(navigate, isNew ? "/resume-builder/new" : `/resume-builder/${id}`);
      return;
    }

    if (isNew) {
      resumeApi
        .createFromContent(defaultContent())
        .then((res) => {
          const rid = res.data.data.id;
          setResumeId(rid);
          navigate(`/resume-builder/${rid}`, { replace: true });
        })
        .catch(() => {
          toast.error("Failed to create resume. Please try again.");
        })
        .finally(() => setLoading(false));
    } else if (id) {
      resumeApi
        .getById(id)
        .then((res) => {
          skipAutosaveRef.current = true;
          setContent({ ...defaultContent(), ...(res.data.data.content || {}) });
          setResumeId(id);
        })
        .catch(() => {
          toast.error("Failed to load resume.");
          navigate("/resume-builder", { replace: true });
        })
        .finally(() => setLoading(false));
    } else {
      navigate("/resume-builder", { replace: true });
    }
  }, [id, isNew, navigate]);

  useEffect(() => {
    if (!resumeId) return;
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      return;
    }
    setSaving(true);
    const timer = setTimeout(() => {
      resumeApi
        .update(resumeId, { content })
        .then((res) => {
          setResumeId(res.data.data?.id || resumeId);
          setSavedAt(new Date().toLocaleTimeString());
        })
        .catch(() => {
          toast.error("Failed to save resume.");
        })
        .finally(() => setSaving(false));
    }, 800);
    return () => clearTimeout(timer);
  }, [content, resumeId]);

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
    }));

  const setSectionTitle = (key: SectionKey, value: string) =>
    setContent((prev) => {
      const current = prev.sectionTitles || {};
      const next = { ...current };
      if (value.trim()) next[key] = value.trim();
      else delete next[key];
      return { ...prev, sectionTitles: next };
    });

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
      education: [
        ...prev.education,
        {
          institution: "",
          degree: "",
          areaOfStudy: "",
          startDate: "",
          endDate: "",
          gpa: "",
        },
      ],
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

  const renderSectionForm = (key: SectionKey) => {
    switch (key) {
      case "summary":
        return (
          <SummaryForm
            value={content.summary || ""}
            onChange={(value) => updateContent({ summary: value })}
          />
        );
      case "experience":
        return (
          <ExperienceForm
            experience={content.experience}
            onAdd={addExperience}
            onUpdate={updateExperience}
            onRemove={removeExperience}
          />
        );
      case "skills":
        return (
          <SkillsForm
            skills={content.skills || []}
            onSkillsChange={(skills) => updateContent({ skills })}
            categories={content.skillCategories || []}
            onChange={setSkillCategories}
          />
        );
      case "education":
        return (
          <EducationForm
            education={content.education}
            onAdd={addEducation}
            onUpdate={updateEducation}
            onRemove={removeEducation}
          />
        );
      case "projects":
        return (
          <ProjectsForm
            projects={content.projects || []}
            onAdd={addProject}
            onUpdate={updateProject}
            onRemove={removeProject}
          />
        );
      case "achievements":
        return (
          <AchievementsForm
            achievements={content.achievements || []}
            onAdd={addAchievement}
            onUpdate={updateAchievement}
            onRemove={removeAchievement}
          />
        );
      case "certifications":
        return (
          <CertificationsForm
            certifications={content.certifications || []}
            onAdd={addCertification}
            onUpdate={updateCertification}
            onRemove={removeCertification}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <Wrapper className="!px-4 lg:!px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-lg font-bold text-gray-800 mb-1">
              ATS Resume Builder
            </h1>
            <p className="text-sm text-gray-600">
              ATS-friendly layout — no images, emojis, tables or underlines.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  saving ? "bg-amber-400 animate-pulse" : "bg-cyan-500"
                }`}
              />
              {saving
                ? "Saving..."
                : savedAt
                  ? `Saved at ${savedAt}`
                  : resumeId
                    ? "Saved"
                    : ""}
            </span>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:border-red-500 hover:text-red-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
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
              title="Profile Info"
              subtitle="Include email, phone & linkedin for easy employer access"
            >
              <PersonalInfoForm
                personalInfo={content.personalInfo}
                onChange={updatePersonalInfo}
              />
            </ResumeBuilderSection>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSectionDragEnd}
            >
              <SortableContext
                items={sectionOrder}
                strategy={verticalListSortingStrategy}
              >
                {visibleSections.map((key) => (
                  <ResumeBuilderSection
                    key={key}
                    sortableId={key}
                    title={getSectionTitle(content, key)}
                    onTitleChange={(v) => setSectionTitle(key, v)}
                    subtitle={SECTION_SUBTITLES[key]}
                  >
                    {renderSectionForm(key)}
                  </ResumeBuilderSection>
                ))}
                {showMore &&
                  EXTRA_SECTIONS.filter((key) =>
                    sectionOrder.includes(key),
                  ).map((key) => (
                    <ResumeBuilderSection
                      key={key}
                      sortableId={key}
                      title={getSectionTitle(content, key)}
                      onTitleChange={(v) => setSectionTitle(key, v)}
                      subtitle={SECTION_SUBTITLES[key]}
                    >
                      {renderSectionForm(key)}
                    </ResumeBuilderSection>
                  ))}
              </SortableContext>
            </DndContext>

            {EXTRA_SECTIONS.some((key) => sectionOrder.includes(key)) && (
              <button
                type="button"
                onClick={() => setShowMore(!showMore)}
                className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-cyan-600 hover:text-cyan-700 border border-dashed border-cyan-300 rounded-xl hover:bg-cyan-50 transition-all"
              >
                {showMore ? "Show Less" : "Add More"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showMore ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
          </div>

          {/* RIGHT: preview (2/3) */}
          <div className="lg:col-span-3 lg:sticky lg:top-20">
            <AtsResumePreview content={content} />
          </div>
        </div>
      </Wrapper>
    </div>
  );
}
