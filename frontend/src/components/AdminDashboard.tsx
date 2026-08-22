import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import SlaTimer from './SlaTimer';
import RequestTimelineModal from './RequestTimelineModal';

export default function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, escalated: 0, resolved: 0 });
  const [analytics, setAnalytics] = useState<any>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [viewingRequestId, setViewingRequestId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [statsRes, reqsRes, techRes, analyticsRes] = await Promise.all([
        apiFetch('/admin/dashboard'),
        apiFetch(`/admin/requests?status=${filter}`),
        apiFetch('/admin/technicians'),
        apiFetch('/admin/analytics')
      ]);

      const [statsData, reqsData, techData, analyticsData] = await Promise.all([
        statsRes.json(), reqsRes.json(), techRes.json(), analyticsRes.json()
      ]);

      if (statsData.success) setStats(statsData.stats);
      if (reqsData.success) setRequests(reqsData.requests);
      if (techData.success) setTechnicians(techData.technicians);
      if (analyticsData.success) setAnalytics(analyticsData.analytics);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [filter]);

  const handleAssign = async (reqId: string, techId: string) => {
    await apiFetch(`/admin/requests/${reqId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ technicianId: techId })
    });
    fetchData();
  };

  const handleStatusUpdate = async (reqId: string, status: string) => {
    await apiFetch(`/admin/requests/${reqId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  const handleEscalate = async (reqId: string) => {
    await apiFetch(`/admin/requests/${reqId}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ reason: 'Manually escalated by Admin' })
    });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white shadow p-4 rounded-lg text-center"><p className="text-sm text-gray-500">Total Requests</p><p className="text-2xl font-bold">{stats.total}</p></div>
        <div className="bg-white shadow p-4 rounded-lg text-center"><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-yellow-500">{stats.pending}</p></div>
        <div className="bg-white shadow p-4 rounded-lg text-center"><p className="text-sm text-gray-500">In Progress</p><p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p></div>
        <div className="bg-white shadow p-4 rounded-lg text-center"><p className="text-sm text-gray-500">Escalated</p><p className="text-2xl font-bold text-red-500">{stats.escalated}</p></div>
        <div className="bg-white shadow p-4 rounded-lg text-center"><p className="text-sm text-gray-500">Resolved</p><p className="text-2xl font-bold text-green-500">{stats.resolved}</p></div>
      </div>

      {analytics && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white shadow p-4 rounded-lg">
            <h3 className="font-bold mb-2">Category Breakdown</h3>
            {analytics.categories.map((c: any) => (
              <div key={c.category} className="flex justify-between text-sm py-1 border-b">
                <span>{c.category}</span>
                <span className="font-bold">{c.count}</span>
              </div>
            ))}
          </div>
          <div className="bg-white shadow p-4 rounded-lg">
            <h3 className="font-bold mb-2">Priority Breakdown</h3>
            {analytics.priorities.map((p: any) => (
              <div key={p.priority} className="flex justify-between text-sm py-1 border-b">
                <span>{p.priority}</span>
                <span className="font-bold">{p.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">All Maintenance Requests</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="border-gray-300 rounded-md shadow-sm p-2">
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="ESCALATED">Escalated</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SLA Timer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {viewingRequestId && <RequestTimelineModal requestId={viewingRequestId} onClose={() => setViewingRequestId(null)} />}
            {requests.map((r) => (
              <tr key={r.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{r.title}</div>
                  <div className="text-sm text-gray-500">{r.category} | Priority: {r.priority}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{r.employee?.name || r.employee?.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      r.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                      r.status === 'ESCALATED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <SlaTimer createdAt={r.createdAt} status={r.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <select 
                    value={r.technicianId || ''} 
                    onChange={e => handleAssign(r.id, e.target.value)}
                    className="border-gray-300 rounded text-sm p-1"
                  >
                    <option value="">Unassigned</option>
                    {technicians.map(t => <option key={t.id} value={t.id}>{t.name || t.email}</option>)}
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button onClick={() => setViewingRequestId(r.id)} className="text-blue-600 hover:text-blue-900">View</button>
                  {r.status !== 'RESOLVED' && (
                    <button onClick={() => handleStatusUpdate(r.id, 'RESOLVED')} className="text-green-600 hover:text-green-900">Resolve</button>
                  )}
                  {r.status !== 'ESCALATED' && r.status !== 'RESOLVED' && (
                    <button onClick={() => handleEscalate(r.id)} className="text-red-600 hover:text-red-900">Escalate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
