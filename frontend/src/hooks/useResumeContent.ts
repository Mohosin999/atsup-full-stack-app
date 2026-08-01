/* ===================================
Custom Hook: useResumeContent
Handles content manipulation for resume builder
=================================== */
import { useCallback } from "react";
import { ResumeContent, Experience, Project, Achievement, Education } from "../types";

export function useResumeContent(
  content: ResumeContent,
  setContent: React.Dispatch<React.SetStateAction<ResumeContent>>
) {
  const updatePersonalInfo = useCallback((field: string, value: any) => {
    if (field.startsWith("address.")) {
      const addressField = field.split(".")[1];
      setContent((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          contact: {
            ...prev.personalInfo.contact,
            address: {
              ...prev.personalInfo.contact?.address,
              [addressField]: value,
            },
          },
        },
      }));
    } else if (field.startsWith("socialLinks.")) {
      const socialField = field.split(".")[1];
      setContent((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          contact: {
            ...prev.personalInfo.contact,
            socialLinks: {
              ...prev.personalInfo.contact?.socialLinks,
              [socialField]: value,
            },
          },
        },
      }));
    } else if (["email", "phone", "linkedIn"].includes(field)) {
      setContent((prev) => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          contact: { ...prev.personalInfo.contact, [field]: value },
        },
      }));
    } else {
      setContent((prev) => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, [field]: value },
      }));
    }
  }, [setContent]);

  const addExperience = useCallback(() => {
    setContent((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { company: "", title: "", topSkills: [], startDate: "", endDate: "", highlights: [], current: false },
      ],
    }));
  }, [setContent]);

  const updateExperience = useCallback((index: number, field: string, value: any) => {
    setContent((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  }, [setContent]);

  const removeExperience = useCallback((index: number) => {
    setContent((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }, [setContent]);

  const addProject = useCallback(() => {
    setContent((prev) => ({
      ...prev,
      projects: [...(prev.projects || []), { name: "", highlights: [], technologies: [], links: {} }],
    }));
  }, [setContent]);

  const updateProject = useCallback((index: number, field: string, value: any) => {
    setContent((prev) => {
      const updated = [...(prev.projects || [])];
      if (field.startsWith("links.")) {
        const linkField = field.split(".")[1];
        updated[index] = { ...updated[index], links: { ...updated[index].links, [linkField]: value } };
      } else if (field === "technologies") {
        updated[index] = { ...updated[index], technologies: value };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return { ...prev, projects: updated };
    });
  }, [setContent]);

  const removeProject = useCallback((index: number) => {
    setContent((prev) => ({
      ...prev,
      projects: prev.projects?.filter((_, i) => i !== index) || [],
    }));
  }, [setContent]);

  const addAchievement = useCallback(() => {
    setContent((prev) => ({
      ...prev,
      achievements: [...(prev.achievements || []), { title: "", description: "", date: "" }],
    }));
  }, [setContent]);

  const updateAchievement = useCallback((index: number, field: string, value: string) => {
    setContent((prev) => {
      const updated = [...(prev.achievements || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, achievements: updated };
    });
  }, [setContent]);

  const removeAchievement = useCallback((index: number) => {
    setContent((prev) => ({
      ...prev,
      achievements: prev.achievements?.filter((_, i) => i !== index) || [],
    }));
  }, [setContent]);

  const addEducation = useCallback(() => {
    setContent((prev) => ({
      ...prev,
      education: [...prev.education, { institution: "", degree: "", date: "" }],
    }));
  }, [setContent]);

  const updateEducation = useCallback((index: number, field: string, value: string) => {
    setContent((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  }, [setContent]);

  const removeEducation = useCallback((index: number) => {
    setContent((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }, [setContent]);

  const addSkill = useCallback((skill: string) => {
    setContent((prev) => {
      const currentSkills = prev.skills || [];
      if (skill && !currentSkills.includes(skill)) {
        return { ...prev, skills: [...currentSkills, skill] };
      }
      return prev;
    });
  }, [setContent]);

  const removeSkill = useCallback((skill: string) => {
    setContent((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s !== skill),
    }));
  }, [setContent]);

  return {
    updatePersonalInfo,
    addExperience,
    updateExperience,
    removeExperience,
    addProject,
    updateProject,
    removeProject,
    addAchievement,
    updateAchievement,
    removeAchievement,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    removeSkill,
  };
}
