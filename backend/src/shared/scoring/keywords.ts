function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractSkillsFromResume(resume: any): string[] {
  const skills: string[] = [];
  if (Array.isArray(resume.skills)) {
    resume.skills.forEach((skill: string) => {
      if (skill && typeof skill === "string") {
        skills.push(skill.toLowerCase().trim());
      }
    });
  }
  return skills;
}


export function getSkillVariants(canonical: string): string[] {
  return [canonical];
}

// NOTE: 
export function countVariantsInText(text: string, variants: string[]): number {
  const textLower = text.toLowerCase();
  return variants.reduce((total, variant, index) => {
    const isAlias = index > 0;
    const escaped = escapeRegex(variant);
    const pattern = isAlias
      ? `(?<![\\w.-])${escaped}(?![\\w-])`
      : `\\b${escaped}\\b`;
    const matches = textLower.match(new RegExp(pattern, "gi"));
    return total + (matches ? matches.length : 0);
  }, 0);
}
