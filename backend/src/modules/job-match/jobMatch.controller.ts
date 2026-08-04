import { Response } from "express";
import { AuthRequest } from "../../shared/types";
import {
  getAllJobsByUser,
  createJob as createJobService,
  getJobById,
  updateJobById,
  deleteJobById,
} from "./subservices/jobs.service";
import { researchJobDescription } from "../../shared/ai/gemini/jobDescriptionResearch";
import { jobSchema } from "./validation/jobMatch.validation";

export const getAllJobs = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getAllJobsByUser(req.user.id, {
      page,
      limit,
    });

    res.json({
      success: true,
      data: result.jobs,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching job descriptions",
    });
  }
};

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const result = jobSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0].message,
      });
    }

    const job = await createJobService(result.data, req.user.id);

    res.status(201).json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error saving job description",
    });
  }
};

export const getSingleJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await getJobById(req.params.id, req.user.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job description not found",
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching job description",
    });
  }
};

export const updateJob = async (req: AuthRequest, res: Response) => {
  try {
    const result = jobSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0].message,
      });
    }

    const job = await updateJobById(req.params.id, req.user.id, result.data);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job description not found",
      });
    }

    res.json({
      success: true,
      data: job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating job description",
    });
  }
};

export const deleteJob = async (req: AuthRequest, res: Response) => {
  try {
    const job = await deleteJobById(req.params.id, req.user.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job description not found",
      });
    }

    res.json({
      success: true,
      message: "Job description deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting job description",
    });
  }
};

export const fetchFromUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "URL is required",
      });
    }

    const linkedInPatterns = [
      /linkedin\.com\/jobs\/view\/.*/i,
      /linkedin\.com\/jobs\/job\/.*/i,
      /linkedin\.com\/jobs\/collections\/.*/i,
      /linkedin\.com\/jobs\/.*/i,
    ];

    const isLinkedInUrl = linkedInPatterns.some((pattern) =>
      pattern.test(url),
    );

    if (!isLinkedInUrl) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid LinkedIn job posting URL",
      });
    }

    const mockDescription = `
      Senior Full Stack Developer
      
      About the Role:
      We are looking for a Senior Full Stack Developer to join our growing team. You will be responsible for building and maintaining web applications using modern technologies.
      
      Requirements:
      - 5+ years of experience in full stack development
      - Strong proficiency in React, Node.js, and TypeScript
      - Experience with cloud platforms (AWS, Azure, or GCP)
      - Familiarity with database design (PostgreSQL, MongoDB)
      - Excellent problem-solving skills
      
      Preferred Skills:
      - Experience with microservices architecture
      - Knowledge of CI/CD pipelines
      - Experience with Docker and Kubernetes
      - Strong communication skills
      
      Benefits:
      - Competitive salary
      - Health insurance
      - Remote work options
      - Professional development budget
    `;

    res.json({
      success: true,
      data: {
        title: "Senior Full Stack Developer",
        description: mockDescription,
        url: url,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching job description from URL",
    });
  }
};

export const parseJobDescription = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { description } = req.body;

    if (!description || description.trim().length < 20) {
      return res.status(400).json({
        success: false,
        message:
          "Job description is too short. Please provide a detailed job description.",
      });
    }

    const aiResult = await researchJobDescription(description.trim());

    res.status(200).json({
      success: true,
      data: aiResult,
    });
  } catch (error: any) {
    console.error("Job description parse error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to parse job description",
    });
  }
};
