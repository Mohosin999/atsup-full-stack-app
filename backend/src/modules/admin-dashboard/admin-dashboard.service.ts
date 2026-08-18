import { prisma } from '../../lib/prisma';

export const getTotalUsers = async () => {
  return prisma.user.count();
};

export const getActiveUsers = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const [resumeUsers, atsUsers] = await Promise.all([
    prisma.resume.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    }),
    prisma.atsScoreHistory.groupBy({
      by: ['userId'],
      where: {
        createdAt: {
          gte: startOfToday,
        },
      },
    }),
  ]);
  const userIds = new Set<string>();
  resumeUsers.forEach((u) => userIds.add(u.userId));
  atsUsers.forEach((u) => userIds.add(u.userId));
  return userIds.size;
};

export const getTodayNewUsers = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  return prisma.user.count({
    where: {
      createdAt: {
        gte: startOfToday,
      },
    },
  });
};

export type GrowthPeriod = 'yesterday' | 'today' | '7d' | '14d' | '30d';

export interface GrowthData {
  period: GrowthPeriod;
  labels: string[];
  series: {
    atsUse: number[];
    resumeBuild: number[];
  };
  totals: {
    atsUse: number;
    resumeBuild: number;
    activity: number;
  };
  change: number;
}

const buildBuckets = (start: Date, end: Date, hourly: boolean) => {
  const keys: string[] = [];
  const labels: string[] = [];
  const cursor = new Date(start);

  while (cursor < end) {
    if (hourly) {
      const key = cursor.toISOString().slice(0, 13); // YYYY-MM-DDTHH
      keys.push(key);
      labels.push(`${key.slice(11)}:00`);
      cursor.setHours(cursor.getHours() + 1);
    } else {
      const key = cursor.toISOString().split('T')[0]; // YYYY-MM-DD
      keys.push(key);
      labels.push(`${key.slice(8)}/${key.slice(5, 7)}`);
      cursor.setDate(cursor.getDate() + 1);
    }
  }

  return { keys, labels };
};

const fetchSeries = async (
  model: 'atsScoreHistory' | 'resume',
  dateField: 'createdAt',
  start: Date,
  end: Date,
  hourly: boolean,
) => {
  const { keys, labels } = buildBuckets(start, end, hourly);
  const counts: Record<string, number> = {};
  keys.forEach((k) => (counts[k] = 0));

  const records = await (prisma[model] as any).findMany({
    where: {
      [dateField]: { gte: start, lt: end },
    },
    select: { [dateField]: true },
  });

  records.forEach((record: any) => {
    const t = new Date(record[dateField]);
    const key = hourly ? t.toISOString().slice(0, 13) : t.toISOString().split('T')[0];
    if (counts[key] !== undefined) counts[key]++;
  });

  return { labels, values: keys.map((k) => counts[k]) };
};

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

const getWindow = (period: GrowthPeriod) => {
  const now = new Date();
  let start = new Date(now);
  let end = new Date(now);
  let hourly = false;

  if (period === 'today') {
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 1);
    hourly = true;
  } else if (period === 'yesterday') {
    start.setDate(start.getDate() - 1);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(end.getDate() + 1);
    hourly = true;
  } else if (period === '7d') {
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
  } else if (period === '14d') {
    start.setDate(start.getDate() - 13);
    start.setHours(0, 0, 0, 0);
  } else {
    // 30d
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
  }

  const length = end.getTime() - start.getTime();
  const prevStart = new Date(start.getTime() - length);
  const prevEnd = new Date(start);

  return { start, end, prevStart, prevEnd, hourly };
};

export const getGrowthData = async (period: GrowthPeriod): Promise<GrowthData> => {
  const { start, end, prevStart, prevEnd, hourly } = getWindow(period);

  const [atsUse, resumeBuild, prevAtsUse, prevResumeBuild] = await Promise.all([
    fetchSeries('atsScoreHistory', 'createdAt', start, end, hourly),
    fetchSeries('resume', 'createdAt', start, end, hourly),
    fetchSeries('atsScoreHistory', 'createdAt', prevStart, prevEnd, hourly),
    fetchSeries('resume', 'createdAt', prevStart, prevEnd, hourly),
  ]);

  const activity = sum(atsUse.values) + sum(resumeBuild.values);
  const prevActivity = sum(prevAtsUse.values) + sum(prevResumeBuild.values);
  const change =
    prevActivity === 0
      ? 0
      : Math.round(((activity - prevActivity) / prevActivity) * 1000) / 10;

  return {
    period,
    labels: atsUse.labels,
    series: {
      atsUse: atsUse.values,
      resumeBuild: resumeBuild.values,
    },
    totals: {
      atsUse: sum(atsUse.values),
      resumeBuild: sum(resumeBuild.values),
      activity,
    },
    change,
  };
};

export const getResumeBuilderUsersToday = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const groups = await prisma.resume.groupBy({
    by: ['userId'],
    where: {
      createdAt: {
        gte: startOfToday,
      },
    },
  });
  return groups.length;
};

export const getATSCheckUsersToday = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const groups = await prisma.atsScoreHistory.groupBy({
    by: ['userId'],
    where: {
      createdAt: {
        gte: startOfToday,
      },
    },
  });
  return groups.length;
};

export const getBestFeatureToday = async () => {
  const [resumeCount, atsCount] = await Promise.all([
    getResumeBuilderUsersToday(),
    getATSCheckUsersToday(),
  ]);
  return resumeCount > atsCount ? 'resume-builder' : 'ats-check';
};

export const getAdminDashboardMetrics = async () => {
  const [
    totalUsers,
    activeUsers,
    todayNewUsers,
    resumeBuilderUsersToday,
    atsCheckUsersToday,
    bestFeatureToday,
  ] = await Promise.all([
    getTotalUsers(),
    getActiveUsers(),
    getTodayNewUsers(),
    getResumeBuilderUsersToday(),
    getATSCheckUsersToday(),
    getBestFeatureToday(),
  ]);

  return {
    totalUsers,
    activeUsers,
    todayNewUsers,
    resumeBuilderUsersToday,
    atsCheckUsersToday,
    bestFeatureToday,
  };
};
