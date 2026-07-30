import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { findUserById } from "../../services/auth";

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = await findUserById(req.user.id);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching user",
    });
  }
};
