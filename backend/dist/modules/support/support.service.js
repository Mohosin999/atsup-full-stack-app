import { prisma } from "../../lib/prisma";
export const createSupportTicket = async (userId, data) => {
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
export const getMyTickets = async (userId) => {
    return prisma.supportTicket.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });
};
export const getTicketById = async (id) => {
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
export const updateTicketStatus = async (id, status) => {
    if (!["open", "in-progress", "resolved"].includes(status)) {
        throw Object.assign(new Error("Invalid status"), { status: 400 });
    }
    return prisma.supportTicket.update({
        where: { id },
        data: { status },
    });
};
export const deleteTicket = async (id) => {
    return prisma.supportTicket.delete({ where: { id } });
};
