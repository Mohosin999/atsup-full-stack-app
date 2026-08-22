import { Request, Response } from "express";
import { trackVisitor, getTotalUniqueVisitors } from "./visitor.service";

export const track = async (req: Request, res: Response) => {
  try {
    const { fingerprint } = req.body;
    if (!fingerprint) {
      return res
        .status(400)
        .json({ success: false, message: "Fingerprint required" });
    }

    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0] ||
      req.ip ||
      "";
    const userAgent = req.headers["user-agent"] || "";

    await trackVisitor(fingerprint, ipAddress, userAgent);
    const totalVisitors = await getTotalUniqueVisitors();

    res.json({
      success: true,
      data: { totalVisitors },
    });
  } catch (error) {
    console.error("Error tracking visitor:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getCount = async (_req: Request, res: Response) => {
  try {
    const totalVisitors = await getTotalUniqueVisitors();
    res.json({
      success: true,
      data: { totalVisitors },
    });
  } catch (error) {
    console.error("Error fetching visitor count:", error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
