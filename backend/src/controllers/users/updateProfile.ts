import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { updateUserProfile } from "../../services/users";
import Joi from "joi";

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(50),
  preferences: Joi.object({
    theme: Joi.string().valid("light", "dark", "system"),
    defaultTemplate: Joi.string(),
    notifications: Joi.boolean(),
  }),
});

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { error, value } = updateProfileSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const user = await updateUserProfile(req.user.id, value);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
};
