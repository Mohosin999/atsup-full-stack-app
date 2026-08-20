import { prisma } from "../../lib/prisma";

export interface CreateTicketData {
  type: string;
  title: string;
  message: string;
  attachment?: string;
}

export const createSupportTicket = async (
  userId: string,
  data: CreateTicketData,
) => {
  return prisma.supportTicket.create({
    data: {
      userId,
      type: data.type || "bug",
      title: data.title,
      message: data.message,
      attachment: data.attachment || null,
      status: "open",
    },
  });
};

export const getMyTickets = async (userId: string) => {
  return prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const getTicketById = async (id: string) => {
  return prisma.supportTicket.findUnique({ where: { id } });
};

export const getAllTickets = async () => {
  return prisma.supportTicket.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true, picture: true },
      },
    },
  });
};

export const updateTicketStatus = async (
  id: string,
  status: string,
) => {
  if (!["open", "in-progress", "resolved"].includes(status)) {
    throw Object.assign(new Error("Invalid status"), { status: 400 });
  }
  return prisma.supportTicket.update({
    where: { id },
    data: { status },
  });
};

export const deleteTicket = async (id: string) => {
  return prisma.supportTicket.delete({ where: { id } });
};