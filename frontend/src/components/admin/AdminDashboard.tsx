import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { Sidebar } from '../common/Sidebar';
import { SummaryCards } from '../common/SummaryCards';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { DeskIllustration } from '../common/DeskIllustration';
import { RequestsOverviewChart } from '../common/RequestsOverviewChart';
import { RequestDetailModal } from '../RequestDetailModal';
import { AssignTechnicianModal } from './AssignTechnicianModal';
import { EscalateModal } from './EscalateModal';
import { useToast } from '../../context/useToast';
import {
  getAdminDashboardStats,
  getAdminRequestById,
  getAdminRequests,
  updateRequestStatus,
} from '../../services/requests';
import type { DashboardStats, MaintenanceRequest, RequestStatus } from '../../types';

const POLL_INTERVAL_MS = 15000;
const PAGE_SIZE = 8;

const FILTERS: { label: string; value: RequestStatus | 'ALL' }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Escalated', value: 'ESCALATED' },
  { label: 'Resolved', value: 'RESOLVED' },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filter, setFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<MaintenanceRequest | null>(null);
  const [assignTarget, setAssignTarget] = useState<MaintenanceRequest | null>(null);
  const [escalateTarget, setEscalateTarget] = useState<MaintenanceRequest | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const { showToast } = useToast();

  const load = useCallback(async (status: RequestStatus | 'ALL', silent = false) => {
    if (silent && document.hidden) return;
    if (!silent) setLoading(true);
    try {
      const [reqData, statsData] = await Promise.all([getAdminRequests(status), getAdminDashboardStats()]);
      setRequests(reqData);
      setStats(statsData);
      setError('');
    } catch (err) {
      if (!silent) setError(err instanceof Error ? err.message : 'Failed to load requests');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await load(filter);
    };
    run();
    const interval = setInterval(() => load(filter, true), POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [filter, load]);

  const handleFilterChange = (value: RequestStatus | 'ALL') => {
    setFilter(value);
    setPage(1);
  };

  const applyUpdate = (updated: MaintenanceRequest) => {
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
    setSelected((prev) => (prev && prev.id === updated.id ? { ...prev, ...updated } : prev));
    load(filter, true);
  };

  const openDetail = async (request: MaintenanceRequest) => {
    setSelected(request);
    try {
      const fresh = await getAdminRequestById(request.id);
      setSelected(fresh);
    } catch {
      // keep cached row data if the detail fetch fails
    }
  };

  const handleResolve = async (request: MaintenanceRequest) => {
    setResolvingId(request.id);
    try {
      const updated = await updateRequestStatus(request.id, 'RESOLVED');
      showToast('Request resolved successfully.', 'success');
      applyUpdate(updated);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to resolve request', 'error');
    } finally {
      setResolvingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const totalPages = Math.max(1, Math.ceil(requests.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = requests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const rangeStart = requests.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, requests.length);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        variant="admin"
        notificationsCount={stats?.escalated ?? 0}
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
                {(stats?.escalated ?? 0) > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {stats?.escalated}
                  </span>
                )}
              </button>

              <div className="text-sm text-right leading-tight hidden sm:block">
                <p className="text-slate-500">
                  Welcome, <span className="font-semibold text-slate-800">{user?.name || user?.email}</span>
                </p>
                <p className="text-xs text-slate-400">Admin</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
            <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-r from-blue-50 via-white to-white rounded-2xl ring-1 ring-slate-100 shadow-sm px-6 sm:px-8 py-8 flex items-center justify-between gap-6">
              <div className="min-w-0">
                <p className="text-slate-500 font-medium">Welcome back,</p>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                  {(user?.name || user?.email || 'Admin').split(' ')[0]} <span aria-hidden>👋</span>
                </h1>
                <p className="text-sm text-slate-500 mt-2">Monitor, assign, and resolve requests across the org.</p>
              </div>
              <div className="hidden sm:block w-32 h-32 shrink-0">
                <DeskIllustration />
              </div>
            </div>

            <div className="lg:col-span-3">
              <RequestsOverviewChart requests={requests} />
            </div>
          </div>

          <SummaryCards stats={stats} loading={loading} />

          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => handleFilterChange(f.value)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition ${
                  filter === f.value
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
            {error && <p className="text-red-600 text-sm text-center py-4 bg-red-50">{error}</p>}

            {loading ? (
              <p className="text-center text-slate-400 text-sm py-16">Loading requests...</p>
            ) : requests.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-16">No requests match this filter.</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                        <th className="px-5 py-3">Issue</th>
                        <th className="px-5 py-3">Employee</th>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Priority</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Technician</th>
                        <th className="px-5 py-3">Created</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {pageItems.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-5 py-3.5 font-semibold text-slate-800 max-w-[220px] truncate">{r.title}</td>
                          <td className="px-5 py-3.5 text-slate-500">{r.employee?.name || r.employee?.email || '—'}</td>
                          <td className="px-5 py-3.5 text-slate-500">{r.category}</td>
                          <td className="px-5 py-3.5">
                            <PriorityBadge priority={r.priority} />
                          </td>
                          <td className="px-5 py-3.5">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">
                            {r.assignedTechnician?.name || r.assignedTechnician?.email || r.assignedTo || '—'}
                          </td>
                          <td className="px-5 py-3.5 text-slate-500">{formatDate(r.createdAt)}</td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                              <button onClick={() => openDetail(r)} className="text-blue-600 hover:text-blue-700 font-semibold">
                                View
                              </button>
                              {r.status !== 'RESOLVED' && (
                                <button
                                  onClick={() => setAssignTarget(r)}
                                  className="text-slate-600 hover:text-slate-900 font-semibold"
                                >
                                  Assign
                                </button>
                              )}
                              {r.status !== 'RESOLVED' && r.status !== 'ESCALATED' && (
                                <button
                                  onClick={() => setEscalateTarget(r)}
                                  className="text-red-600 hover:text-red-700 font-semibold"
                                >
                                  Escalate
                                </button>
                              )}
                              {r.status !== 'RESOLVED' && (
                                <button
                                  onClick={() => handleResolve(r)}
                                  disabled={resolvingId === r.id}
                                  className="text-emerald-600 hover:text-emerald-700 font-semibold disabled:opacity-50"
                                >
                                  {resolvingId === r.id ? 'Resolving...' : 'Resolve'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      Showing {rangeStart} to {rangeEnd} of {requests.length} requests
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
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <RequestDetailModal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        request={selected}
        showEmployee
        actions={
          selected && selected.status !== 'RESOLVED' ? (
            <>
              <button
                onClick={() => setAssignTarget(selected)}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 transition"
              >
                Assign Technician
              </button>
              {selected.status !== 'ESCALATED' && (
                <button
                  onClick={() => setEscalateTarget(selected)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-red-600 ring-1 ring-red-200 hover:bg-red-50 transition"
                >
                  Escalate
                </button>
              )}
              <button
                onClick={() => handleResolve(selected)}
                disabled={resolvingId === selected.id}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition disabled:opacity-50"
              >
                {resolvingId === selected.id ? 'Resolving...' : 'Resolve Request'}
              </button>
            </>
          ) : undefined
        }
      />

      <AssignTechnicianModal
        open={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        request={assignTarget}
        onAssigned={applyUpdate}
      />

      <EscalateModal
        open={Boolean(escalateTarget)}
        onClose={() => setEscalateTarget(null)}
        request={escalateTarget}
        onEscalated={applyUpdate}
      />
    </div>
  );
}
