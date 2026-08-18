import { Response } from "express";
import { AuthRequest } from "../../shared/types";
import {
  getAdminDashboardMetrics,
  getGrowthData,
  GrowthPeriod,
} from "./admin-dashboard.service";

export const getMetrics = async (req: AuthRequest, res: Response) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

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
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    const period = (req.query.period as GrowthPeriod) || 'today';
    if (!['yesterday', 'today', '7d', '14d', '30d'].includes(period)) {
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
