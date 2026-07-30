import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { useUserCredit } from "../../services/users";

export const useCredit = async (req: AuthRequest, res: Response) => {
  try {
    const credits = await useUserCredit(req.user.id);

    res.json({
      success: true,
      data: {
        credits,
      },
    });
  } catch (error: any) {
    const status = error.message === "User not found" ? 404 : 403;
    res.status(status).json({
      success: false,
      message: error.message || "Error using credit",
    });
  }
};
