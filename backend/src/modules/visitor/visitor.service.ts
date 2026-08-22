import { prisma } from "../../lib/prisma";

export const trackVisitor = async (
  fingerprint: string,
  ipAddress?: string,
  userAgent?: string
) => {
  const existing = await prisma.visitor.findUnique({
    where: { fingerprint },
  });

  if (existing) {
    await prisma.visitor.update({
      where: { fingerprint },
      data: { lastVisitAt: new Date(), ipAddress, userAgent },
    });
    return { isNew: false };
  }

  await prisma.visitor.create({
    data: { fingerprint, ipAddress, userAgent },
  });

  await prisma.siteStats.upsert({
    where: { id: "singleton" },
    update: { totalUniqueVisitors: { increment: 1 } },
    create: { id: "singleton", totalUniqueVisitors: 1 },
  });

  return { isNew: true };
};

export const getTotalUniqueVisitors = async () => {
  const stats = await prisma.siteStats.findUnique({
    where: { id: "singleton" },
  });
  return stats?.totalUniqueVisitors ?? 0;
};
