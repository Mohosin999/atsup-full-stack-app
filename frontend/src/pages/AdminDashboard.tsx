// import React, { useState } from "react";
// import { useSelector } from "react-redux";
// import { RootState } from "../store";
// import { AdminDashboardMetrics, GrowthData, GrowthPeriod } from "../types";
// import { Navigate } from "react-router-dom";
// import {
//   ChevronDown,
//   TrendingUp,
//   TrendingDown,
//   Users,
//   LayoutDashboard,
//   LifeBuoy,
//   FileText,
//   ClipboardCheck,
//   Star,
// } from "lucide-react";
// import { useQuery, useQueryClient } from "@tanstack/react-query";
// import api from "../api/api";
// import LoadingSpinner from "../components/ui/LoadingSpinner";
// import UserManagement from "../components/admin-dashboard/UserManagement";
// import SupportTickets from "../components/admin-dashboard/SupportTickets";
// import AllResumes from "../components/admin-dashboard/AllResumes";
// import AllAtsScores from "../components/admin-dashboard/AllAtsScores";
// import ReviewManagement from "../components/admin-dashboard/ReviewManagement";
// import Wrapper from "@/components/Wrapper";
// import SidebarButton from "../components/ui/SidebarButton";
// import AdminViewHeader from "../components/admin-dashboard/AdminViewHeader";

// const PERIOD_OPTIONS: { value: GrowthPeriod; label: string }[] = [
//   { value: "yesterday", label: "Yesterday" },
//   { value: "today", label: "Today" },
//   { value: "7d", label: "Last 7 days" },
//   { value: "14d", label: "Last 14 days" },
//   { value: "30d", label: "Last 30 days" },
// ];

// type MetricKey = keyof GrowthData["series"];

// const METRIC_CONFIG: {
//   key: MetricKey;
//   label: string;
//   bar: string;
//   barHover: string;
// }[] = [
//   {
//     key: "resumeBuild",
//     label: "Resume Build",
//     bar: "bg-teal-500",
//     barHover: "group-hover:bg-teal-500",
//   },
//   {
//     key: "atsUse",
//     label: "ATS Check",
//     bar: "bg-cyan-500",
//     barHover: "group-hover:bg-cyan-500",
//   },
// ];

// const AdminDashboard: React.FC = () => {
//   const { user } = useSelector((state: RootState) => state.auth);
//   const queryClient = useQueryClient();

//   const [period, setPeriod] = useState<GrowthPeriod>("today");
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [activeView, setActiveView] = useState<
//     "overview" | "users" | "support" | "reviews" | "resumes" | "ats-scores"
//   >("overview");
//   const [supportRefreshKey, setSupportRefreshKey] = useState(0);
//   const [isRefreshing, setIsRefreshing] = useState(false);

//   const { data: metrics, isLoading: loading } =
//     useQuery<AdminDashboardMetrics | null>({
//       queryKey: ["admin-metrics"],
//       queryFn: async () => {
//         const res = await api.get("/admin-dashboard/metrics");
//         return res.data.success ? res.data.data : null;
//       },
//       enabled: !!user && user.role === "admin",
//     });

//   const { data: growth, isLoading: growthLoading } =
//     useQuery<GrowthData | null>({
//       queryKey: ["admin-growth", period],
//       queryFn: async () => {
//         const res = await api.get(`/admin-dashboard/growth?period=${period}`);
//         return res.data.success ? res.data.data : null;
//       },
//       enabled: !!user && user.role === "admin",
//     });

//   const { data: unreadData, refetch: refetchUnread } = useQuery({
//     queryKey: ["admin-unread-counts"],
//     queryFn: async () => {
//       const res = await api.get("/admin-dashboard/unread-counts");
//       return res.data.success ? res.data.data : { unreadSupport: 0, unreadReviews: 0 };
//     },
//     enabled: !!user && user.role === "admin",
//   });

//   const { data: visitorData } = useQuery({
//     queryKey: ["admin-visitors"],
//     queryFn: async () => {
//       const res = await api.get("/visitor/count");
//       return res.data.success ? res.data.data.totalVisitors : 0;
//     },
//     enabled: !!user && user.role === "admin",
//   });

//   const unreadSupport = unreadData?.unreadSupport ?? 0;
//   const unreadReviews = unreadData?.unreadReviews ?? 0;
//   const totalVisitors = visitorData ?? 0;
//   const isInitialLoading = loading || growthLoading;

//   const markSeen = async (section: "support" | "reviews") => {
//     await api.patch(`/admin-dashboard/last-seen/${section}`);
//     refetchUnread();
//   };

//   const handleRefresh = async () => {
//     setIsRefreshing(true);
//     await Promise.all([
//       queryClient.invalidateQueries({ queryKey: ["admin-metrics"] }),
//       queryClient.invalidateQueries({ queryKey: ["admin-growth", period] }),
//       queryClient.invalidateQueries({ queryKey: ["admin-unread-counts"] }),
//       queryClient.invalidateQueries({ queryKey: ["admin-visitors"] }),
//       queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
//       queryClient.invalidateQueries({ queryKey: ["admin-support"] }),
//       queryClient.invalidateQueries({ queryKey: ["admin-all-resumes"] }),
//       queryClient.invalidateQueries({ queryKey: ["admin-all-ats-scores"] }),
//       queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }),
//     ]);
//     setSupportRefreshKey((k) => k + 1);
//     setIsRefreshing(false);
//   };

//   if (!user || user.role !== "admin") {
//     return <Navigate to="/ats-scan" replace />;
//   }

//   if (loading && !metrics) {
//     return (
//       <div className="flex h-[calc(100vh-64px)] items-center justify-center">
//         <LoadingSpinner size="lg" text="Loading dashboard..." />
//       </div>
//     );
//   }

//   if (!metrics) {
//     return (
//       <div className="flex h-[calc(100vh-64px)] items-center justify-center">
//         No data available
//       </div>
//     );
//   }

//   const { totalUsers, todayNewUsers, bestFeatureToday, dailyActiveUsers, weeklyActiveUsers } = metrics;

//   const periodLabel =
//     PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? "Today";
//   const changeIsUp = (growth?.change ?? 0) >= 0;

//   return (
//     <div className="min-h-screen pt-8 md:pt-10 lg:pt-24 pb-12">
//       <Wrapper className="!px-4 lg:!px-16">
//         <div className="md:flex md:flex-row items-start gap-6">
      

//           <aside className="flex flex-col w-full md:w-48 lg:w-44 xl:w-64 shrink-0 md:sticky md:top-24">
//             <SidebarButton
//               icon={LayoutDashboard}
//               label="Overview"
//               active={activeView === "overview"}
//               onClick={() => setActiveView("overview")}
//             />
//             <SidebarButton
//               icon={Users}
//               label="User Management"
//               active={activeView === "users"}
//               onClick={() => setActiveView("users")}
//             />
//             <SidebarButton
//               icon={LifeBuoy}
//               label="Support"
//               active={activeView === "support"}
//               badge={unreadSupport}
//               onClick={() => {
//                 setActiveView("support");
//                 markSeen("support");
//               }}
//             />
//             <SidebarButton
//               icon={Star}
//               label="Reviews"
//               active={activeView === "reviews"}
//               badge={unreadReviews}
//               onClick={() => {
//                 setActiveView("reviews");
//                 markSeen("reviews");
//               }}
//             />
//             <SidebarButton
//               icon={FileText}
//               label="Total Resumes"
//               active={activeView === "resumes"}
//               onClick={() => setActiveView("resumes")}
//             />
//             <SidebarButton
//               icon={ClipboardCheck}
//               label="Total ATS Check"
//               active={activeView === "ats-scores"}
//               onClick={() => setActiveView("ats-scores")}
//             />
//           </aside>
//           {/* ==============================================================
//            * Main content
//           ================================================================*/}
//           <main className="md:flex-1 md:min-w-0 mt-8 md:mt-0">
//             {activeView === "users" ? (
//               <UserManagement
//                 onlineUsers={[]}
//                 currentAdminId={user._id}
//                 onRefresh={handleRefresh}
//                 isRefreshing={isRefreshing}
//               />
//             ) : activeView === "support" ? (
//               <SupportTickets
//                 refreshKey={supportRefreshKey}
//                 onOpenCount={() => refetchUnread()}
//                 onRefresh={handleRefresh}
//                 isRefreshing={isRefreshing}
//               />
//             ) : activeView === "reviews" ? (
//               <ReviewManagement
//                 onRefresh={handleRefresh}
//                 isRefreshing={isRefreshing}
//               />
//             ) : activeView === "resumes" ? (
//               <AllResumes
//                 onRefresh={handleRefresh}
//                 isRefreshing={isRefreshing}
//               />
//             ) : activeView === "ats-scores" ? (
//               <AllAtsScores
//                 onRefresh={handleRefresh}
//                 isRefreshing={isRefreshing}
//               />
//             ) : (
//               <>
//                 <AdminViewHeader
//                   title="Overview"
//                   isRefreshing={isRefreshing}
//                   onRefresh={handleRefresh}
//                 />
//                 {/* =====================================================
//                   * Summary cards
//                  ======================================================*/}
//                 <div className="grid grid-cols-2 xl:grid-cols-3 gap-0 mb-6 bg-cyan-600 text-white box-shadow">
//                   {/* New users (today) */}
//                   <div className="p-4 xl:p-6 text-center border-r border-b border-white/30">
//                     <h3 className="text-xs font-medium">New Users (Today)</h3>
//                     <p className="text-2xl lg:text-3xl font-bold mt-2">
//                       {todayNewUsers}
//                     </p>
//                   </div>

//                   {/* Daily active users */}
//                   <div className="p-4 xl:p-6 text-center border-b border-white/30 xl:border-r">
//                     <h3 className="text-xs font-medium">Daily Active Users</h3>
//                     <p className="text-2xl lg:text-3xl font-bold mt-2">
//                       {dailyActiveUsers ?? 0}
//                     </p>
//                   </div>

//                   {/* Weekly active users */}
//                   <div className="p-4 xl:p-6 text-center border-r border-b border-white/30">
//                     <h3 className="text-xs font-medium">Active (7 days)</h3>
//                     <p className="text-2xl lg:text-3xl font-bold mt-2">
//                       {weeklyActiveUsers ?? 0}
//                     </p>
//                   </div>

//                   {/* Visitors */}
//                   <div className="p-4 xl:p-6 text-center border-r border-white/30">
//                     <h3 className="text-xs font-medium flex items-center justify-center">
//                       Total Visitors
//                       <span className="relative flex h-2 w-2 ml-2 ">
//                         <span className="animate-ping absolute inline-flex h-full w-full bg-cyan-400 opacity-75 rounded-full" />
//                         <span className="relative inline-flex h-2 w-2 bg-cyan-500 rounded-full" />
//                       </span>
//                     </h3>
//                     <p className="text-2xl lg:text-3xl font-bold mt-2">
//                       {totalVisitors.toLocaleString()}
//                     </p>
//                   </div>

//                   {/* Total users */}
//                   <div className="p-4 xl:p-6 text-center border-white/30 xl:border-r">
//                     <h3 className="text-xs font-medium">Total Users</h3>
//                     <p className="text-2xl lg:text-3xl font-bold mt-2">
//                       {totalUsers}
//                     </p>
//                   </div>

//                   {/* Best performing feature */}
//                   <div className="p-4 xl:p-6 text-center border-white/30">
//                     <h3 className="text-xs font-medium">
//                       Best Performing Feature
//                     </h3>
//                     <p className="text-2xl font-bold w-full py-2">
//                       {bestFeatureToday === "resume-builder"
//                         ? "Resume Builder"
//                         : "ATS Check"}
//                     </p>
//                   </div>
//                 </div>

//                 {/* =====================================================
//                   * User activity chart
//                  ======================================================*/}
//                 <div className="w-full bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 box-shadow p-4 md:p-6 mb-6 text-">
//                   {/* Header */}
//                   <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200 dark:border-gray-700">
//                     <div className="flex items-center">
//                       <div className="w-8 h-8 bg-gray-100 border border-gray-200 flex items-center justify-center me-3 dark:bg-gray-700 dark:border-gray-700">
//                         <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
//                       </div>
//                       <div className="flex items-center gap-1">
//                         <p className="text-sm text-gray-600 dark:text-gray-400">
//                           User activity in {periodLabel.toLowerCase()} ➤
//                         </p>
//                         <h5 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
//                           {(growth?.totals.activity ?? 0).toLocaleString()}
//                         </h5>
//                       </div>
//                     </div>
//                     <div>
//                       <span
//                         className={`inline-flex items-center text-xs font-medium px-2 py-1.5 border ${
//                           changeIsUp
//                             ? "bg-cyan-100 border-cyan-100 text-cyan-700"
//                             : "bg-red-50 border-red-200 text-red-700"
//                         }`}
//                       >
//                         {changeIsUp ? (
//                           <TrendingUp className="w-4 h-4 me-1" />
//                         ) : (
//                           <TrendingDown className="w-4 h-4 me-1" />
//                         )}
//                         {Math.abs(growth?.change ?? 0)}%
//                       </span>
//                     </div>
//                   </div>

//                   {/* Two stats */}
//                   <div className="grid grid-cols-2">
//                     <dl className="flex items-center">
//                       <dt className="text-gray-600 text-xs font-normal me-1 dark:text-gray-400">
//                         Resume builds:
//                       </dt>
//                       <dd className="text-gray-800 text-xs font-semibold dark:text-gray-100">
//                         {growth?.totals.resumeBuild ?? "—"}
//                       </dd>
//                     </dl>
//                     <dl className="flex items-center justify-end">
//                       <dt className="text-gray-600 text-xs font-normal me-1 dark:text-gray-400">
//                         ATS checks:
//                       </dt>
//                       <dd className="text-gray-800 text-xs font-semibold dark:text-gray-100">
//                         {growth?.totals.atsUse ?? "—"}
//                       </dd>
//                     </dl>
//                   </div>

//                   {/* Column chart */}
//                   <div id="column-chart">
//                     {growthLoading && !growth ? (
//                       <div className="flex items-center justify-center h-40 md:h-48">
//                         <LoadingSpinner size="md" />
//                       </div>
//                     ) : (
//                       <div className="overflow-x-auto scrollbar-hide">
//                         <div className="min-w-[480px] pt-8">
//                           <div className="relative h-40 md:h-64 border-b border-gray-200 dark:border-gray-700">
//                             {/* Y-axis scale: 50 activities = full height */}
//                             <div className="absolute inset-y-0 left-0 pointer-events-none select-none">
//                               {[50, 40, 30, 20, 10, 0].map((v) => (
//                                 <span
//                                   key={v}
//                                   className={`absolute text-[10px] leading-none text-gray-400 dark:text-gray-500 ${
//                                     v === 0
//                                       ? "-translate-y-full"
//                                       : "-translate-y-1/2"
//                                   }`}
//                                   style={{ top: `${100 - v * 2}%` }}
//                                 >
//                                   {v}
//                                 </span>
//                               ))}
//                             </div>
//                             {/* Horizontal gridlines: major every 10, minor every 5 */}
//                             <div className="absolute inset-0 pointer-events-none">
//                               {[50, 40, 30, 20, 10].map((v) => (
//                                 <div
//                                   key={`major-${v}`}
//                                   className="absolute left-7 right-0 border-t border-gray-300 dark:border-gray-600"
//                                   style={{ top: `${100 - v * 2}%` }}
//                                 />
//                               ))}
//                               {[45, 35, 25, 15, 5].map((v) => (
//                                 <div
//                                   key={`minor-${v}`}
//                                   className="absolute left-7 right-0 border-t border-dashed border-gray-200 dark:border-gray-700"
//                                   style={{ top: `${100 - v * 2}%` }}
//                                 />
//                               ))}
//                             </div>
//                             {/* Bars, baseline-aligned, scaled so 50 activities fill the chart */}
//                             <div className="absolute inset-0 flex items-end gap-1 pl-7">
//                               {growth &&
//                                 growth.labels.map((label, i) => (
//                                   <div
//                                     key={i}
//                                     className="flex-1 h-full flex items-end justify-center gap-[3px]"
//                                   >
//                                     {METRIC_CONFIG.map((m) => {
//                                       const val = growth.series[m.key][i] ?? 0;
//                                       const pct =
//                                         val === 0
//                                           ? 0
//                                           : Math.min(
//                                               100,
//                                               Math.max(2, (val / 50) * 100),
//                                             );
//                                       return (
//                                         <div
//                                           key={m.key}
//                                           className="flex-1 max-w-[22px] h-full flex items-end"
//                                         >
//                                           <div
//                                             className={`group relative w-full bg-gradient-to-t ${m.bar} ${m.barHover} transition-all duration-300`}
//                                             style={{ height: `${pct}%` }}
//                                           >
//                                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 whitespace-nowrap bg-gray-900 text-white text-xs px-2 py-1">
//                                               {val} {m.label}
//                                             </div>
//                                           </div>
//                                         </div>
//                                       );
//                                     })}
//                                   </div>
//                                 ))}
//                             </div>
//                           </div>
//                           {/* Bucket labels aligned with bars */}
//                           <div className="flex gap-1 mt-1 pl-7">
//                             {growth &&
//                               growth.labels.map((label, i) => (
//                                 <div
//                                   key={i}
//                                   className="flex-1 text-center text-[10px] text-gray-400 truncate dark:text-gray-500"
//                                 >
//                                   {label}
//                                 </div>
//                               ))}
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   {/* Footer */}
//                   <div className="grid grid-cols-1 items-center border-t border-gray-200 dark:border-gray-700">
//                     <div className="flex justify-between items-center pt-4 md:pt-6">
//                       <div className="relative">
//                         <button
//                           type="button"
//                           onClick={() => setDropdownOpen(!dropdownOpen)}
//                           className="text-sm font-medium text-gray-600 hover:text-gray-800 text-center inline-flex items-center dark:text-gray-400 dark:hover:text-gray-100"
//                         >
//                           {periodLabel}
//                           <ChevronDown
//                             className={`w-4 h-4 ms-1.5 transition-transform duration-200 ${
//                               dropdownOpen ? "rotate-180" : ""
//                             }`}
//                           />
//                         </button>
//                         {dropdownOpen && (
//                           <>
//                             <div
//                               className="fixed inset-0 z-10"
//                               onClick={() => setDropdownOpen(false)}
//                             />
//                             <div className="absolute z-20 bottom-full mb-2 w-44 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700 shadow-lg">
//                               <ul className="p-2 text-sm text-gray-700 font-medium dark:text-gray-300">
//                                 {PERIOD_OPTIONS.map((opt) => (
//                                   <li key={opt.value}>
//                                     <button
//                                       type="button"
//                                       onClick={() => {
//                                         setPeriod(opt.value);
//                                         setDropdownOpen(false);
//                                       }}
//                                       className={`inline-flex items-center w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${
//                                         period === opt.value
//                                           ? "text-cyan-600"
//                                           : "text-gray-700 dark:text-gray-300"
//                                       }`}
//                                     >
//                                       {opt.label}
//                                     </button>
//                                   </li>
//                                 ))}
//                               </ul>
//                             </div>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </>
//             )}
//           </main>
//         </div>
//       </Wrapper>
//     </div>
//   );
// };

// export default AdminDashboard;

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { AdminDashboardMetrics, GrowthData, GrowthPeriod } from "../types";
import { Navigate } from "react-router-dom";
import {
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Users,
  LayoutDashboard,
  LifeBuoy,
  FileText,
  ClipboardCheck,
  Star,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../api/api";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import UserManagement from "../components/admin-dashboard/UserManagement";
import SupportTickets from "../components/admin-dashboard/SupportTickets";
import AllResumes from "../components/admin-dashboard/AllResumes";
import AllAtsScores from "../components/admin-dashboard/AllAtsScores";
import ReviewManagement from "../components/admin-dashboard/ReviewManagement";
import Wrapper from "@/components/Wrapper";
import SidebarButton from "../components/ui/SidebarButton";
import AdminViewHeader from "../components/admin-dashboard/AdminViewHeader";

const PERIOD_OPTIONS: { value: GrowthPeriod; label: string }[] = [
  { value: "yesterday", label: "Yesterday" },
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "14d", label: "Last 14 days" },
  { value: "30d", label: "Last 30 days" },
];

type MetricKey = keyof GrowthData["series"];

const METRIC_CONFIG: {
  key: MetricKey;
  label: string;
  bar: string;
  barHover: string;
}[] = [
  {
    key: "resumeBuild",
    label: "Resume Build",
    bar: "bg-stone-700 dark:bg-stone-500",
    barHover: "group-hover:bg-stone-800 dark:group-hover:bg-stone-400",
  },
  {
    key: "atsUse",
    label: "ATS Check",
    bar: "bg-lime-400",
    barHover: "group-hover:bg-lime-500",
  },
];

const AdminDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const queryClient = useQueryClient();

  const [period, setPeriod] = useState<GrowthPeriod>("today");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeView, setActiveView] = useState<
    "overview" | "users" | "support" | "reviews" | "resumes" | "ats-scores"
  >("overview");
  const [supportRefreshKey, setSupportRefreshKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: metrics, isLoading: loading } =
    useQuery<AdminDashboardMetrics | null>({
      queryKey: ["admin-metrics"],
      queryFn: async () => {
        const res = await api.get("/admin-dashboard/metrics");
        return res.data.success ? res.data.data : null;
      },
      enabled: !!user && user.role === "admin",
    });

  const { data: growth, isLoading: growthLoading } =
    useQuery<GrowthData | null>({
      queryKey: ["admin-growth", period],
      queryFn: async () => {
        const res = await api.get(`/admin-dashboard/growth?period=${period}`);
        return res.data.success ? res.data.data : null;
      },
      enabled: !!user && user.role === "admin",
    });

  const { data: unreadData, refetch: refetchUnread } = useQuery({
    queryKey: ["admin-unread-counts"],
    queryFn: async () => {
      const res = await api.get("/admin-dashboard/unread-counts");
      return res.data.success ? res.data.data : { unreadSupport: 0, unreadReviews: 0 };
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

  const unreadSupport = unreadData?.unreadSupport ?? 0;
  const unreadReviews = unreadData?.unreadReviews ?? 0;
  const totalVisitors = visitorData ?? 0;
  const isInitialLoading = loading || growthLoading;

  const markSeen = async (section: "support" | "reviews") => {
    await api.patch(`/admin-dashboard/last-seen/${section}`);
    refetchUnread();
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin-metrics"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-growth", period] }),
      queryClient.invalidateQueries({ queryKey: ["admin-unread-counts"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-visitors"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-users"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-support"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-all-resumes"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-all-ats-scores"] }),
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }),
    ]);
    setSupportRefreshKey((k) => k + 1);
    setIsRefreshing(false);
  };

  if (!user || user.role !== "admin") {
    return <Navigate to="/ats-scan" replace />;
  }

  if (loading && !metrics) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        No data available
      </div>
    );
  }

  const { totalUsers, todayNewUsers, bestFeatureToday, dailyActiveUsers, weeklyActiveUsers } = metrics;

  const periodLabel =
    PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? "Today";
  const changeIsUp = (growth?.change ?? 0) >= 0;

  return (
    <div className="font-plex min-h-screen bg-stone-50 dark:bg-stone-950 pt-8 md:pt-10 lg:pt-24 pb-12">
      <Wrapper className="!px-4 lg:!px-16">
        <div className="md:flex md:flex-row items-start gap-6">
          <aside className="flex flex-col w-full md:w-48 lg:w-44 xl:w-64 shrink-0 md:sticky md:top-24">
            <SidebarButton
              icon={LayoutDashboard}
              label="Overview"
              active={activeView === "overview"}
              onClick={() => setActiveView("overview")}
            />
            <SidebarButton
              icon={Users}
              label="User Management"
              active={activeView === "users"}
              onClick={() => setActiveView("users")}
            />
            <SidebarButton
              icon={LifeBuoy}
              label="Support"
              active={activeView === "support"}
              badge={unreadSupport}
              onClick={() => {
                setActiveView("support");
                markSeen("support");
              }}
            />
            <SidebarButton
              icon={Star}
              label="Reviews"
              active={activeView === "reviews"}
              badge={unreadReviews}
              onClick={() => {
                setActiveView("reviews");
                markSeen("reviews");
              }}
            />
            <SidebarButton
              icon={FileText}
              label="Total Resumes"
              active={activeView === "resumes"}
              onClick={() => setActiveView("resumes")}
            />
            <SidebarButton
              icon={ClipboardCheck}
              label="Total ATS Check"
              active={activeView === "ats-scores"}
              onClick={() => setActiveView("ats-scores")}
            />
          </aside>
          {/* ==============================================================
           * Main content
          ================================================================*/}
          <main className="md:flex-1 md:min-w-0 mt-8 md:mt-0">
            {activeView === "users" ? (
              <UserManagement
                onlineUsers={[]}
                currentAdminId={user._id}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            ) : activeView === "support" ? (
              <SupportTickets
                refreshKey={supportRefreshKey}
                onOpenCount={() => refetchUnread()}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            ) : activeView === "reviews" ? (
              <ReviewManagement
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            ) : activeView === "resumes" ? (
              <AllResumes
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            ) : activeView === "ats-scores" ? (
              <AllAtsScores
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
              />
            ) : (
              <>
                <AdminViewHeader
                  title="Overview"
                  isRefreshing={isRefreshing}
                  onRefresh={handleRefresh}
                />
                {/* =====================================================
                  * Summary cards
                 ======================================================*/}
                <div className="grid grid-cols-2 xl:grid-cols-3 gap-0 mb-6 bg-stone-900 text-stone-50 rounded-2xl overflow-hidden">
                  {/* New users (today) */}
                  <div className="p-4 xl:p-6 text-center border-r border-b border-white/10">
                    <h3 className="text-xs font-medium">New Users (Today)</h3>
                    <p className="text-2xl lg:text-3xl font-bold mt-2">
                      {todayNewUsers}
                    </p>
                  </div>

                  {/* Daily active users */}
                  <div className="p-4 xl:p-6 text-center border-b border-white/10 xl:border-r">
                    <h3 className="text-xs font-medium">Daily Active Users</h3>
                    <p className="text-2xl lg:text-3xl font-bold mt-2">
                      {dailyActiveUsers ?? 0}
                    </p>
                  </div>

                  {/* Weekly active users */}
                  <div className="p-4 xl:p-6 text-center border-r border-b border-white/10">
                    <h3 className="text-xs font-medium">Active (7 days)</h3>
                    <p className="text-2xl lg:text-3xl font-bold mt-2">
                      {weeklyActiveUsers ?? 0}
                    </p>
                  </div>

                  {/* Visitors */}
                  <div className="p-4 xl:p-6 text-center border-r border-white/10">
                    <h3 className="text-xs font-medium flex items-center justify-center">
                      Total Visitors
                      <span className="relative flex h-2 w-2 ml-2 ">
                        <span className="animate-ping absolute inline-flex h-full w-full bg-lime-300 opacity-75 rounded-full" />
                        <span className="relative inline-flex h-2 w-2 bg-lime-300 rounded-full" />
                      </span>
                    </h3>
                    <p className="text-2xl lg:text-3xl font-bold mt-2">
                      {totalVisitors.toLocaleString()}
                    </p>
                  </div>

                  {/* Total users */}
                  <div className="p-4 xl:p-6 text-center border-white/10 xl:border-r">
                    <h3 className="text-xs font-medium">Total Users</h3>
                    <p className="text-2xl lg:text-3xl font-bold mt-2">
                      {totalUsers}
                    </p>
                  </div>

                  {/* Best performing feature */}
                  <div className="p-4 xl:p-6 text-center border-white/10">
                    <h3 className="text-xs font-medium">
                      Best Performing Feature
                    </h3>
                    <p className="text-2xl font-bold w-full py-2">
                      {bestFeatureToday === "resume-builder"
                        ? "Resume Builder"
                        : "ATS Check"}
                    </p>
                  </div>
                </div>

                {/* =====================================================
                  * User activity chart
                 ======================================================*/}
                <div className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-4 md:p-6 mb-6">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-stone-200 dark:border-stone-800">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-stone-100 border border-stone-200 rounded-lg flex items-center justify-center me-3 dark:bg-stone-800 dark:border-stone-700">
                        <Users className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-stone-600 dark:text-stone-400">
                          User activity in {periodLabel.toLowerCase()} ➤
                        </p>
                        <h5 className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                          {(growth?.totals.activity ?? 0).toLocaleString()}
                        </h5>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2 py-1.5 rounded-md border ${
                          changeIsUp
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-400/10 dark:border-emerald-400/20 dark:text-emerald-400"
                            : "bg-red-50 border-red-200 text-red-700 dark:bg-red-400/10 dark:border-red-400/20 dark:text-red-400"
                        }`}
                      >
                        {changeIsUp ? (
                          <TrendingUp className="w-4 h-4 me-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 me-1" />
                        )}
                        {Math.abs(growth?.change ?? 0)}%
                      </span>
                    </div>
                  </div>

                  {/* Two stats */}
                  <div className="grid grid-cols-2">
                    <dl className="flex items-center">
                      <dt className="text-stone-500 text-xs font-normal me-1 dark:text-stone-400">
                        Resume builds:
                      </dt>
                      <dd className="text-stone-800 text-xs font-semibold dark:text-stone-100">
                        {growth?.totals.resumeBuild ?? "—"}
                      </dd>
                    </dl>
                    <dl className="flex items-center justify-end">
                      <dt className="text-stone-500 text-xs font-normal me-1 dark:text-stone-400">
                        ATS checks:
                      </dt>
                      <dd className="text-stone-800 text-xs font-semibold dark:text-stone-100">
                        {growth?.totals.atsUse ?? "—"}
                      </dd>
                    </dl>
                  </div>

                  {/* Column chart */}
                  <div id="column-chart">
                    {growthLoading && !growth ? (
                      <div className="flex items-center justify-center h-40 md:h-48">
                        <LoadingSpinner size="md" />
                      </div>
                    ) : (
                      <div className="overflow-x-auto scrollbar-hide">
                        <div className="min-w-[480px] pt-8">
                          <div className="relative h-40 md:h-64 border-b border-stone-200 dark:border-stone-800">
                            {/* Y-axis scale: 50 activities = full height */}
                            <div className="absolute inset-y-0 left-0 pointer-events-none select-none">
                              {[50, 40, 30, 20, 10, 0].map((v) => (
                                <span
                                  key={v}
                                  className={`absolute text-[10px] leading-none text-stone-400 dark:text-stone-500 ${
                                    v === 0
                                      ? "-translate-y-full"
                                      : "-translate-y-1/2"
                                  }`}
                                  style={{ top: `${100 - v * 2}%` }}
                                >
                                  {v}
                                </span>
                              ))}
                            </div>
                            {/* Horizontal gridlines: major every 10, minor every 5 */}
                            <div className="absolute inset-0 pointer-events-none">
                              {[50, 40, 30, 20, 10].map((v) => (
                                <div
                                  key={`major-${v}`}
                                  className="absolute left-7 right-0 border-t border-stone-300 dark:border-stone-700"
                                  style={{ top: `${100 - v * 2}%` }}
                                />
                              ))}
                              {[45, 35, 25, 15, 5].map((v) => (
                                <div
                                  key={`minor-${v}`}
                                  className="absolute left-7 right-0 border-t border-dashed border-stone-200 dark:border-stone-800"
                                  style={{ top: `${100 - v * 2}%` }}
                                />
                              ))}
                            </div>
                            {/* Bars, baseline-aligned, scaled so 50 activities fill the chart */}
                            <div className="absolute inset-0 flex items-end gap-1 pl-7">
                              {growth &&
                                growth.labels.map((label, i) => (
                                  <div
                                    key={i}
                                    className="flex-1 h-full flex items-end justify-center gap-[3px]"
                                  >
                                    {METRIC_CONFIG.map((m) => {
                                      const val = growth.series[m.key][i] ?? 0;
                                      const pct =
                                        val === 0
                                          ? 0
                                          : Math.min(
                                              100,
                                              Math.max(2, (val / 50) * 100),
                                            );
                                      return (
                                        <div
                                          key={m.key}
                                          className="flex-1 max-w-[22px] h-full flex items-end"
                                        >
                                          <div
                                            className={`group relative w-full rounded-t ${m.bar} ${m.barHover} transition-all duration-300`}
                                            style={{ height: `${pct}%` }}
                                          >
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 whitespace-nowrap bg-stone-900 text-stone-50 text-xs px-2 py-1 rounded">
                                              {val} {m.label}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ))}
                            </div>
                          </div>
                          {/* Bucket labels aligned with bars */}
                          <div className="flex gap-1 mt-1 pl-7">
                            {growth &&
                              growth.labels.map((label, i) => (
                                <div
                                  key={i}
                                  className="flex-1 text-center text-[10px] text-stone-400 truncate dark:text-stone-500"
                                >
                                  {label}
                                </div>
                              ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="grid grid-cols-1 items-center border-t border-stone-200 dark:border-stone-800">
                    <div className="flex justify-between items-center pt-4 md:pt-6">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="text-sm font-medium text-stone-600 hover:text-stone-900 text-center inline-flex items-center dark:text-stone-400 dark:hover:text-stone-100"
                        >
                          {periodLabel}
                          <ChevronDown
                            className={`w-4 h-4 ms-1.5 transition-transform duration-200 ${
                              dropdownOpen ? "rotate-180" : ""
                            }`}
                          />
                        </button>
                        {dropdownOpen && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setDropdownOpen(false)}
                            />
                            <div className="absolute z-20 bottom-full mb-2 w-44 bg-white border border-stone-200 dark:bg-stone-800 dark:border-stone-700 rounded-lg shadow-lg overflow-hidden">
                              <ul className="p-2 text-sm text-stone-700 font-medium dark:text-stone-300">
                                {PERIOD_OPTIONS.map((opt) => (
                                  <li key={opt.value}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPeriod(opt.value);
                                        setDropdownOpen(false);
                                      }}
                                      className={`inline-flex items-center w-full p-2 rounded-md hover:bg-stone-100 dark:hover:bg-stone-700 ${
                                        period === opt.value
                                          ? "text-stone-900 dark:text-lime-300"
                                          : "text-stone-700 dark:text-stone-300"
                                      }`}
                                    >
                                      {opt.label}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </main>
        </div>
      </Wrapper>
    </div>
  );
};

export default AdminDashboard;