import { useCallback, useEffect, useState } from 'react';
import { Navbar } from '../common/Navbar';
import { SummaryCards } from '../common/SummaryCards';
import { StatusBadge, PriorityBadge } from '../common/StatusBadge';
import { RequestDetailModal } from '../RequestDetailModal';
import { AssignTechnicianModal } from './AssignTechnicianModal';
import { EscalateModal } from './EscalateModal';
import { useToast } from '../../context/ToastContext';
import {
  getAdminDashboardStats,
  getAdminRequestById,
  getAdminRequests,
  updateRequestStatus,
} from '../../services/requests';
import type { DashboardStats, MaintenanceRequest, RequestStatus } from '../../types';

const POLL_INTERVAL_MS = 15000;

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
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [filter, setFilter] = useState<RequestStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<MaintenanceRequest | null>(null);
  const [assignTarget, setAssignTarget] = useState<MaintenanceRequest | null>(null);
  const [escalateTarget, setEscalateTarget] = useState<MaintenanceRequest | null>(null);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const load = useCallback(async (status: RequestStatus | 'ALL', silent = false) => {
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
      // keep cached row data if detail fetch fails
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor, assign, and resolve maintenance requests across the org.</p>
        </div>

        <SummaryCards stats={stats} loading={loading} />

        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
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
                  {requests.map((r) => (
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
          )}
        </div>
      </main>

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
