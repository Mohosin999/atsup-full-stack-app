// import { useEffect, useRef, useState } from "react";
// import { motion } from "framer-motion";
// import { useNavigate, useParams, useLocation } from "react-router-dom";
// import { Download, ChevronDown } from "lucide-react";
// import { toast } from "react-toastify";
// import {
//   DndContext,
//   closestCenter,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   DragEndEvent,
// } from "@dnd-kit/core";
// import {
//   SortableContext,
//   arrayMove,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import {
//   ResumeContent,
//   SkillCategory,
//   Experience,
//   Project,
//   Education,
//   Achievement,
//   Certification,
//   SECTION_KEYS,
//   SectionKey,
// } from "../types";
// import { downloadAtsPdf, getSectionTitle } from "../utils/atsResume";
// import { resumeApi } from "../api/api";
// import { goToLogin } from "../utils/authGuard";
// import { useAppSelector } from "@/hooks";
// import ResumeBuilderSection from "../components/resume-builder/ResumeBuilderSection";
// import PersonalInfoForm from "../components/resume-builder/PersonalInfoForm";
// import SummaryForm from "../components/resume-builder/SummaryForm";
// import ExperienceForm from "../components/resume-builder/ExperienceForm";
// import SkillsForm from "../components/resume-builder/SkillsForm";
// import EducationForm from "../components/resume-builder/EducationForm";
// import ProjectsForm from "../components/resume-builder/ProjectsForm";
// import AchievementsForm from "../components/resume-builder/AchievementsForm";
// import CertificationsForm from "../components/resume-builder/CertificationsForm";
// import AtsResumePreview from "../components/resume-builder/AtsResumePreview";
// import LoadingSpinner from "../components/ui/LoadingSpinner";
// import Wrapper from "../components/Wrapper";

// const SECTION_SUBTITLES: Record<SectionKey, string> = {
//   summary: "Highlight your top skills and achievements",
//   experience: "List relevant jobs and key accomplishments",
//   skills: "Add your main skills for recruiters to see at a glance",
//   education: "Include degrees, schools, and graduation years",
//   projects: "Projects you've worked on",
//   achievements: "Awards, recognitions & wins",
//   certifications: "Licenses & certificates",
// };

// const defaultContent = (): ResumeContent => ({
//   personalInfo: {},
//   summary: "",
//   experience: [],
//   projects: [],
//   achievements: [],
//   education: [],
//   skills: [],
//   skillCategories: [],
//   certifications: [],
//   sectionTitles: {},
//   sectionOrder: [...SECTION_KEYS],
// });

// export default function ResumeBuilder() {
//   const { id } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();
//   const user = useAppSelector((state) => state.auth.user);
//   const isNew = location.pathname === "/resume-builder/new";
//   const [content, setContent] = useState<ResumeContent>(defaultContent);
//   const [resumeId, setResumeId] = useState<string | null>(null);
//   const [loading, setLoading] = useState(isNew ? false : true);
//   const [downloading, setDownloading] = useState(false);
//   const [saving, setSaving] = useState(false);
//   const [savedAt, setSavedAt] = useState<string | null>(null);
//   const [showMore, setShowMore] = useState(false);
//   const initializedRef = useRef(false);
//   const skipAutosaveRef = useRef(false);
//   const dirtyRef = useRef(false);
//   const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const resumeIdRef = useRef<string | null>(null);
//   const contentRef = useRef<ResumeContent>(defaultContent());
//   const savingRef = useRef(false);

//   // keep refs in sync with state for debounce closure
//   useEffect(() => {
//     resumeIdRef.current = resumeId;
//   }, [resumeId]);
//   useEffect(() => {
//     contentRef.current = content;
//   }, [content]);
//   useEffect(() => {
//     savingRef.current = saving;
//   }, [saving]);

//   const sensors = useSensors(
//     useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
//   );

//   const sectionOrder =
//     content.sectionOrder && content.sectionOrder.length
//       ? content.sectionOrder
//       : [...SECTION_KEYS];

//   const EXTRA_SECTIONS: SectionKey[] = ["achievements", "certifications"];
//   const visibleSections = sectionOrder.filter(
//     (key) => !EXTRA_SECTIONS.includes(key),
//   );

//   const handleSectionDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event;
//     if (!over || active.id === over.id) return;
//     const oldIndex = sectionOrder.indexOf(active.id as SectionKey);
//     const newIndex = sectionOrder.indexOf(over.id as SectionKey);
//     if (oldIndex === -1 || newIndex === -1) return;
//     setContent((prev) => ({
//       ...prev,
//       sectionOrder: arrayMove(sectionOrder, oldIndex, newIndex),
//     }));
//     dirtyRef.current = true;
//   };

//   useEffect(() => {
//     if (initializedRef.current) return;
//     initializedRef.current = true;

//     if (!user) {
//       setLoading(false);
//       goToLogin(
//         navigate,
//         isNew ? "/resume-builder/new" : `/resume-builder/${id}`,
//       );
//       return;
//     }

//     if (isNew) {
//       setLoading(false);
//     } else if (id) {
//       resumeApi
//         .getById(id)
//         .then((res) => {
//           skipAutosaveRef.current = true;
//           setContent({ ...defaultContent(), ...(res.data.data.content || {}) });
//           setResumeId(id);
//         })
//         .catch(() => {
//           toast.error("Failed to load resume.");
//           navigate("/resume-builder", { replace: true });
//         })
//         .finally(() => setLoading(false));
//     } else {
//       navigate("/resume-builder", { replace: true });
//     }
//   }, [id, isNew, navigate]);

//   // Debounce auto-save: 3s idle after last content change
//   useEffect(() => {
//     // skip initial load where we just populated content from DB
//     if (skipAutosaveRef.current) {
//       skipAutosaveRef.current = false;
//       dirtyRef.current = false;
//       return;
//     }
//     if (!user) return;
//     if (!dirtyRef.current) return;

//     if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

//     autoSaveTimerRef.current = setTimeout(async () => {
//       if (!dirtyRef.current) return;
//       if (savingRef.current) return;
//       const currentContent = contentRef.current;
//       const currentResumeId = resumeIdRef.current;
//       setSaving(true);
//       savingRef.current = true;
//       try {
//         let rid = currentResumeId;
//         if (!rid) {
//           const res = await resumeApi.createFromContent(currentContent);
//           rid = res.data.data.id;
//           resumeIdRef.current = rid;
//           setResumeId(rid);
//           navigate(`/resume-builder/${rid}`, { replace: true });
//         } else {
//           const res = await resumeApi.update(rid, { content: currentContent });
//           const returnedId = res.data.data?.id || rid;
//           resumeIdRef.current = returnedId;
//           setResumeId(returnedId);
//         }
//         dirtyRef.current = false;
//         setSavedAt(new Date().toLocaleTimeString());
//       } catch {
//         toast.error("Failed to auto-save resume.");
//       } finally {
//         setSaving(false);
//         savingRef.current = false;
//       }
//     }, 2000);

//     return () => {
//       if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [content, user, navigate]);

//   // flush pending save on unmount if still dirty
//   useEffect(() => {
//     return () => {
//       if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
//     };
//   }, []);

//   const handleDownload = async () => {
//     setDownloading(true);
//     try {
//       await downloadAtsPdf(content);
//     } catch (error) {
//       console.error("PDF export error:", error);
//       toast.error("Failed to generate PDF. Please try again.");
//     } finally {
//       setDownloading(false);
//     }
//   };



//   // ---- updaters ----
//   const markContentDirty = (
//     patch: Partial<ResumeContent> | ((prev: ResumeContent) => ResumeContent),
//   ) => {
//     dirtyRef.current = true;
//     if (typeof patch === "function") {
//       setContent(patch);
//     } else {
//       setContent((prev) => ({ ...prev, ...patch }));
//     }
//   };

//   const updateContent = (patch: Partial<ResumeContent>) =>
//     markContentDirty(patch);

//   const updatePersonalInfo = (personalInfo: ResumeContent["personalInfo"]) =>
//     markContentDirty({ personalInfo });

//   const setSkillCategories = (categories: SkillCategory[]) =>
//     markContentDirty((prev) => ({
//       ...prev,
//       skillCategories: categories,
//     }));

//   const setSectionTitle = (key: SectionKey, value: string) =>
//     markContentDirty((prev) => {
//       const current = prev.sectionTitles || {};
//       const next = { ...current };
//       if (value.trim()) next[key] = value.trim();
//       else delete next[key];
//       return { ...prev, sectionTitles: next };
//     });

//   const addExperience = () =>
//     markContentDirty((prev) => ({
//       ...prev,
//       experience: [
//         ...prev.experience,
//         {
//           company: "",
//           title: "",
//           location: "",
//           startDate: "",
//           endDate: "",
//           current: false,
//           highlights: [],
//         },
//       ],
//     }));

//   const updateExperience = (index: number, patch: Partial<Experience>) =>
//     markContentDirty((prev) => ({
//       ...prev,
//       experience: prev.experience.map((exp, i) =>
//         i === index ? { ...exp, ...patch } : exp,
//       ),
//     }));

//   const removeExperience = (index: number) =>
//     markContentDirty((prev) => ({
//       ...prev,
//       experience: prev.experience.filter((_, i) => i !== index),
//     }));

//   const addProject = () =>
//     markContentDirty((prev) => ({
//       ...prev,
//       projects: [
//         ...(prev.projects || []),
//         {
//           name: "",
//           highlights: [],
//           startDate: "",
//           endDate: "",
//           current: false,
//           links: {},
//         },
//       ],
//     }));

//   const updateProject = (index: number, patch: Partial<Project>) =>
//     markContentDirty((prev) => ({
//       ...prev,
//       projects: (prev.projects || []).map((proj, i) =>
//         i === index ? { ...proj, ...patch } : proj,
//       ),
//     }));

//   const removeProject = (index: number) =>
//     markContentDirty((prev) => ({
//       ...prev,
//       projects: (prev.projects || []).filter((_, i) => i !== index),
//     }));

//   const addEducation = () =>
//     markContentDirty((prev) => ({
//       ...prev,
//       education: [
//         ...prev.education,
//         {
//           institution: "",
//           degree: "",
//           areaOfStudy: "",
//           startDate: "",
//           endDate: "",
//           gpa: "",
//         },
//       ],
//     }));

//   const updateEducation = (index: number, patch: Partial<Education>) =>
//     markContentDirty((prev) => ({
//       ...prev,
//       education: prev.education.map((edu, i) =>
//         i === index ? { ...edu, ...patch } : edu,
//       ),
//     }));

//   const removeEducation = (index: number) =>
//     markContentDirty((prev) => ({
//       ...prev,
//       education: prev.education.filter((_, i) => i !== index),
//     }));

//   const addAchievement = () =>
//     markContentDirty((prev) => ({
//       ...prev,
//       achievements: [
//         ...(prev.achievements || []),
//         { title: "", date: "", description: "" },
//       ],
//     }));

//   const updateAchievement = (index: number, patch: Partial<Achievement>) =>
//     markContentDirty((prev) => ({
//       ...prev,
//       achievements: (prev.achievements || []).map((ach, i) =>
//         i === index ? { ...ach, ...patch } : ach,
//       ),
//     }));

//   const removeAchievement = (index: number) =>
//     markContentDirty((prev) => ({
//       ...prev,
//       achievements: (prev.achievements || []).filter((_, i) => i !== index),
//     }));

//   const addCertification = () =>
//     markContentDirty((prev) => ({
//       ...prev,
//       certifications: [
//         ...(prev.certifications || []),
//         { name: "", issuer: "", date: "" },
//       ],
//     }));

//   const updateCertification = (index: number, patch: Partial<Certification>) =>
//     markContentDirty((prev) => ({
//       ...prev,
//       certifications: (prev.certifications || []).map((cert, i) =>
//         i === index ? { ...cert, ...patch } : cert,
//       ),
//     }));

//   const removeCertification = (index: number) =>
//     markContentDirty((prev) => ({
//       ...prev,
//       certifications: (prev.certifications || []).filter((_, i) => i !== index),
//     }));

//   const renderSectionForm = (key: SectionKey) => {
//     switch (key) {
//       case "summary":
//         return (
//           <SummaryForm
//             value={content.summary || ""}
//             onChange={(value) => updateContent({ summary: value })}
//           />
//         );
//       case "experience":
//         return (
//           <ExperienceForm
//             experience={content.experience}
//             onAdd={addExperience}
//             onUpdate={updateExperience}
//             onRemove={removeExperience}
//           />
//         );
//       case "skills":
//         return (
//           <SkillsForm
//             skills={content.skills || []}
//             onSkillsChange={(skills) => updateContent({ skills })}
//             categories={content.skillCategories || []}
//             onChange={setSkillCategories}
//           />
//         );
//       case "education":
//         return (
//           <EducationForm
//             education={content.education}
//             onAdd={addEducation}
//             onUpdate={updateEducation}
//             onRemove={removeEducation}
//           />
//         );
//       case "projects":
//         return (
//           <ProjectsForm
//             projects={content.projects || []}
//             onAdd={addProject}
//             onUpdate={updateProject}
//             onRemove={removeProject}
//           />
//         );
//       case "achievements":
//         return (
//           <AchievementsForm
//             achievements={content.achievements || []}
//             onAdd={addAchievement}
//             onUpdate={updateAchievement}
//             onRemove={removeAchievement}
//           />
//         );
//       case "certifications":
//         return (
//           <CertificationsForm
//             certifications={content.certifications || []}
//             onAdd={addCertification}
//             onUpdate={updateCertification}
//             onRemove={removeCertification}
//           />
//         );
//       default:
//         return null;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center dark:bg-gray-800/50">
//         <LoadingSpinner />
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen lg:pt-24 pb-12">
//       <Wrapper className="!px-4 lg:!px-16">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="pt-8 lg:pt-0 pb-4  flex flex-col md:flex-row md:items-center md:justify-between gap-4"
//         >
//           <div>
//             <h1 className="text-base font-semibold text-gray-800 dark:text-gray-100">
//               ATS Resume Builder
//             </h1>
//             <p className="text-xs mt-1 text-gray-600 dark:text-gray-400">
//               ATS-friendly layout — no images, emojis, tables or underlines.
//             </p>
//           </div>

//           {/* Auto-save status + Download */}
//           <div className="flex items-center gap-3">
//             <span className="text-xs text-gray-500 flex items-center gap-1.5 dark:text-gray-400">
//               <span
//                 className={`w-2 h-2 rounded-full ${
//                   saving
//                     ? "bg-amber-400 animate-pulse"
//                     : dirtyRef.current
//                       ? "bg-amber-400"
//                       : "bg-cyan-500"
//                 }`}
//               />
//               {saving
//                 ? "Saving..."
//                 : savedAt
//                   ? `Auto-saved at ${savedAt}`
//                   : resumeId
//                     ? "Saved"
//                     : dirtyRef.current
//                       ? "Unsaved changes"
//                       : "Not saved yet"}
//             </span>
//             <button
//               onClick={handleDownload}
//               disabled={downloading}
//               className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-cyan-600 hover:bg-cyan-700 text-white  transition-all disabled:opacity-50 rounded-full"
//             >
//               <Download className="w-4 h-4" />
//               {downloading ? "Preparing..." : "Download PDF"}
//             </button>
//           </div>
//         </motion.div>

//         <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
//           {/* LEFT: form - hidden scrollbar */}
//           <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] lg:overflow-y-auto lg:pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
//             <ResumeBuilderSection
//               title="Profile Info"
//               subtitle="Include email, phone & linkedin for easy employer access"
//             >
//               <PersonalInfoForm
//                 personalInfo={content.personalInfo}
//                 onChange={updatePersonalInfo}
//               />
//             </ResumeBuilderSection>

//             <DndContext
//               sensors={sensors}
//               collisionDetection={closestCenter}
//               onDragEnd={handleSectionDragEnd}
//             >
//               <SortableContext
//                 items={sectionOrder}
//                 strategy={verticalListSortingStrategy}
//               >
//                 {visibleSections.map((key) => (
//                   <ResumeBuilderSection
//                     key={key}
//                     sortableId={key}
//                     title={getSectionTitle(content, key)}
//                     onTitleChange={(v) => setSectionTitle(key, v)}
//                     subtitle={SECTION_SUBTITLES[key]}
//                   >
//                     {renderSectionForm(key)}
//                   </ResumeBuilderSection>
//                 ))}
//                 {showMore &&
//                   EXTRA_SECTIONS.filter((key) =>
//                     sectionOrder.includes(key),
//                   ).map((key) => (
//                     <ResumeBuilderSection
//                       key={key}
//                       sortableId={key}
//                       title={getSectionTitle(content, key)}
//                       onTitleChange={(v) => setSectionTitle(key, v)}
//                       subtitle={SECTION_SUBTITLES[key]}
//                     >
//                       {renderSectionForm(key)}
//                     </ResumeBuilderSection>
//                   ))}
//               </SortableContext>
//             </DndContext>

//             {EXTRA_SECTIONS.some((key) => sectionOrder.includes(key)) && (
//               <button
//                 type="button"
//                 onClick={() => setShowMore(!showMore)}
//                 className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-cyan-600 hover:text-cyan-700 border border-dashed border-cyan-300 hover:bg-cyan-50 transition-all dark:hover:bg-cyan-500/10"
//               >
//                 {showMore ? "Show Less" : "Add More"}
//                 <ChevronDown
//                   className={`w-4 h-4 transition-transform duration-200 ${
//                     showMore ? "rotate-180" : ""
//                   }`}
//                 />
//               </button>
//             )}

//             {saving && (
//               <p className="text-xs text-center text-amber-600 dark:text-amber-400 animate-pulse">
//                 Saving...
//               </p>
//             )}
//             {savedAt && !saving && (
//               <p className="text-xs text-center text-gray-500 dark:text-gray-400">
//                 Auto-saved at {savedAt}
//               </p>
//             )}
//           </div>

//           {/* RIGHT: preview (2/3) - uses main page scrollbar */}
//           <div className="lg:col-span-3">
//             <AtsResumePreview content={content} />
//           </div>
//         </div>
//       </Wrapper>


//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Download, ChevronDown } from "lucide-react";
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
  const dirtyRef = useRef(false);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resumeIdRef = useRef<string | null>(null);
  const contentRef = useRef<ResumeContent>(defaultContent());
  const savingRef = useRef(false);

  // keep refs in sync with state for debounce closure
  useEffect(() => {
    resumeIdRef.current = resumeId;
  }, [resumeId]);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);
  useEffect(() => {
    savingRef.current = saving;
  }, [saving]);

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
    dirtyRef.current = true;
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (!user) {
      setLoading(false);
      goToLogin(
        navigate,
        isNew ? "/resume-builder/new" : `/resume-builder/${id}`,
      );
      return;
    }

    if (isNew) {
      setLoading(false);
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

  // Debounce auto-save: 3s idle after last content change
  useEffect(() => {
    // skip initial load where we just populated content from DB
    if (skipAutosaveRef.current) {
      skipAutosaveRef.current = false;
      dirtyRef.current = false;
      return;
    }
    if (!user) return;
    if (!dirtyRef.current) return;

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(async () => {
      if (!dirtyRef.current) return;
      if (savingRef.current) return;
      const currentContent = contentRef.current;
      const currentResumeId = resumeIdRef.current;
      setSaving(true);
      savingRef.current = true;
      try {
        let rid = currentResumeId;
        if (!rid) {
          const res = await resumeApi.createFromContent(currentContent);
          rid = res.data.data.id;
          resumeIdRef.current = rid;
          setResumeId(rid);
          navigate(`/resume-builder/${rid}`, { replace: true });
        } else {
          const res = await resumeApi.update(rid, { content: currentContent });
          const returnedId = res.data.data?.id || rid;
          resumeIdRef.current = returnedId;
          setResumeId(returnedId);
        }
        dirtyRef.current = false;
        setSavedAt(new Date().toLocaleTimeString());
      } catch {
        toast.error("Failed to auto-save resume.");
      } finally {
        setSaving(false);
        savingRef.current = false;
      }
    }, 2000);

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, user, navigate]);

  // flush pending save on unmount if still dirty
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, []);

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

  // ---- updaters ----
  const markContentDirty = (
    patch: Partial<ResumeContent> | ((prev: ResumeContent) => ResumeContent),
  ) => {
    dirtyRef.current = true;
    if (typeof patch === "function") {
      setContent(patch);
    } else {
      setContent((prev) => ({ ...prev, ...patch }));
    }
  };

  const updateContent = (patch: Partial<ResumeContent>) =>
    markContentDirty(patch);

  const updatePersonalInfo = (personalInfo: ResumeContent["personalInfo"]) =>
    markContentDirty({ personalInfo });

  const setSkillCategories = (categories: SkillCategory[]) =>
    markContentDirty((prev) => ({
      ...prev,
      skillCategories: categories,
    }));

  const setSectionTitle = (key: SectionKey, value: string) =>
    markContentDirty((prev) => {
      const current = prev.sectionTitles || {};
      const next = { ...current };
      if (value.trim()) next[key] = value.trim();
      else delete next[key];
      return { ...prev, sectionTitles: next };
    });

  const addExperience = () =>
    markContentDirty((prev) => ({
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
    markContentDirty((prev) => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, ...patch } : exp,
      ),
    }));

  const removeExperience = (index: number) =>
    markContentDirty((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));

  const addProject = () =>
    markContentDirty((prev) => ({
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
    markContentDirty((prev) => ({
      ...prev,
      projects: (prev.projects || []).map((proj, i) =>
        i === index ? { ...proj, ...patch } : proj,
      ),
    }));

  const removeProject = (index: number) =>
    markContentDirty((prev) => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index),
    }));

  const addEducation = () =>
    markContentDirty((prev) => ({
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
    markContentDirty((prev) => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, ...patch } : edu,
      ),
    }));

  const removeEducation = (index: number) =>
    markContentDirty((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));

  const addAchievement = () =>
    markContentDirty((prev) => ({
      ...prev,
      achievements: [
        ...(prev.achievements || []),
        { title: "", date: "", description: "" },
      ],
    }));

  const updateAchievement = (index: number, patch: Partial<Achievement>) =>
    markContentDirty((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).map((ach, i) =>
        i === index ? { ...ach, ...patch } : ach,
      ),
    }));

  const removeAchievement = (index: number) =>
    markContentDirty((prev) => ({
      ...prev,
      achievements: (prev.achievements || []).filter((_, i) => i !== index),
    }));

  const addCertification = () =>
    markContentDirty((prev) => ({
      ...prev,
      certifications: [
        ...(prev.certifications || []),
        { name: "", issuer: "", date: "" },
      ],
    }));

  const updateCertification = (index: number, patch: Partial<Certification>) =>
    markContentDirty((prev) => ({
      ...prev,
      certifications: (prev.certifications || []).map((cert, i) =>
        i === index ? { ...cert, ...patch } : cert,
      ),
    }));

  const removeCertification = (index: number) =>
    markContentDirty((prev) => ({
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
      <div className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-20 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:pt-24 pb-12 bg-stone-50 dark:bg-stone-950">
      <Wrapper className="!px-4 lg:!px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 lg:pt-0 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="font-fraunces text-2xl md:text-[1.75rem] text-stone-900 dark:text-stone-50">
              ATS Resume Builder
            </h1>
            <p className="font-plex text-sm text-stone-500 dark:text-stone-400 mt-1">
              ATS-friendly layout — no images, emojis, tables or underlines.
            </p>
          </div>

          {/* Auto-save status + Download */}
          <div className="font-plex flex items-center gap-3">
            <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  saving
                    ? "bg-amber-400 animate-pulse"
                    : dirtyRef.current
                      ? "bg-amber-400"
                      : "bg-emerald-500"
                }`}
              />
              {saving
                ? "Saving..."
                : savedAt
                  ? `Auto-saved at ${savedAt}`
                  : resumeId
                    ? "Saved"
                    : dirtyRef.current
                      ? "Unsaved changes"
                      : "Not saved yet"}
            </span>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-stone-900 dark:bg-lime-300 text-stone-50 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-lime-200 disabled:opacity-50 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              {downloading ? "Preparing..." : "Download PDF"}
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
          {/* LEFT: form - hidden scrollbar */}
          <div className="lg:col-span-2 space-y-4 lg:sticky lg:top-20 lg:h-[calc(100vh-80px)] lg:overflow-y-auto lg:pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                className="font-plex w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 border border-dashed border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800/60 rounded-lg transition-colors"
              >
                {showMore ? "Show less" : "Add more"}
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showMore ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}

            {saving && (
              <p className="font-plex text-xs text-center text-amber-600 dark:text-amber-400 animate-pulse">
                Saving...
              </p>
            )}
            {savedAt && !saving && (
              <p className="font-plex text-xs text-center text-stone-500 dark:text-stone-400">
                Auto-saved at {savedAt}
              </p>
            )}
          </div>

          {/* RIGHT: preview (2/3) - uses main page scrollbar */}
          <div className="lg:col-span-3">
            <AtsResumePreview content={content} />
          </div>
        </div>
      </Wrapper>
    </div>
  );
}