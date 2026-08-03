import { Response } from "express";
import { getUserProfile } from "../../services/users";
import { AuthRequest } from "../../types";

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
