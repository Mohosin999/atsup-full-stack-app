import { Response } from "express";
import { AuthRequest } from "../../shared/types";
import { createSupportTicket, getMyTickets } from "./support.service";
import { notifyAdminSupport } from "../../socket/adminSocket";

export const createTicket = async (req: AuthRequest, res: Response) => {
  try {
    const { type, title, message } = req.body || {};
    if (!title || !title.trim() || !message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const attachment = (req as any).file
      ? `/uploads/${(req as any).file.filename}`
      : undefined;

    const ticket = await createSupportTicket(req.user.id, {
      type: type || "bug",
      title: title.trim().slice(0, 255),
      message: message.trim(),
      attachment,
    });

    // Notify the admin dashboard in real time
    notifyAdminSupport({ type: "new", ticket });

    res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Error creating support ticket:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting report",
    });
  }
};

export const getMyTicketsController = async (req: AuthRequest, res: Response) => {
  try {
    const tickets = await getMyTickets(req.user.id);
    res.json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    console.error("Error fetching my tickets:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching reports",
    });
  }
};