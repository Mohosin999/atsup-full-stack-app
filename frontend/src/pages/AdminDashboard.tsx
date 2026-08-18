import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { AdminDashboardMetrics, GrowthData, GrowthPeriod, PresenceData, OnlineUser } from '../types';
import { Link, Navigate } from 'react-router-dom';
import {
  ChevronDown,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Users,
} from 'lucide-react';
import api from '../api/api';

const PERIOD_OPTIONS: { value: GrowthPeriod; label: string }[] = [
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '14d', label: 'Last 14 days' },
  { value: '30d', label: 'Last 30 days' },
];

type MetricKey = keyof GrowthData['series'];

const METRIC_CONFIG: {
  key: MetricKey;
  label: string;
  bar: string;
  barHover: string;
}[] = [
  {
    key: 'resumeBuild',
    label: 'Resume Build',
    bar: 'from-orange-500 to-amber-400',
    barHover: 'group-hover:from-orange-600 group-hover:to-amber-500',
  },
  {
    key: 'atsUse',
    label: 'ATS Check',
    bar: 'from-purple-600 to-purple-400',
    barHover: 'group-hover:from-purple-700 group-hover:to-purple-500',
  },
];

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState<GrowthPeriod>('today');
  const [growth, setGrowth] = useState<GrowthData | null>(null);
  const [growthLoading, setGrowthLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);

  useEffect(() => {
    // Only admins may connect. Cookies are httpOnly, so we never read the
    // token from document.cookie - the browser sends it automatically.
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    // Determine the backend origin. In dev VITE_API_URL is "/api" (relative,
    // proxied by Vite), so the socket origin is the frontend origin and the
    // namespace is "/admin-dashboard". Socket.io requests go to /socket.io.
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const baseOrigin = apiUrl.startsWith('http')
      ? new URL(apiUrl).origin
      : window.location.origin;

    const newSocket = io(`${baseOrigin}/admin-dashboard`, {
      withCredentials: true,
      transports: ['websocket'],
    });

    setSocket(newSocket);

    // Fetch initial metrics via REST (axios baseURL is "/api", so the
    // httpOnly accessToken cookie is sent automatically)
    const fetchInitialMetrics = async () => {
      try {
        const response = await api.get('/admin-dashboard/metrics');
        if (response.data.success) {
          setMetrics(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch initial metrics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialMetrics();

    // Listen for metrics updates from socket
    newSocket.on('metrics', (data: AdminDashboardMetrics) => {
      setMetrics(data);
    });

    // Listen for live online-user presence (chat-app style)
    newSocket.on('presence', (data: PresenceData) => {
      setOnlineCount(data.onlineCount);
      setOnlineUsers(data.users);
    });

    newSocket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setLoading(false);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [user, dispatch]);

  // Fetch the combined growth chart for the selected period
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    let cancelled = false;
    setGrowthLoading(true);
    api
      .get(`/admin-dashboard/growth?period=${period}`)
      .then((response) => {
        if (!cancelled && response.data.success) {
          setGrowth(response.data.data);
        }
      })
      .catch((err) => console.error('Failed to fetch growth data:', err))
      .finally(() => {
        if (!cancelled) setGrowthLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [period, user]);

  // Guard: only admins can access this page. Non-admins go to the regular
  // dashboard.
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (loading && !metrics) {
    return <div className="flex h-[calc(100vh-64px)] items-center justify-center">Loading...</div>;
  }

  if (!metrics) {
    return <div className="flex h-[calc(100vh-64px)] items-center justify-center">No data available</div>;
  }

  const {
    totalUsers,
    todayNewUsers,
    resumeBuilderUsersToday,
    atsCheckUsersToday,
    bestFeatureToday,
  } = metrics;

  const periodLabel = PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? 'Today';
  const changeIsUp = (growth?.change ?? 0) >= 0;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50">
      <div className="flex h-full">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200">
          <div className="p-4">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">User Management</h2>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500">
                Online Users
                <span className="ml-1 inline-flex items-center px-1.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                  {onlineCount}
                </span>
              </p>
              {onlineUsers.length === 0 ? (
                <div className="p-3 bg-gray-50 rounded text-sm text-gray-500">
                  No users online right now
                </div>
              ) : (
                <ul className="space-y-2">
                  {onlineUsers.map((u) => (
                    <li key={u.id} className="flex items-center p-2 bg-gray-50 rounded">
                      <span className="relative flex h-2.5 w-2.5 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                      </span>
                      <span className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              Admin Dashboard
              <Link to="/" className="ml-4 text-sm text-gray-500 hover:text-gray-700">
                ← Back to Dashboard
              </Link>
            </h1>
          </header>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
              <p className="text-2xl font-bold text-gray-900 mt-2">{totalUsers}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500 flex items-center">
                Online Users
                <span className="relative flex h-2 w-2 ml-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </h3>
              <p className="text-2xl font-bold text-emerald-600 mt-2">{onlineCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-sm font-medium text-gray-500">New Users (Today)</h3>
              <p className="text-2xl font-bold text-blue-600 mt-2">{todayNewUsers}</p>
            </div>
          </div>

          {/* User Activity Chart */}
          <div className="max-w-4xl w-full bg-white border border-gray-200 rounded-xl shadow-sm p-4 md:p-6 mb-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-100 border border-gray-200 flex items-center justify-center rounded-full me-3">
                  <Users className="w-7 h-7 text-gray-600" />
                </div>
                <div>
                  <h5 className="text-2xl font-semibold text-gray-900">
                    {(growth?.totals.activity ?? 0).toLocaleString()}
                  </h5>
                  <p className="text-sm text-gray-500">User activity in {periodLabel.toLowerCase()}</p>
                </div>
              </div>
              <div>
                <span
                  className={`inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded border ${
                    changeIsUp
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border-red-200 text-red-700'
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
                <dt className="text-gray-500 text-sm font-normal me-1">Resume builds:</dt>
                <dd className="text-gray-900 text-sm font-semibold">
                  {growth?.totals.resumeBuild ?? '—'}
                </dd>
              </dl>
              <dl className="flex items-center justify-end">
                <dt className="text-gray-500 text-sm font-normal me-1">ATS checks:</dt>
                <dd className="text-gray-900 text-sm font-semibold">
                  {growth?.totals.atsUse ?? '—'}
                </dd>
              </dl>
            </div>

            {/* Column chart */}
            <div id="column-chart">
              {growthLoading && !growth ? (
                <div className="flex items-center justify-center h-40 md:h-48">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="min-w-[480px] pt-8">
                    <div className="relative h-40 md:h-48 border-b border-gray-200">
                      {/* Y-axis scale: 50 activities = full height */}
                      <div className="absolute inset-y-0 left-0 flex flex-col justify-between text-[10px] leading-none text-gray-400 pointer-events-none select-none">
                        {[50, 37, 25, 12, 0].map((v) => (
                          <span key={v}>{v}</span>
                        ))}
                      </div>
                      {/* Horizontal gridlines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {[0, 1, 2, 3, 4].map((n) => (
                          <div
                            key={n}
                            className="w-full border-t border-dashed border-gray-100"
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
                                    : Math.min(100, Math.max(2, (val / 50) * 100));
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
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 text-center inline-flex items-center"
                  >
                    {periodLabel}
                    <ChevronDown className="w-4 h-4 ms-1.5" />
                  </button>
                  {dropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="absolute z-20 mt-2 w-44 bg-white border border-gray-200 rounded-lg shadow-lg">
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
                                  period === opt.value ? 'text-emerald-600' : 'text-gray-700'
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
                <a
                  href="#"
                  className="inline-flex items-center text-emerald-600 hover:bg-gray-50 font-medium leading-5 rounded-lg text-sm px-3 py-2"
                >
                  Activity Report
                  <ArrowRight className="w-4 h-4 ms-1.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Feature Usage */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">Feature Usage Today</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-500">Resume Builder Users</h3>
                <p className="text-2xl font-bold text-indigo-600 mt-2">{resumeBuilderUsersToday}</p>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-500">ATS Check Users</h3>
                <p className="text-2xl font-bold text-purple-600 mt-2">{atsCheckUsersToday}</p>
              </div>
              <div className="text-center">
                <h3 className="text-sm font-medium text-gray-500">Best Performing Feature</h3>
                <p className="text-2xl font-bold w-full px-4 py-2 rounded 
                        {bestFeatureToday === 'resume-builder' ? 'bg-indigo-100 text-indigo-800' : 'bg-purple-100 text-purple-800'}"
                >
                  {bestFeatureToday === 'resume-builder' ? 'Resume Builder' : 'ATS Check'}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;