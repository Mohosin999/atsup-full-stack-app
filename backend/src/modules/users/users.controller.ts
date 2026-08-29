import { Response } from "express";
import { AuthRequest } from "../../shared/types";
import {
  getUserProfile,
  updateUserProfile,
  deleteUserAccount,
} from "./users.service";
import { updateProfileSchema } from "./users.validation";
import { env } from "../../shared/config/env";

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await getUserProfile(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
    });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = updateProfileSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error.issues[0].message,
      });
    }

    const user = await updateUserProfile(req.user.id, result.data);

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

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    await deleteUserAccount(req.user.id);

    const isProduction = env.nodeEnv === "production";
    const cookieConfig = {
      httpOnly: true,
      secure: isProduction,
      sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
      path: "/",
    };

    res.cookie("accessToken", "", { ...cookieConfig, maxAge: 0 });
    res.cookie("refreshToken", "", { ...cookieConfig, maxAge: 0 });

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting account",
    });
  }
};
