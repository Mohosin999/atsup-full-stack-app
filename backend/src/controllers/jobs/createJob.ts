import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { createJob as createJobService } from "../../services/jobs";
import Joi from "joi";

const jobSchema = Joi.object({
  title: Joi.string().required().min(2).max(100),
  company: Joi.string().max(100),
  description: Joi.string().required().min(10),
});

export const createJob = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = jobSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const job = await createJobService(value, req.user.id);

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
