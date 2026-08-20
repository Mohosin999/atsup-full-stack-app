import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  AdminDashboardMetrics,
  GrowthData,
  GrowthPeriod,
  PresenceData,
  OnlineUser,
} from "../types";
import { Navigate } from "react-router-dom";
import {
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Users,
  LayoutDashboard,
  LifeBuoy,
} from "lucide-react";
import api from "../api/api";
import UserManagement from "../components/admin-dashboard/UserManagement";
import SupportTickets from "../components/admin-dashboard/SupportTickets";
import Wrapper from "@/components/Wrapper";
import SidebarButton from "../components/ui/SidebarButton";


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
    bar: "bg-teal-500",
    barHover: "group-hover:bg-teal-500",
  },
  {
    key: "atsUse",
    label: "ATS Check",
    bar: "bg-cyan-500",
    barHover: "group-hover:bg-cyan-500",
  },
];

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<GrowthPeriod>("today");
  const [growth, setGrowth] = useState<GrowthData | null>(null);
  const [growthLoading, setGrowthLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [activeView, setActiveView] = useState<
    "overview" | "users" | "support"
  >("overview");
  const activeViewRef = useRef(activeView);
  useEffect(() => {
    activeViewRef.current = activeView;
  }, [activeView]);

  const [supportOpenCount, setSupportOpenCount] = useState(0);
  const [supportRefreshKey, setSupportRefreshKey] = useState(0);

  // Load the initial open-ticket count for the sidebar badge
  useEffect(() => {
    if (!user || user.role !== "admin") return;
    api
      .get("/admin-dashboard/support")
      .then((response) => {
        if (response.data.success) {
          const open = response.data.data.filter(
            (t: any) => t.status === "open",
          ).length;
          setSupportOpenCount(open);
        }
      })
      .catch((err) => console.error("Failed to fetch support count:", err));
  }, [user]);

  useEffect(() => {
    // Only admins may connect. Cookies are httpOnly, so we never read the
    // token from document.cookie - the browser sends it automatically.
    if (!user || user.role !== "admin") {
      setLoading(false);
      return;
    }

    // Determine the backend origin. In dev VITE_API_URL is "/api" (relative,
    // proxied by Vite), so the socket origin is the frontend origin and the
    // namespace is "/admin-dashboard". Socket.io requests go to /socket.io.
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const baseOrigin = apiUrl.startsWith("http")
      ? new URL(apiUrl).origin
      : window.location.origin;

    const newSocket = io(`${baseOrigin}/admin-dashboard`, {
      withCredentials: true,
      transports: ["websocket"],
    });

    setSocket(newSocket);

    // Fetch initial metrics via REST (axios baseURL is "/api", so the
    // httpOnly accessToken cookie is sent automatically)
    const fetchInitialMetrics = async () => {
      try {
        const response = await api.get("/admin-dashboard/metrics");
        if (response.data.success) {
          setMetrics(response.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch initial metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialMetrics();

    // Listen for metrics updates from socket
    newSocket.on("metrics", (data: AdminDashboardMetrics) => {
      setMetrics(data);
    });

    // Listen for live online-user presence (chat-app style)
    newSocket.on("presence", (data: PresenceData) => {
      setOnlineCount(data.onlineCount);
      setOnlineUsers(data.users);
    });

    // Listen for live growth-chart updates (real-time, no refresh needed)
    newSocket.on("growth", (data: GrowthData) => {
      setGrowth(data);
      setGrowthLoading(false);
    });

    // A user submitted a new support ticket — bump the badge live. If we're
    // already looking at the ticket list, refresh it in place.
    newSocket.on("support", () => {
      if (activeViewRef.current === "support") {
        setSupportRefreshKey((k) => k + 1);
      } else {
        setSupportOpenCount((c) => c + 1);
      }
    });

    newSocket.on("connect_error", (err: Error) => {
      console.error("Socket connection error:", err);
      setLoading(false);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user, dispatch]);

  // Fetch the combined growth chart for the selected period
  useEffect(() => {
    if (!user || user.role !== "admin") return;
    let cancelled = false;
    setGrowthLoading(true);
    // Tell the server which period to stream over the socket, so the chart
    // updates in real time.
    socket?.emit("set-period", period);
    api
      .get(`/admin-dashboard/growth?period=${period}`)
      .then((response) => {
        if (!cancelled && response.data.success) {
          setGrowth(response.data.data);
        }
      })
      .catch((err) => console.error("Failed to fetch growth data:", err))
      .finally(() => {
        if (!cancelled) setGrowthLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period, user, socket]);

  // Guard: only admins can access this page. Non-admins go to the regular
  // dashboard.
  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading && !metrics) {
    return (
      <div className="flex h-[calc(100vh-64px)] items-center justify-center">
        Loading...
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

  const {
    totalUsers,
    todayNewUsers,
    bestFeatureToday,
  } = metrics;

  const periodLabel =
    PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? "Today";
  const changeIsUp = (growth?.change ?? 0) >= 0;

  return (
    <div className="bg-[#F6F9FC] pt-24 pb-12">
      <Wrapper>
        <div className="md:flex md:flex-row items-start gap-6">
          {/* ==============================================================
           * Sidebar
          ================================================================*/}
          <aside className="w-full md:w-48 lg:w-44 xl:w-64 shrink-0 md:sticky md:top-24">
            <div>
             

              <nav className="space-y-1">
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
                  badge={supportOpenCount}
                  onClick={() => setActiveView("support")}
                />
              </nav>
            </div>
          </aside>

          {/* ==============================================================
           * Main content
          ================================================================*/}
          <main className="md:flex-1 md:min-w-0 mt-8 md:mt-0">
            {activeView === "users" ? (
              <UserManagement
                onlineUsers={onlineUsers}
                currentAdminId={user._id}
              />
            ) : activeView === "support" ? (
              <SupportTickets
                refreshKey={supportRefreshKey}
                onOpenCount={setSupportOpenCount}
              />
            ) : (
              <>
                {/* =====================================================
                  * Summary cards
                 ======================================================*/}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-0 mb-6 bg-cyan-600 text-white box-shadow rounded-xl">
                  {/* New users (today) */}
                  <div className="p-4 xl:p-6 text-center border-r border-b border-white/30 xl:border-b-0">
                    <h3 className="text-xs font-medium">New Users (Today)</h3>
                    <p className="text-2xl lg:text-3xl font-bold mt-2">
                      {todayNewUsers}
                    </p>
                  </div>

                  {/* Online users */}
                  <div className="p-4 xl:p-6 text-center border-b border-white/30 xl:border-r xl:border-b-0">
                    <h3 className="text-xs font-medium flex items-center justify-center">
                      Online Users
                      <span className="relative flex h-2 w-2 ml-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                      </span>
                    </h3>
                    <p className="text-2xl lg:text-3xl font-bold mt-2">
                      {onlineCount}
                    </p>
                  </div>

                  {/* Total users */}
                  <div className="p-4 xl:p-6 text-center border-r border-white/30 xl:border-b-0">
                    <h3 className="text-xs font-medium">Total Users</h3>
                    <p className="text-2xl lg:text-3xl font-bold mt-2">
                      {totalUsers}
                    </p>
                  </div>

                  {/* Best performing feature */}
                  <div className="p-4 xl:p-6 text-center xl:border-l border-white/30">
                    <h3 className="text-xs font-medium">
                      Best Performing Feature
                    </h3>
                    <p className="text-2xl font-bold w-full py-2 rounded">
                      {bestFeatureToday === "resume-builder"
                        ? "Resume Builder"
                        : "ATS Check"}
                    </p>
                  </div>
                </div>

                {/* =====================================================
                  * User activity chart
                 ======================================================*/}
                <div className="w-full bg-white border border-gray-200 rounded-xl box-shadow p-4 md:p-6 mb-6 text-">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 border border-gray-200 flex items-center justify-center rounded-full me-3">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-sm text-gray-600">
                          User activity in {periodLabel.toLowerCase()} ➤
                        </p>
                        <h5 className="text-sm font-semibold text-gray-800">
                          {(growth?.totals.activity ?? 0).toLocaleString()}
                        </h5>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center text-xs font-medium px-2 py-1.5 rounded border ${
                          changeIsUp
                            ? "bg-cyan-100 border-cyan-100 text-cyan-700"
                            : "bg-red-50 border-red-200 text-red-700"
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
                      <dt className="text-gray-600 text-xs font-normal me-1">
                        Resume builds:
                      </dt>
                      <dd className="text-gray-800 text-xs font-semibold">
                        {growth?.totals.resumeBuild ?? "—"}
                      </dd>
                    </dl>
                    <dl className="flex items-center justify-end">
                      <dt className="text-gray-600 text-xs font-normal me-1">
                        ATS checks:
                      </dt>
                      <dd className="text-gray-800 text-xs font-semibold">
                        {growth?.totals.atsUse ?? "—"}
                      </dd>
                    </dl>
                  </div>

                  {/* Column chart */}
                  <div id="column-chart">
                    {growthLoading && !growth ? (
                      <div className="flex items-center justify-center h-40 md:h-48">
                        <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="overflow-x-auto scrollbar-hide">
                        <div className="min-w-[480px] pt-8">
                          <div className="relative h-40 md:h-64 border-b border-gray-200">
                            {/* Y-axis scale: 50 activities = full height */}
                            <div className="absolute inset-y-0 left-0 pointer-events-none select-none">
                              {[50, 40, 30, 20, 10, 0].map((v) => (
                                <span
                                  key={v}
                                  className={`absolute text-[10px] leading-none text-gray-400 ${
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
                                  className="absolute left-7 right-0 border-t border-gray-300"
                                  style={{ top: `${100 - v * 2}%` }}
                                />
                              ))}
                              {[45, 35, 25, 15, 5].map((v) => (
                                <div
                                  key={`minor-${v}`}
                                  className="absolute left-7 right-0 border-t border-dashed border-gray-200"
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
                                            className={`group relative w-full rounded-t-md bg-gradient-to-t ${m.bar} ${m.barHover} transition-all duration-300`}
                                            style={{ height: `${pct}%` }}
                                          >
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-10 whitespace-nowrap bg-gray-900 text-white text-xs rounded-md px-2 py-1">
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
                                  className="flex-1 text-center text-[10px] text-gray-400 truncate"
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
                  <div className="grid grid-cols-1 items-center border-t border-gray-200">
                    <div className="flex justify-between items-center pt-4 md:pt-6">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                          className="text-sm font-medium text-gray-600 hover:text-gray-800 text-center inline-flex items-center"
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
                            <div className="absolute z-20 bottom-full mb-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
                              <ul className="p-2 text-sm text-gray-700 font-medium">
                                {PERIOD_OPTIONS.map((opt) => (
                                  <li key={opt.value}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPeriod(opt.value);
                                        setDropdownOpen(false);
                                      }}
                                      className={`inline-flex items-center w-full p-2 rounded hover:bg-gray-100 ${
                                        period === opt.value
                                          ? "text-cyan-600"
                                          : "text-gray-700"
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
