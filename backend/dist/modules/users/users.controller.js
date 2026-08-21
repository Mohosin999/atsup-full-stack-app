import { getUserProfile, updateUserProfile, deleteUserAccount, } from "./users.service";
import { updateProfileSchema } from "./users.validation";
export const getProfile = async (req, res) => {
    try {
        const user = await getUserProfile(req.user.id);
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching profile",
        });
    }
};
export const updateProfile = async (req, res) => {
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating profile",
        });
    }
};
export const deleteAccount = async (req, res) => {
    try {
        await deleteUserAccount(req.user.id);
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({
            success: true,
            message: "Account deleted successfully",
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting account",
        });
    }
};
