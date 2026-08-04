import { prisma } from "../../lib/prisma";
import { resumeAnalysisService } from "./subservices/analysis.service";
import {
  convertResumeToText,
  transformToAnalysisData,
} from "./subservices/analysis.transforms";

const httpError = (statusCode: number, message: string) =>
  Object.assign(new Error(message), { statusCode });

interface RunResumeAnalysisInput {
  resumeId: string;
  jobDescription: string;
  userId: string;
}

export const runResumeAnalysis = async ({
  resumeId,
  jobDescription,
  userId,
}: RunResumeAnalysisInput) => {
  if (!resumeId) {
    throw httpError(400, "Resume ID is required");
  }

  const resume = await prisma.resume.findFirst({
    where: { id: resumeId, userId },
  });

  if (!resume) {
    throw httpError(404, "Resume not found");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw httpError(404, "User not found");
  }

  const currentCredits = (user.subscription as any)?.credits ?? 0;

  if (currentCredits < 1) {
    throw httpError(
      403,
      `Insufficient credits. This task requires 1 credit. You have ${currentCredits} credits.`,
    );
  }

  if (!jobDescription || jobDescription.trim().length < 50) {
    throw httpError(
      400,
      "Job description is too short. Please provide a detailed job description (at least 50 characters).",
    );
  }

  const words = jobDescription.trim().split(/\s+/);
  const avgWordLength =
    jobDescription.replace(/\s/g, "").length / words.length;
  if (avgWordLength > 10 || words.length < 10) {
    throw httpError(
      400,
      "Job description appears to be invalid. Please provide a proper job description with multiple sentences.",
    );
  }

  const resumeText = convertResumeToText(resume.content);

  if (resumeText.length < 100) {
    throw httpError(
      400,
      "Resume content is too short. Please upload a complete resume with work experience, skills, and education.",
    );
  }

  const analysisResult = await resumeAnalysisService.analyze({
    resume: resume.content as any,
    resumeText,
    jobDescription: jobDescription || "",
  });

  const analysisData = transformToAnalysisData(
    analysisResult,
    resumeId,
    userId,
    jobDescription || "",
  );

  const analysis = await prisma.analysis.create({
    data: analysisData,
  });

  const updatedSubscription = {
    ...((user.subscription as any) || {}),
    credits: currentCredits - 1,
  };

  await prisma.user.update({
    where: { id: userId },
    data: { subscription: updatedSubscription },
  });

  return {
    analysis,
    credits: currentCredits - 1,
  };
};
