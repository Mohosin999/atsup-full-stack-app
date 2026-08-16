import { ResumeContent } from "../types";

export const formatResponse = <T>(success: boolean, data?: T, message?: string) => {
  return {
    success,
    ...(data && { data }),
    ...(message && { message })
  };
};

export const paginate = (page: number, limit: number) => {
  const skip = (page - 1) * limit;
  return { skip, limit };
};

export const experienceText = (
  exp: ResumeContent["experience"][number],
): string => (exp.responsibilities ?? []).join(" ");

export const projectText = (
  proj: NonNullable<ResumeContent["projects"]>[number],
): string => (proj.description ?? []).join(" ");

