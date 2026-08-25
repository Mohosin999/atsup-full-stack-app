# TanStack React Query Implementation - CVCoach

## Setup

### Package Install
```bash
npm install @tanstack/react-query
```

### Provider Setup (`frontend/src/main.tsx`)

**Before:**
```tsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import { store, AppDispatch } from './store';
import { fetchUser, tokenRefresh } from './store/slices/authSlice';
import './index.css';
import Navbar from './components/Navbar';

// ... InitializeApp ...

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <InitializeApp />
        <Navbar />
        <App />
        <ToastContainer ... />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
```

**After:**
```tsx
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import App from './App';
import { store, AppDispatch } from './store';
import { fetchUser, tokenRefresh } from './store/slices/authSlice';
import './index.css';
import Navbar from './components/Navbar';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,        // 30s obdhi data fresh thakbe
      retry: 1,                // 1 bar fail hole 1 bar retry
      refetchOnWindowFocus: false, // window focus e auto refetch bondho
    },
  },
});

// ... InitializeApp ...

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <InitializeApp />
          <Navbar />
          <App />
          <ToastContainer ... />
        </BrowserRouter>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);
```

**Ki add hoyeche:**
- `QueryClient` with `staleTime: 30000` (30s cache)
- `QueryClientProvider` wraps entire app
- Redux Provider仍然 exists (auth state er jonno)

---

## Serial 1: `ScanHistory.tsx` (ATS History Page)

**Before:**
```tsx
import { useState, useEffect, useRef } from "react";
import { atsScoreApi } from "../api/api";

// 8 ta useState
const [history, setHistory] = useState<AtsScoreHistory[]>([]);
const [loading, setLoading] = useState(true);
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalScans, setTotalScans] = useState(0);
const [deleteId, setDeleteId] = useState<string | null>(null);
const [clearAllOpen, setClearAllOpen] = useState(false);
const [editingId, setEditingId] = useState<string | null>(null);
const [editValue, setEditValue] = useState("");

// Manual fetch function
const fetchHistory = async (pageNum: number = 1) => {
  try {
    if (!user) { setLoading(false); return; }
    if (history.length === 0) setLoading(true);
    const response = await atsScoreApi.getHistory(pageNum, 10);
    setHistory(response.data.data || []);
    setTotalPages(response.data.pagination?.totalPages || 1);
    setTotalScans(response.data.pagination?.total || 0);
    setPage(pageNum);
  } catch { } finally { setLoading(false); }
};

// useEffect for initial fetch
useEffect(() => { fetchHistory(); }, []);

// Manual delete handler
const handleDelete = async (id: string) => {
  try {
    await atsScoreApi.delete(id);
    toast.success("Deleted successfully");
    fetchHistory(history.length === 1 && page > 1 ? page - 1 : page);
  } catch { toast.error("Failed to delete"); }
  setDeleteId(null);
};

// Manual rename handler
const handleRename = async (id: string) => {
  if (!editValue.trim()) return;
  try {
    await atsScoreApi.rename(id, editValue.trim());
    setHistory((prev) => prev.map((item) =>
      (item.id || (item as any)._id) === id
        ? { ...item, resumeName: editValue.trim() } : item
    ));
    setEditingId(null);
  } catch { toast.error("Failed to rename"); }
};

// Manual clear all handler
const handleClearAll = async () => {
  try {
    await atsScoreApi.deleteAll();
    toast.success("All history cleared");
    setHistory([]); setPage(1); setTotalPages(1); setTotalScans(0);
  } catch { toast.error("Failed to clear history"); }
  setClearAllOpen(false);
};
```

**After:**
```tsx
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { atsScoreApi } from "../api/api";

const queryClient = useQueryClient();

// 4 ta useState (UI state only)
const [page, setPage] = useState(1);
const [deleteId, setDeleteId] = useState<string | null>(null);
const [clearAllOpen, setClearAllOpen] = useState(false);
const [editingId, setEditingId] = useState<string | null>(null);
const [editValue, setEditValue] = useState("");

// useQuery - auto cache + refetch
const { data, isLoading: loading } = useQuery({
  queryKey: ["ats-history", user?._id, page],
  queryFn: async () => {
    if (!user) return { data: [], pagination: { totalPages: 1, total: 0 } };
    const res = await atsScoreApi.getHistory(page, 10);
    return {
      data: res.data.data || [],
      pagination: res.data.pagination || { totalPages: 1, total: 0 }
    };
  },
  enabled: !!user,
  placeholderData: (prev) => prev,  // page change e purana data dekhabe
});

const history = data?.data || [];
const totalPages = data?.pagination?.totalPages || 1;
const totalScans = data?.pagination?.total || 0;

// useMutation - auto cache invalidation
const deleteMutation = useMutation({
  mutationFn: (id: string) => atsScoreApi.delete(id),
  onSuccess: () => {
    toast.success("Deleted successfully");
    queryClient.invalidateQueries({ queryKey: ["ats-history", user?._id] });
    if (history.length === 1 && page > 1) setPage(page - 1);
  },
  onError: () => toast.error("Failed to delete"),
});

const renameMutation = useMutation({
  mutationFn: ({ id, name }: { id: string; name: string }) =>
    atsScoreApi.rename(id, name),
  onSuccess: (_, variables) => {
    // Optimistic UI update - cache e directly update
    queryClient.setQueryData(
      ["ats-history", user?._id, page],
      (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: old.data.map((item: AtsScoreHistory) =>
            (item.id || (item as any)._id) === variables.id
              ? { ...item, resumeName: variables.name }
              : item
          ),
        };
      }
    );
    setEditingId(null);
  },
  onError: () => toast.error("Failed to rename"),
});

const clearAllMutation = useMutation({
  mutationFn: () => atsScoreApi.deleteAll(),
  onSuccess: () => {
    toast.success("All history cleared");
    queryClient.invalidateQueries({ queryKey: ["ats-history", user?._id] });
    setPage(1);
  },
  onError: () => toast.error("Failed to clear history"),
});

// JSX e button handlers:
// onConfirm={() => deleteMutation.mutate(deleteId)}
// onConfirm={() => clearAllMutation.mutate()}
// onBlur={() => renameMutation.mutate({ id: item.id, name: editValue.trim() })}
```

**Ki bad gelo:**
- `useState` for `history`, `loading`, `totalPages`, `totalScans` - sob state managed by useQuery
- `fetchHistory` manual function - useQuery auto fetch
- `handleDelete`, `handleRename`, `handleClearAll` async functions - useMutation replace
- `useEffect(() => { fetchHistory(); }, [])` - useQuery auto initial fetch

**Ki add hoyeche:**
- `useQuery` with `queryKey`, `queryFn`, `enabled`, `placeholderData`
- `useMutation` with `mutationFn`, `onSuccess`, `onError`
- `queryClient.invalidateQueries()` for cache invalidation
- `queryClient.setQueryData()` for optimistic UI update
- `placeholderData: (prev) => prev` for smooth page transitions

---

## Serial 2: `AtsScoreDetail.tsx` (ATS Report Detail Page)

**Before:**
```tsx
import { useEffect, useState, useRef } from "react";
import { atsScoreApi, unlimitedAtsApi } from "../api/api";

const [result, setResult] = useState<AtsScoreHistory | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

// Complex useEffect with cleanup
useEffect(() => {
  if (!historyId) { setError("No ATS report specified."); setLoading(false); return; }
  let active = true;
  setLoading(true); setError("");
  atsScoreApi.getById(historyId)
    .then((res) => {
      if (!active) return;
      const score = res.data?.data;
      if (!score) { setError("ATS report not found."); return; }
      const analysisResult: AtsScoreHistory = { /* ... */ };
      setResult(analysisResult);
    })
    .catch((err) => {
      if (!active) return;
      setError(err?.response?.data?.message || "Failed to load ATS report.");
    })
    .finally(() => { if (active) setLoading(false); });
  return () => { active = false; };
}, [historyId]);

// Rescan handler updates result directly
if (history) {
  const updated: AtsScoreHistory = { /* ... */ };
  setResult(updated);  // direct state update
}
```

**After:**
```tsx
import { useState, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { atsScoreApi, unlimitedAtsApi } from "../api/api";

// useQuery - no cleanup needed
const { data: result, isLoading: loading, error: queryError } = useQuery<AtsScoreHistory | null>({
  queryKey: ["ats-report", historyId],
  queryFn: async () => {
    if (!historyId) return null;
    const res = await atsScoreApi.getById(historyId);
    const score = res.data?.data;
    if (!score) return null;
    return { /* ... map score to AtsScoreHistory ... */ };
  },
  enabled: !!historyId,
});

// Error derived from query state
const error = !historyId
  ? "No ATS report specified."
  : queryError
    ? (queryError as any)?.response?.data?.message || "Failed to load ATS report."
    : !loading && !result
      ? "ATS report not found."
      : "";

// Rescan updates cache directly
if (history) {
  const updated: AtsScoreHistory = { /* ... */ };
  queryClient.setQueryData(["ats-report", historyId], updated);
  queryClient.invalidateQueries({ queryKey: ["ats-history"] });
}
```

**Ki bad gelo:**
- `useState` for `result`, `loading`, `error` - managed by useQuery
- `useEffect` with `let active = true` cleanup pattern - useQuery handles cancellation
- Manual `.then()/.catch()/.finally()` chain - useQuery declarative

**Ki add hoyeche:**
- `useQuery` with `queryKey`, `queryFn`, `enabled`
- `queryClient.setQueryData()` for rescan optimistic update
- `queryClient.invalidateQueries()` for history list refresh

---

## Serial 3: `AtsScore.tsx` (ATS Scan Page)

**Before:**
```tsx
import { useState, useEffect } from "react";
import { atsScoreApi } from "../api/api";

const [recentScans, setRecentScans] = useState<AtsScoreHistory[]>([]);

useEffect(() => {
  if (!user) return;
  atsScoreApi.getHistory(1, 3)
    .then((res) => setRecentScans(res.data.data || []))
    .catch(() => {});
}, [user]);
```

**After:**
```tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { atsScoreApi } from "../api/api";

// useQuery replaces useState + useEffect
const { data: recentScans = [] } = useQuery<AtsScoreHistory[]>({
  queryKey: ["ats-recent-scans", user?._id],
  queryFn: async () => {
    if (!user) return [];
    const res = await atsScoreApi.getHistory(1, 3);
    return res.data.data || [];
  },
  enabled: !!user,
});
```

**Ki bad gelo:**
- `useState` for `recentScans`
- `useEffect` with manual `.then()/.catch()`

**Ki add hoyeche:**
- `useQuery` with `queryKey`, `queryFn`, `enabled`
- Cache key shared with ScanHistory (`ats-history`) - invalidation auto-sync

---

## Serial 4: `ResumeHistory.tsx` (Resume History Page)

**Before:**
```tsx
import { useState, useEffect, useRef } from "react";
import { resumeApi } from "../api/api";

const [resumes, setResumes] = useState<ResumeListItem[]>([]);
const [loading, setLoading] = useState(true);
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
const [totalResumes, setTotalResumes] = useState(0);
const [deleteId, setDeleteId] = useState<string | null>(null);
const [duplicateId, setDuplicateId] = useState<string | null>(null);
const [clearAllOpen, setClearAllOpen] = useState(false);
const [editingId, setEditingId] = useState<string | null>(null);
const [editValue, setEditValue] = useState("");

const fetchResumes = async (pageNum: number = 1) => {
  try {
    if (!user) { setLoading(false); return; }
    if (resumes.length === 0) setLoading(true);
    const response = await resumeApi.getAll(pageNum, 10, "builder");
    setResumes(response.data.data || []);
    setTotalPages(response.data.pagination?.pages || 1);
    setTotalResumes(response.data.pagination?.total || items.length);
    setPage(pageNum);
  } catch { } finally { setLoading(false); }
};

useEffect(() => { fetchResumes(); }, []);

const handleDelete = async (id: string) => { /* ... manual ... */ };
const handleRename = async (id: string) => { /* ... manual ... */ };
const handleClearAll = async () => { /* ... manual ... */ };
const handleDuplicate = async (id: string) => { /* ... manual ... */ };
```

**After:**
```tsx
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeApi } from "../api/api";

const queryClient = useQueryClient();

const [page, setPage] = useState(1);
const [deleteId, setDeleteId] = useState<string | null>(null);
const [duplicateId, setDuplicateId] = useState<string | null>(null);
const [clearAllOpen, setClearAllOpen] = useState(false);
const [editingId, setEditingId] = useState<string | null>(null);
const [editValue, setEditValue] = useState("");

const { data, isLoading: loading } = useQuery({
  queryKey: ["resumes", user?._id, page],
  queryFn: async () => {
    if (!user) return { data: [], pagination: { pages: 1, total: 0 } };
    const res = await resumeApi.getAll(page, 10, "builder");
    return { data: res.data.data || [], pagination: res.data.pagination || { pages: 1, total: 0 } };
  },
  enabled: !!user,
  placeholderData: (prev) => prev,
});

const resumes = data?.data || [];
const totalPages = data?.pagination?.pages || 1;
const totalResumes = data?.pagination?.total || 0;

const deleteMutation = useMutation({
  mutationFn: (id: string) => resumeApi.delete(id),
  onSuccess: () => {
    toast.success("Resume deleted");
    queryClient.invalidateQueries({ queryKey: ["resumes", user?._id] });
    if (resumes.length === 1 && page > 1) setPage(page - 1);
  },
  onError: () => toast.error("Failed to delete resume"),
});

const renameMutation = useMutation({
  mutationFn: ({ id, name }: { id: string; name: string }) =>
    resumeApi.update(id, {
      metadata: { ...resumes.find((r) => r.id === id)?.metadata, originalName: name },
    }),
  onSuccess: (_, variables) => {
    queryClient.setQueryData(["resumes", user?._id, page], (old: any) => {
      if (!old) return old;
      return {
        ...old,
        data: old.data.map((r: ResumeListItem) =>
          r.id === variables.id
            ? { ...r, metadata: { ...r.metadata, originalName: variables.name } }
            : r
        ),
      };
    });
    setEditingId(null);
  },
  onError: () => toast.error("Failed to rename"),
});

const duplicateMutation = useMutation({
  mutationFn: (id: string) => resumeApi.duplicate(id),
  onSuccess: () => {
    toast.success("Resume duplicated");
    queryClient.invalidateQueries({ queryKey: ["resumes", user?._id] });
  },
  onError: () => toast.error("Failed to duplicate resume"),
});

const clearAllMutation = useMutation({
  mutationFn: () => resumeApi.deleteAll(),
  onSuccess: () => {
    toast.success("All resumes deleted");
    queryClient.invalidateQueries({ queryKey: ["resumes", user?._id] });
    setPage(1);
  },
  onError: () => toast.error("Failed to delete resumes"),
});
```

**Ki bad gelo:**
- 9 ta `useState` (resumes, loading, totalPages, totalResumes) - sob query managed
- `fetchResumes` manual function
- `handleDelete`, `handleRename`, `handleClearAll`, `handleDuplicate` async functions
- `useEffect(() => { fetchResumes(); }, [])` 

**Ki add hoyeche:**
- `useQuery` for data fetching + cache
- 4 ta `useMutation` for delete/rename/duplicate/clearAll
- `queryClient.invalidateQueries()` + `queryClient.setQueryData()`

---

## Serial 5: `AdminDashboard.tsx` (Admin Overview)

**Before:**
```tsx
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "../api/api";

const dispatch = useDispatch();
const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
const [totalVisitors, setTotalVisitors] = useState<number>(0);
const [loading, setLoading] = useState(true);
const [period, setPeriod] = useState<GrowthPeriod>("today");
const [growth, setGrowth] = useState<GrowthData | null>(null);
const [growthLoading, setGrowthLoading] = useState(true);
const [dropdownOpen, setDropdownOpen] = useState(false);
const [activeView, setActiveView] = useState<"overview" | "users" | "support">("overview");
const [supportOpenCount, setSupportOpenCount] = useState(0);
const [supportRefreshKey, setSupportRefreshKey] = useState(0);
const [refreshing, setRefreshing] = useState(false);

// Single fetchAll with Promise.all
const fetchAll = useCallback(async () => {
  if (!user || user.role !== "admin") return;
  setRefreshing(true);
  try {
    const [metricsRes, supportRes, visitorRes, growthRes] = await Promise.all([
      api.get("/admin-dashboard/metrics"),
      api.get("/admin-dashboard/support"),
      api.get("/visitor/count"),
      api.get(`/admin-dashboard/growth?period=${period}`),
    ]);
    if (metricsRes.data.success) setMetrics(metricsRes.data.data);
    if (supportRes.data.success) {
      const open = supportRes.data.data.filter((t: any) => t.status === "open").length;
      setSupportOpenCount(open);
    }
    if (visitorRes.data.success) setTotalVisitors(visitorRes.data.data.totalVisitors);
    if (growthRes.data.success) setGrowth(growthRes.data.data);
  } catch (err) {
    console.error("Failed to fetch dashboard data:", err);
  } finally {
    setLoading(false);
    setRefreshing(false);
    setGrowthLoading(false);
  }
}, [user, period]);

useEffect(() => { fetchAll(); }, [fetchAll]);
```

**After:**
```tsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";

const queryClient = useQueryClient();

// UI state only
const [period, setPeriod] = useState<GrowthPeriod>("today");
const [dropdownOpen, setDropdownOpen] = useState(false);
const [activeView, setActiveView] = useState<"overview" | "users" | "support">("overview");
const [supportRefreshKey, setSupportRefreshKey] = useState(0);

// 4 separate queries - independent cache + refetch
const { data: metrics, isLoading: loading } = useQuery<AdminDashboardMetrics | null>({
  queryKey: ["admin-metrics"],
  queryFn: async () => {
    const res = await api.get("/admin-dashboard/metrics");
    return res.data.success ? res.data.data : null;
  },
  enabled: !!user && user.role === "admin",
});

const { data: growth, isLoading: growthLoading } = useQuery<GrowthData | null>({
  queryKey: ["admin-growth", period],
  queryFn: async () => {
    const res = await api.get(`/admin-dashboard/growth?period=${period}`);
    return res.data.success ? res.data.data : null;
  },
  enabled: !!user && user.role === "admin",
});

const { data: supportData } = useQuery({
  queryKey: ["admin-support-count"],
  queryFn: async () => {
    const res = await api.get("/admin-dashboard/support");
    if (res.data.success) {
      return res.data.data.filter((t: any) => t.status === "open").length;
    }
    return 0;
  },
  enabled: !!user && user.role === "admin",
});

const { data: visitorData } = useQuery({
  queryKey: ["admin-visitors"],
  queryFn: async () => {
    const res = await api.get("/visitor/count");
    return res.data.success ? res.data.data.totalVisitors : 0;
  },
  enabled: !!user && user.role === "admin",
});

const supportOpenCount = supportData ?? 0;
const totalVisitors = visitorData ?? 0;
const isRefreshing = loading || growthLoading;

// Refresh button - invalidate all queries
const handleRefresh = () => {
  queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
  queryClient.invalidateQueries({ queryKey: ["admin-growth", period] });
  queryClient.invalidateQueries({ queryKey: ["admin-support-count"] });
  queryClient.invalidateQueries({ queryKey: ["admin-visitors"] });
};
```

**Ki bad gelo:**
- `useCallback` + `useEffect` + `fetchAll` - replaced by 4 independent useQuery
- `useState` for `metrics`, `growth`, `totalVisitors`, `supportOpenCount`, `loading`, `growthLoading`, `refreshing` - managed by queries
- `import { useDispatch }` + `dispatch` unused - removed

**Ki add hoyeche:**
- 4 independent `useQuery` - each with own cache key
- `period` change auto refetches growth query only
- `handleRefresh` via `queryClient.invalidateQueries()`
- `enabled` guard for admin role

---

## Serial 6: `Dashboard.tsx` (User Dashboard)

**Before:**
```tsx
import { useState, useEffect } from "react";
import { atsScoreApi, resumeApi } from "../api/api";

const [totalAtsHistory, setTotalAtsHistory] = useState(0);
const [totalResumes, setTotalResumes] = useState(0);
const [recentScans, setRecentScans] = useState<any[]>([]);
const [recentResumes, setRecentResumes] = useState<any[]>([]);
const [loadingStats, setLoadingStats] = useState(true);
const [statsError, setStatsError] = useState(false);

const fetchData = async () => {
  setLoadingStats(true); setStatsError(false);
  try {
    const [atsRes, resumesRes, recentScansRes, recentResumesRes] = await Promise.all([
      atsScoreApi.getHistory(1, 1),
      resumeApi.getAll(1, 1),
      atsScoreApi.getHistory(1, 5),
      resumeApi.getAll(1, 5),
    ]);
    setTotalAtsHistory(atsRes.data.pagination?.total || 0);
    setTotalResumes(resumesRes.data.pagination?.total || 0);
    setRecentScans(recentScansRes.data.data || []);
    setRecentResumes(recentResumesRes.data.data || []);
  } catch (error) {
    setStatsError(true);
  } finally { setLoadingStats(false); }
};

useEffect(() => { fetchData(); }, [location.pathname]);
```

**After:**
```tsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { atsScoreApi, resumeApi } from "../api/api";

// Local state for derived data
const [totalAtsHistory, setTotalAtsHistory] = useState(0);
const [totalResumes, setTotalResumes] = useState(0);
const [recentScans, setRecentScans] = useState<any[]>([]);
const [recentResumes, setRecentResumes] = useState<any[]>([]);

const { isLoading: loadingStats, error: statsError, refetch: fetchData } = useQuery({
  queryKey: ["dashboard-stats", user?._id],
  queryFn: async () => {
    if (!user) return null;
    const [atsRes, resumesRes, recentScansRes, recentResumesRes] = await Promise.all([
      atsScoreApi.getHistory(1, 1),
      resumeApi.getAll(1, 1),
      atsScoreApi.getHistory(1, 5),
      resumeApi.getAll(1, 5),
    ]);
    setTotalAtsHistory(atsRes.data.pagination?.total || 0);
    setTotalResumes(resumesRes.data.pagination?.total || 0);
    setRecentScans(recentScansRes.data.data || []);
    setRecentResumes(recentResumesRes.data.data || []);
    return true;
  },
  enabled: !!user,
});

// QuickStats onRetry:
// onRetry={() => fetchData()}
```

**Ki bad gelo:**
- `useEffect(() => { fetchData(); }, [location.pathname])` - useQuery auto refetch
- `loadingStats`, `statsError` useState - replaced by query state

**Ki add hoyeche:**
- `useQuery` with `refetch` exported as `fetchData` for retry button
- `enabled: !!user` guard

---

## Serial 7: `UserManagement.tsx` (Admin - User Management)

**Before:**
```tsx
import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const [users, setUsers] = useState<AdminUser[]>([]);
const [loading, setLoading] = useState(true);
const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
const [busyId, setBusyId] = useState<string | null>(null);

const fetchUsers = async () => {
  setLoading(true);
  try {
    const res = await api.get('/admin-dashboard/users');
    if (res.data.success) setUsers(res.data.data);
  } catch (err) { console.error('Failed to fetch users:', err); }
  finally { setLoading(false); }
};

useEffect(() => { fetchUsers(); }, []);

const toggleBan = async (user: AdminUser) => {
  setBusyId(user.id);
  try {
    const res = await api.patch(`/admin-dashboard/users/${user.id}/ban`, { isBanned: !user.isBanned });
    if (res.data.success) {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, isBanned: res.data.data.isBanned } : u)));
    }
  } catch (err: any) { alert(err?.response?.data?.message || 'Failed to update user'); }
  finally { setBusyId(null); }
};

const deleteUser = async (user: AdminUser) => {
  setBusyId(user.id);
  try {
    const res = await api.delete(`/admin-dashboard/users/${user.id}`);
    if (res.data.success) setUsers((prev) => prev.filter((u) => u.id !== user.id));
  } catch (err: any) { alert(err?.response?.data?.message || 'Failed to delete user'); }
  finally { setBusyId(null); }
};

const handleSave = async (data: { name: string; role: string; credits: number }) => {
  if (!editingUser) return;
  setBusyId(editingUser.id);
  try {
    const res = await api.patch(`/admin-dashboard/users/${editingUser.id}`, data);
    if (res.data.success) {
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...res.data.data } : u)));
      setEditingUser(null);
    }
  } catch (err: any) { alert(err?.response?.data?.message || 'Failed to save user'); }
  finally { setBusyId(null); }
};
```

**After:**
```tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';

const queryClient = useQueryClient();
const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
const [busyId, setBusyId] = useState<string | null>(null);

const { data: users = [], isLoading: loading } = useQuery<AdminUser[]>({
  queryKey: ["admin-users"],
  queryFn: async () => {
    const res = await api.get('/admin-dashboard/users');
    return res.data.success ? res.data.data : [];
  },
});

const banMutation = useMutation({
  mutationFn: ({ userId, isBanned }: { userId: string; isBanned: boolean }) =>
    api.patch(`/admin-dashboard/users/${userId}/ban`, { isBanned }),
  onSuccess: (_, variables) => {
    queryClient.setQueryData(["admin-users"], (old: AdminUser[] | undefined) =>
      (old || []).map((u) =>
        u.id === variables.userId ? { ...u, isBanned: variables.isBanned } : u
      )
    );
  },
});

const deleteMutation = useMutation({
  mutationFn: (userId: string) => api.delete(`/admin-dashboard/users/${userId}`),
  onSuccess: (_, userId) => {
    queryClient.setQueryData(["admin-users"], (old: AdminUser[] | undefined) =>
      (old || []).filter((u) => u.id !== userId)
    );
  },
});

const editMutation = useMutation({
  mutationFn: ({ userId, data }: { userId: string; data: any }) =>
    api.patch(`/admin-dashboard/users/${userId}`, data),
  onSuccess: (_, variables) => {
    queryClient.setQueryData(["admin-users"], (old: AdminUser[] | undefined) =>
      (old || []).map((u) =>
        u.id === variables.userId ? { ...u, ...variables.data } : u
      )
    );
    setEditingUser(null);
  },
});

// Handler functions simplified:
const toggleBan = (user: AdminUser) => {
  setBusyId(user.id);
  banMutation.mutate(
    { userId: user.id, isBanned: !user.isBanned },
    { onSuccess: () => setBusyId(null), onError: () => { alert('Failed to update user'); setBusyId(null); } }
  );
};
```

**Ki bad gelo:**
- `useEffect(() => { fetchUsers(); }, [])` 
- `fetchUsers` manual function
- `toggleBan`, `deleteUser`, `handleSave` async functions with manual state updates
- `useState` for `users`, `loading`

**Ki add hoyeche:**
- `useQuery` for user list
- 3 ta `useMutation` for ban/delete/edit
- Optimistic UI via `queryClient.setQueryData()`

---

## Serial 8: `SupportTickets.tsx` (Admin - Support)

**Before:**
```tsx
import React, { useEffect, useState } from 'react';
import api from '../../api/api';

const [tickets, setTickets] = useState<SupportTicket[]>([]);
const [loading, setLoading] = useState(true);
const [filter, setFilter] = useState<Filter>('all');
const [expandedId, setExpandedId] = useState<string | null>(null);
const [busyId, setBusyId] = useState<string | null>(null);
const [confirmDelete, setConfirmDelete] = useState<SupportTicket | null>(null);

const syncOpenCount = (list: SupportTicket[]) => {
  onOpenCount(list.filter((t) => t.status === 'open').length);
};

const fetchTickets = async () => {
  setLoading(true);
  try {
    const res = await api.get('/admin-dashboard/support');
    if (res.data.success) { setTickets(res.data.data); syncOpenCount(res.data.data); }
  } catch (err) { console.error('Failed to fetch tickets:', err); }
  finally { setLoading(false); }
};

useEffect(() => { fetchTickets(); }, [refreshKey]);

const setStatus = async (id: string, status: SupportStatus) => {
  setBusyId(id);
  try {
    const res = await api.patch(`/admin-dashboard/support/${id}`, { status });
    if (res.data.success) {
      setTickets((prev) => {
        const next = prev.map((t) => (t.id === id ? { ...t, status: res.data.data.status } : t));
        syncOpenCount(next);
        return next;
      });
    }
  } catch (err: any) { alert(err?.response?.data?.message || 'Failed to update ticket'); }
  finally { setBusyId(null); }
};

const deleteTicket = async (id: string) => {
  setBusyId(id);
  try {
    const res = await api.delete(`/admin-dashboard/support/${id}`);
    if (res.data.success) {
      setTickets((prev) => { const next = prev.filter((t) => t.id !== id); syncOpenCount(next); return next; });
      setConfirmDelete(null);
    }
  } catch (err: any) { alert(err?.response?.data?.message || 'Failed to delete ticket'); }
  finally { setBusyId(null); }
};
```

**After:**
```tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';

const queryClient = useQueryClient();
const [filter, setFilter] = useState<Filter>('all');
const [expandedId, setExpandedId] = useState<string | null>(null);
const [busyId, setBusyId] = useState<string | null>(null);
const [confirmDelete, setConfirmDelete] = useState<SupportTicket | null>(null);

const { data: tickets = [], isLoading: loading } = useQuery<SupportTicket[]>({
  queryKey: ["admin-support", refreshKey],
  queryFn: async () => {
    const res = await api.get('/admin-dashboard/support');
    if (res.data.success) {
      onOpenCount(res.data.data.filter((t: SupportTicket) => t.status === 'open').length);
      return res.data.data;
    }
    return [];
  },
});

const statusMutation = useMutation({
  mutationFn: ({ id, status }: { id: string; status: SupportStatus }) =>
    api.patch(`/admin-dashboard/support/${id}`, { status }),
  onSuccess: (_, variables) => {
    queryClient.setQueryData(["admin-support", refreshKey], (old: SupportTicket[] | undefined) => {
      const next = (old || []).map((t) =>
        t.id === variables.id ? { ...t, status: variables.status } : t
      );
      onOpenCount(next.filter((t) => t.status === 'open').length);
      return next;
    });
  },
});

const deleteMutation = useMutation({
  mutationFn: (id: string) => api.delete(`/admin-dashboard/support/${id}`),
  onSuccess: (_, id) => {
    queryClient.setQueryData(["admin-support", refreshKey], (old: SupportTicket[] | undefined) => {
      const next = (old || []).filter((t) => t.id !== id);
      onOpenCount(next.filter((t) => t.status === 'open').length);
      return next;
    });
    setConfirmDelete(null);
  },
});
```

**Ki bad gelo:**
- `useEffect(() => { fetchTickets(); }, [refreshKey])` 
- `fetchTickets` manual function
- `setStatus`, `deleteTicket` async functions
- `syncOpenCount` helper function
- `useState` for `tickets`, `loading`

**Ki add hoyeche:**
- `useQuery` with `refreshKey` in queryKey (parent refresh trigger)
- 2 ta `useMutation` for status change + delete
- Optimistic UI + inline `onOpenCount` callback

---

## Summary Table

| File | Before (Redux Pattern) | After (TanStack Pattern) |
|------|----------------------|--------------------------|
| `main.tsx` | Provider only | + QueryClientProvider |
| `ScanHistory.tsx` | 8 useState + useEffect + 3 async handlers | 5 useState + 1 useQuery + 3 useMutation |
| `AtsScoreDetail.tsx` | 3 useState + useEffect with cleanup | 0 useState (data) + 1 useQuery |
| `AtsScore.tsx` | 1 useState + useEffect | 0 useState + 1 useQuery |
| `ResumeHistory.tsx` | 9 useState + useEffect + 4 async handlers | 5 useState + 1 useQuery + 4 useMutation |
| `AdminDashboard.tsx` | 11 useState + useCallback + useEffect + fetchAll | 4 useState + 4 useQuery |
| `Dashboard.tsx` | 6 useState + useEffect | 4 useState + 1 useQuery |
| `UserManagement.tsx` | 5 useState + useEffect + 3 async handlers | 3 useState + 1 useQuery + 3 useMutation |
| `SupportTickets.tsx` | 5 useState + useEffect + 2 async handlers | 3 useState + 1 useQuery + 2 useMutation |

## Cache Keys Used

| Query Key | Files | Purpose |
|-----------|-------|---------|
| `["ats-history", userId, page]` | ScanHistory | ATS scan list (paginated) |
| `["ats-report", historyId]` | AtsScoreDetail | Single ATS report |
| `["ats-recent-scans", userId]` | AtsScore | Recent 3 scans |
| `["resumes", userId, page]` | ResumeHistory | Resume list (paginated) |
| `["admin-metrics"]` | AdminDashboard | Dashboard metrics |
| `["admin-growth", period]` | AdminDashboard | Growth chart (period-dependent) |
| `["admin-support-count"]` | AdminDashboard | Open ticket count |
| `["admin-visitors"]` | AdminDashboard | Total visitors |
| `["admin-users"]` | UserManagement | All users list |
| `["admin-support", refreshKey]` | SupportTickets | Support tickets list |
| `["dashboard-stats", userId]` | Dashboard | User dashboard stats |

## What Stayed in Redux (NOT replaced)

| Slice | Reason |
|-------|--------|
| `authSlice.user` | Synchronous route guards (PrivateRoute/PublicRoute), axios interceptor dispatch |
| `authSlice.loading` | Initial auth check spinner |
| `authSlice.isAuthenticated` | Route protection |
| `fetchUser()` | Session hydration on mount |
| `tokenRefresh()` | 14-min interval background process |
| `logoutUser()` | Server-side logout + clear |
| `clearUser()` | Force logout on 401 |
| `setUserAiScanState()` | Post-scan credit update |
| `themeSlice` | Dead code (always light) |

## Behavior Change

| Scenario | Before | After |
|----------|--------|-------|
| Page load | DB hit every time | Cache hit if < 30s old |
| Back/forward nav | Full refetch | Instant from cache |
| Delete item | Refetch entire list | Optimistic removal + invalidation |
| Rename item | Refetch or manual state update | Optimistic cache update |
| Pagination | Manual fetch per page | Cache + smooth transition |
| Period change (admin) | Refetch all 4 APIs | Refetch growth only |
| Refresh button | Refetch all | `invalidateQueries` all |
| Redis unavailable | N/A | Still works (frontend cache only) |
