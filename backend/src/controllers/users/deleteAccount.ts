import { Response } from "express";
import { AuthRequest } from "../../middlewares";
import { deleteUserAccount } from "../../services/users";

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    await deleteUserAccount(req.user.id);

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

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
