import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sidebar } from '../common/Sidebar';
import { SummaryCards } from '../common/SummaryCards';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { DeskIllustration } from '../common/DeskIllustration';
import { RequestDetailModal } from '../RequestDetailModal';
import { CreateRequestModal } from './CreateRequestModal';
import { getMyRequestById, getMyRequests } from '../../services/requests';
import type { DashboardStats, MaintenanceRequest, RequestStatus } from '../../types';

const POLL_INTERVAL_MS = 15000;
const PAGE_SIZE = 6;

const STATUS_FILTERS: { label: string; value: RequestStatus | 'ALL' }[] = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Escalated', value: 'ESCALATED' },
  { label: 'Resolved', value: 'RESOLVED' },
];

function computeStats(requests: MaintenanceRequest[]): DashboardStats {
  return {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    inProgress: requests.filter((r) => r.status === 'IN_PROGRESS').length,
    escalated: requests.filter((r) => r.status === 'ESCALATED').length,
    resolved: requests.filter((r) => r.status === 'RESOLVED').length,
  };
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString(undefined, { month: 'short' });
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  return `${day} ${month} ${d.getFullYear()}, ${time}`;
}

function slaTimer(r: MaintenanceRequest): { text: string; color: string } {
  if (r.status === 'RESOLVED') return { text: '—', color: 'text-slate-400' };
  const elapsedMs = Date.now() - new Date(r.createdAt).getTime();
  const hours = Math.floor(elapsedMs / 3_600_000);
  const minutes = Math.floor((elapsedMs % 3_600_000) / 60_000);
  const text = `${hours}h ${minutes}m`;
  if (r.status === 'ESCALATED' || hours >= 4) return { text, color: 'text-red-600' };
  if (hours >= 2) return { text, color: 'text-amber-600' };
  return { text, color: 'text-slate-500' };
}

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<MaintenanceRequest | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await getMyRequests();
      setRequests(data);
      setError('');
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await load();
    };
    run();
    const interval = setInterval(() => load(true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  const openDetail = async (request: MaintenanceRequest) => {
    setSelected(request);
    try {
      const fresh = await getMyRequestById(request.id);
      setSelected(fresh);
    } catch {
      // keep the row's cached data if the detail fetch fails
    }
  };

  const stats = computeStats(requests);

  const filtered = useMemo(
    () => (statusFilter === 'ALL' ? requests : requests.filter((r) => r.status === statusFilter)),
    [requests, statusFilter]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, filtered.length);

  const handleFilterChange = (value: RequestStatus | 'ALL') => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const firstName = (user?.name || user?.email || 'there').split(' ')[0];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onRaiseRequest={() => setCreateOpen(true)}
        notificationsCount={stats.pending + stats.escalated}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700 p-2 -ml-2"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <button
                className="relative text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition"
                aria-label="Notifications"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
                {stats.pending + stats.escalated > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {stats.pending + stats.escalated}
                  </span>
                )}
              </button>

              <div className="text-sm text-right leading-tight hidden sm:block">
                <p className="text-slate-500">
                  Welcome, <span className="font-semibold text-slate-800">{user?.name || user?.email}</span>
                </p>
                <p className="text-xs text-slate-400">{user?.role === 'TECHNICIAN' ? 'Technician' : 'User'}</p>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg px-3.5 py-2 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H3"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 via-white to-white rounded-2xl ring-1 ring-slate-100 shadow-sm px-6 sm:px-8 py-8 flex items-center justify-between gap-6">
            <div className="min-w-0">
              <p className="text-slate-500 font-medium">Welcome back,</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {firstName} <span aria-hidden>👋</span>
              </h1>
              <p className="text-sm text-slate-500 mt-2">Here's an overview of your maintenance requests.</p>
            </div>
            <div className="hidden sm:block w-48 h-32 shrink-0">
              <DeskIllustration />
            </div>
          </div>

          <SummaryCards stats={stats} loading={loading} />

          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">My Requests</h2>
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange(e.target.value as RequestStatus | 'ALL')}
                  className="text-sm font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  {STATUS_FILTERS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-md transition self-start sm:self-auto"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Raise Maintenance Request
              </button>
            </div>

            {error && <p className="text-red-600 text-sm text-center py-4 bg-red-50">{error}</p>}

            {loading ? (
              <p className="text-center text-slate-400 text-sm py-16">Loading requests...</p>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 px-6">
                <p className="text-slate-500 text-sm">
                  {requests.length === 0 ? "You haven't raised any requests yet." : 'No requests match this filter.'}
                </p>
                {requests.length === 0 && (
                  <button
                    onClick={() => setCreateOpen(true)}
                    className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-semibold"
                  >
                    Create your first request →
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                        <th className="px-5 py-3">ID</th>
                        <th className="px-5 py-3">Title</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Priority</th>
                        <th className="px-5 py-3">SLA Timer</th>
                        <th className="px-5 py-3">Created On</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {pageItems.map((r, i) => {
                        const globalIndex = (currentPage - 1) * PAGE_SIZE + i;
                        const timer = slaTimer(r);
                        return (
                          <tr key={r.id} className="hover:bg-slate-50/70 transition">
                            <td className="px-5 py-3.5 font-semibold text-blue-700">
                              #REQ-{String(filtered.length - globalIndex).padStart(4, '0')}
                            </td>
                            <td className="px-5 py-3.5 font-semibold text-slate-800 max-w-xs truncate">{r.title}</td>
                            <td className="px-5 py-3.5">
                              <StatusBadge status={r.status} />
                            </td>
                            <td className="px-5 py-3.5">
                              <PriorityBadge priority={r.priority} />
                            </td>
                            <td className={`px-5 py-3.5 font-medium ${timer.color}`}>
                              <span className="inline-flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {timer.text}
                              </span>
                            </td>
                            <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">{formatDateTime(r.createdAt)}</td>
                            <td className="px-5 py-3.5 text-right">
                              <button
                                onClick={() => openDetail(r)}
                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg ring-1 ring-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition"
                                aria-label="View request"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                                  />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500">
                    Showing {rangeStart} to {rangeEnd} of {filtered.length} requests
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg ring-1 ring-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      aria-label="Previous page"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                          p === currentPage
                            ? 'bg-blue-700 text-white shadow-sm'
                            : 'ring-1 ring-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg ring-1 ring-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      aria-label="Next page"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      <CreateRequestModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(req) => setRequests((prev) => [req, ...prev])}
      />

      <RequestDetailModal open={Boolean(selected)} onClose={() => setSelected(null)} request={selected} />
    </div>
  );
}
