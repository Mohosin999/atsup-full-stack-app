import { Response } from "express";
import { AuthRequest } from "../../shared/types";
import {
  getAdminDashboardMetrics,
  getGrowthData,
  getUsersForAdmin,
  setUserBan,
  adminUpdateUser,
  adminDeleteUser,
  GrowthPeriod,
  getAllResumesForAdmin,
  adminDeleteResume,
  adminDeleteAllResumes,
  getAllAtsScoresForAdmin,
  adminDeleteAtsScore,
  adminDeleteAllAtsScores,
} from "./admin-dashboard.service";
import {
  getAllTickets,
  updateTicketStatus,
  deleteTicket,
} from "../support/support.service";

const ensureAdmin = (req: AuthRequest, res: Response): boolean => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Access denied. Admin only.",
    });
    return false;
  }
  return true;
};

const sendError = (res: Response, error: any) => {
  const status = error?.status || 500;
  res.status(status).json({
    success: false,
    message: error?.message || "Internal server error",
  });
};

export const getMetrics = async (req: AuthRequest, res: Response) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const metrics = await getAdminDashboardMetrics();
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard metrics:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getGrowth = async (req: AuthRequest, res: Response) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const period = (req.query.period as GrowthPeriod) || "today";
    if (!["yesterday", "today", "7d", "14d", "30d"].includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Invalid period",
      });
    }

    const data = await getGrowthData(period);
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard growth:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const users = await getUsersForAdmin();
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching admin user list:", error);
    sendError(res, error);
  }
};

export const toggleBan = async (req: AuthRequest, res: Response) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const isBanned = !!req.body.isBanned;
    const user = await setUserBan(req.user.id, id, isBanned);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error toggling user ban:", error);
    sendError(res, error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const { name, role, credits } = req.body || {};
    const user = await adminUpdateUser(req.user.id, id, { name, role, credits });
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error updating user:", error);
    sendError(res, error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const { id } = req.params;
    await adminDeleteUser(req.user.id, id);
    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    sendError(res, error);
  }
};

export const getSupportTickets = async (req: AuthRequest, res: Response) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const tickets = await getAllTickets();
    res.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
    sendError(res, error);
  }
};

export const updateSupportTicket = async (req: AuthRequest, res: Response) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const { id } = req.params;
    const { status } = req.body || {};
    const ticket = await updateTicketStatus(id, status);
    res.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error("Error updating support ticket:", error);
    sendError(res, error);
  }
};

export const deleteSupportTicket = async (req: AuthRequest, res: Response) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const { id } = req.params;
    await deleteTicket(id);
    res.json({
      success: true,
      message: "Ticket deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting support ticket:", error);
    sendError(res, error);
  }
};

// ── All Resumes (admin) ──────────────────────────────────────────────

export const getAllResumes = async (req: AuthRequest, res: Response) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const resumes = await getAllResumesForAdmin();
    res.json({ success: true, data: resumes });
  } catch (error) {
    console.error("Error fetching all resumes:", error);
    sendError(res, error);
  }
};

export const deleteResume = async (req: AuthRequest, res: Response) => {
  if (!ensureAdmin(req, res)) return;
  try {
    await adminDeleteResume(req.params.id);
    res.json({ success: true, message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Error deleting resume:", error);
    sendError(res, error);
  }
};

export const deleteAllResumes = async (req: AuthRequest, res: Response) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const result = await adminDeleteAllResumes();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error deleting all resumes:", error);
    sendError(res, error);
  }
};

// ── All ATS Scores (admin) ───────────────────────────────────────────

export const getAllAtsScores = async (req: AuthRequest, res: Response) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const scores = await getAllAtsScoresForAdmin();
    res.json({ success: true, data: scores });
  } catch (error) {
    console.error("Error fetching all ATS scores:", error);
    sendError(res, error);
  }
};

export const deleteAtsScore = async (req: AuthRequest, res: Response) => {
  if (!ensureAdmin(req, res)) return;
  try {
    await adminDeleteAtsScore(req.params.id);
    res.json({ success: true, message: "ATS score deleted successfully" });
  } catch (error) {
    console.error("Error deleting ATS score:", error);
    sendError(res, error);
  }
};

export const deleteAllAtsScores = async (req: AuthRequest, res: Response) => {
  if (!ensureAdmin(req, res)) return;
  try {
    const result = await adminDeleteAllAtsScores();
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error deleting all ATS scores:", error);
    sendError(res, error);
  }
};