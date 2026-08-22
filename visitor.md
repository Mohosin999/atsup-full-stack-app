# Visitor Tracking - Implementation Documentation

## 1. Age Ki Chilo (Before)

### Backend

**Prisma Schema** (`backend/prisma/schema.prisma`) - No visitor related models existed.

**Admin Dashboard Service** (`backend/src/modules/admin-dashboard/admin-dashboard.service.ts`):
- `getActiveUsers()` function chilo - jeta today e resume ba ats check kora users count korto
- `getAdminDashboardMetrics()` function e `activeUsers` return korto

```typescript
// THIS CODE WAS REMOVED
export const getActiveUsers = async () => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const [resumeUsers, atsUsers] = await Promise.all([
    prisma.resume.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: startOfToday } },
    }),
    prisma.atsScoreHistory.groupBy({
      by: ['userId'],
      where: { createdAt: { gte: startOfToday } },
    }),
  ]);
  const userIds = new Set<string>();
  resumeUsers.forEach((u) => userIds.add(u.userId));
  atsUsers.forEach((u) => userIds.add(u.userId));
  return userIds.size;
};
```

### Frontend

**Types** (`frontend/src/types/index.ts`):
```typescript
// THIS FIELD WAS REMOVED
export interface AdminDashboardMetrics {
  totalUsers: number;
  activeUsers: number;        // <-- removed
  todayNewUsers: number;
  resumeBuilderUsersToday: number;
  atsCheckUsersToday: number;
  bestFeatureToday: string;
}
```

**AdminDashboard** (`frontend/src/pages/AdminDashboard.tsx`):
- "Active Users (Today)" card chilo pulsing indicator shoho
- `metrics.activeUsers` diye count dekhato

```tsx
// THIS CARD WAS REMOVED
<div className="p-4 xl:p-6 text-center border-b border-white/30 xl:border-r xl:border-b-0">
  <h3 className="text-xs font-medium flex items-center justify-center">
    Active Users (Today)
    <span className="relative flex h-2 w-2 ml-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
    </span>
  </h3>
  <p className="text-2xl lg:text-3xl font-bold mt-2">
    {metrics.activeUsers}
  </p>
</div>
```

---

## 2. Ki Add Korlam (After)

### Step 1: Prisma Schema - Visitor + SiteStats Model

**File:** `backend/prisma/schema.prisma`

```prisma
model Visitor {
  id            String   @id @default(cuid())
  fingerprint   String
  ipAddress     String?
  userAgent     String?
  lastVisitAt   DateTime @default(now())
  createdAt     DateTime @default(now())

  @@unique([fingerprint])
  @@index([lastVisitAt])
  @@map("visitors")
}

model SiteStats {
  id                   String   @id @default("singleton")
  totalUniqueVisitors  Int      @default(0)
  updatedAt            DateTime @updatedAt

  @@map("site_stats")
}
```

**Ki kore:**
- `Visitor` table -每一个 unique fingerprint ekhane store hoy
- `SiteStats` table - total unique visitor count rakhe (singleton row, query fast)

---

### Step 2: Backend - Visitor Service

**File:** `backend/src/modules/visitor/visitor.service.ts`

```typescript
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
```

**Ki kore:**
- `trackVisitor()` - fingerprint diye check kore, agor hole `lastVisitAt` update kore, notun hole `visitors` table e create + `site_stats.totalUniqueVisitors` increment kore
- `getTotalUniqueVisitors()` - `site_stats` theke total count return kore

---

### Step 3: Backend - Visitor Controller

**File:** `backend/src/modules/visitor/visitor.controller.ts`

```typescript
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
```

**Routes:**
- `POST /api/visitor/track` - visitor track kore
- `GET /api/visitor/count` - total count return kore

---

### Step 4: Backend - Routes Register

**File:** `backend/src/modules/index.ts`

```typescript
import visitorRoutes from "./visitor/visitor.routes";

export const moduleRoutes = [
  // ... existing routes
  { path: "/api/visitor", router: visitorRoutes },
];
```

---

### Step 5: Backend - Active Users Code Remove

**File:** `backend/src/modules/admin-dashboard/admin-dashboard.service.ts`

- `getActiveUsers()` function completely remove
- `getAdminDashboardMetrics()` theke `activeUsers` field remove

---

### Step 6: Frontend - Fingerprint + Tracking Hook

**File:** `frontend/src/hooks/useVisitorTracking.ts`

```typescript
import { useEffect } from "react";
import api from "../api/api";

function generateFingerprint(): string {
  const stored = localStorage.getItem("cvcoach_fp");
  if (stored) return stored;

  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width + "x" + screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || "",
    navigator.platform || "",
  ];

  let hash = 0;
  const str = components.join("|||");
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }

  const fp = "fp_" + Math.abs(hash).toString(36);
  localStorage.setItem("cvcoach_fp", fp);
  return fp;
}

export function useVisitorTracking() {
  useEffect(() => {
    const track = async () => {
      try {
        const fingerprint = generateFingerprint();
        await api.post("/visitor/track", { fingerprint });
      } catch {
        // silent fail
      }
    };

    track();
  }, []);
}
```

**Ki kore:**
- Browser fingerprint generate kore (userAgent + screen + timezone + language + hardwareConcurrency)
- localStorage e store kore (same browser e refresh korle same fingerprint thakbe)
- Hash generate kore `fp_xxxxx` format e
- `POST /api/visitor/track` call kore

---

### Step 7: Frontend - App.tsx e Hook Add

**File:** `frontend/src/App.tsx`

```typescript
import { useVisitorTracking } from "./hooks/useVisitorTracking";

function App() {
  // ...
  useVisitorTracking();  // <-- added

  return (
    // ... routes
  );
}
```

**Ki kore:** Jekono page load hole automatically visitor track hoy (auth/thakuk na thakuk).

---

### Step 8: Frontend - Types Update

**File:** `frontend/src/types/index.ts`

```typescript
export interface AdminDashboardMetrics {
  totalUsers: number;
  // activeUsers: number;     <-- removed
  todayNewUsers: number;
  resumeBuilderUsersToday: number;
  atsCheckUsersToday: number;
  bestFeatureToday: string;
}
```

---

### Step 9: Frontend - AdminDashboard Card Replace

**File:** `frontend/src/pages/AdminDashboard.tsx`

**State add:**
```typescript
const [totalVisitors, setTotalVisitors] = useState<number>(0);
```

**Visitor count fetch:**
```typescript
useEffect(() => {
  const fetchVisitorCount = async () => {
    try {
      const response = await api.get("/visitor/count");
      if (response.data.success) {
        setTotalVisitors(response.data.data.totalVisitors);
      }
    } catch (err) {
      console.error("Failed to fetch visitor count:", err);
    }
  };

  fetchVisitorCount();
  const interval = setInterval(fetchVisitorCount, 10000);
  return () => clearInterval(interval);
}, []);
```

**Card replace:**
```tsx
{/* Visitors - Active Users (Today) er jaigai */}
<div className="p-4 xl:p-6 text-center border-b border-white/30 xl:border-r xl:border-b-0">
  <h3 className="text-xs font-medium flex items-center justify-center">
    Total Visitors
    <span className="relative flex h-2 w-2 ml-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
    </span>
  </h3>
  <p className="text-2xl lg:text-3xl font-bold mt-2">
    {totalVisitors.toLocaleString()}
  </p>
</div>
```

---

## 3. Files Changed Summary

| # | File | Change |
|---|------|--------|
| 1 | `backend/prisma/schema.prisma` | Visitor + SiteStats model add |
| 2 | `backend/src/modules/visitor/visitor.service.ts` | Naya file - track + count logic |
| 3 | `backend/src/modules/visitor/visitor.controller.ts` | Naya file - API handlers |
| 4 | `backend/src/modules/visitor/visitor.routes.ts` | Naya file - routes |
| 5 | `backend/src/modules/index.ts` | Visitor routes register |
| 6 | `backend/src/modules/admin-dashboard/admin-dashboard.service.ts` | `getActiveUsers()` remove |
| 7 | `frontend/src/hooks/useVisitorTracking.ts` | Naya file - fingerprint + tracking |
| 8 | `frontend/src/App.tsx` | Hook import + use |
| 9 | `frontend/src/types/index.ts` | `activeUsers` field remove |
| 10 | `frontend/src/pages/AdminDashboard.tsx` | Active Users card → Visitors card |

---

## 4. How It Works (Flow)

```
User visits site
       ↓
App.tsx → useVisitorTracking() fires
       ↓
generateFingerprint() → hash(userAgent + screen + timezone + etc)
       ↓
POST /api/visitor/track { fingerprint }
       ↓
Backend checks: fingerprint exists in visitors table?
       ├─ YES → update lastVisitAt, return count
       └─ NO  → create visitor + increment site_stats.totalUniqueVisitors
       ↓
Admin Dashboard → GET /api/visitor/count → shows Total Visitors card
```

---

## 5. Unique vs Total Visitors

- **Ekjon user joto bar asuk, shudhu 1bar count hoy** (fingerprint same thakle)
- Same browser + same machine = same fingerprint = 1 visitor
- Different browser = different fingerprint = separate visitor
- Different machine + same browser = different fingerprint = separate visitor
