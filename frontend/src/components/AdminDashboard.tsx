import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';
import SlaTimer from './SlaTimer';
import RequestTimelineModal from './RequestTimelineModal';

export default function AdminDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [filter, setFilter] = useState('ALL');
  const [viewingRequestId, setViewingRequestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'TICKETS' | 'USERS'>('TICKETS');

  const fetchData = async () => {
    try {
      if (activeTab === 'TICKETS') {
        const res = await apiFetch('/admin/requests');
        const data = await res.json();
        if (data.success) setRequests(data.requests || []);
      } else {
        const res = await apiFetch('/admin/users');
        const data = await res.json();
        if (data.success) setUsers(data.users || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length,
    escalated: requests.filter(r => r.status === 'ESCALATED').length,
    resolved: requests.filter(r => r.status === 'RESOLVED').length,
  };

  const filteredRequests = filter === 'ALL' ? requests : requests.filter(r => r.status === filter);

  // Mock SVG Chart Data (Admin Overview Trendline)
  const chartPoints = "0,90 20,50 40,85 60,40 80,65 100,20";

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Overview</h2>
        <p className="text-slate-500 text-sm mt-1">
          Monitor system-wide tickets, SLA breaches, and manage personnel.
        </p>
      </div>

      {viewingRequestId && <RequestTimelineModal requestId={viewingRequestId} onClose={() => setViewingRequestId(null)} />}

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-200/50 p-1 rounded-xl w-full max-w-sm">
        <button
          onClick={() => setActiveTab('TICKETS')}
          className={`flex-1 text-sm font-extrabold py-2 rounded-lg transition-all ${
            activeTab === 'TICKETS'
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          All Tickets
        </button>
        <button
          onClick={() => setActiveTab('USERS')}
          className={`flex-1 text-sm font-extrabold py-2 rounded-lg transition-all ${
            activeTab === 'USERS'
              ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          User Management
        </button>
      </div>

      {activeTab === 'TICKETS' ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-slate-100 border-b-4 border-blue-500">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</p>
              </div>
              <p className="text-4xl font-extrabold text-slate-900">{stats.total}</p>
            </div>
            
            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-slate-100 border-b-4 border-amber-500">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending</p>
              </div>
              <p className="text-4xl font-extrabold text-slate-900">{stats.pending}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-slate-100 border-b-4 border-blue-400">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-400 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">In Progress</p>
              </div>
              <p className="text-4xl font-extrabold text-slate-900">{stats.inProgress}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-slate-100 border-b-4 border-red-500">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Escalated</p>
              </div>
              <p className="text-4xl font-extrabold text-slate-900">{stats.escalated}</p>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm ring-1 ring-slate-100 border-b-4 border-emerald-500">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resolved</p>
              </div>
              <p className="text-4xl font-extrabold text-slate-900">{stats.resolved}</p>
            </div>
          </div>

          {/* SVG Chart Section */}
          <div className="bg-white rounded-3xl p-6 shadow-sm ring-1 ring-slate-100">
            <h3 className="text-lg font-extrabold text-slate-900 mb-6">System Volume (Last 7 Days)</h3>
            <div className="relative h-48 w-full">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGradientAdmin" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polyline
                  fill="url(#areaGradientAdmin)"
                  points={`0,100 ${chartPoints} 100,100`}
                />
                <polyline
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={chartPoints}
                  className="drop-shadow-md"
                  vectorEffect="nonScalingStroke"
                />
              </svg>
              <div className="absolute inset-0 flex justify-between items-end pb-2 opacity-50 text-xs font-bold pointer-events-none">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-extrabold text-slate-900">All System Tickets</h3>
              <select 
                value={filter} 
                onChange={e => setFilter(e.target.value)} 
                className="border-slate-200 rounded-xl shadow-sm py-2 pl-3 pr-8 text-sm font-bold text-slate-700 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="ESCALATED">Escalated</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-wider">Request</th>
                    <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-wider">SLA Timer</th>
                    <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-wider">Personnel</th>
                    <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm font-medium">
                        No tickets found.
                      </td>
                    </tr>
                  ) : filteredRequests.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs shadow-sm ring-1 ring-slate-200 shrink-0">
                            #{r.id.slice(-4)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{r.title}</div>
                            <div className="text-xs font-medium text-slate-500 mt-0.5">{r.category} &bull; Priority: <span className="font-bold">{r.priority}</span></div>
                            <div className="text-xs font-medium text-slate-600 mt-1 line-clamp-2">{r.description}</div>
                            {r.imageUrl && (
                              <img src={r.imageUrl} alt="Issue" className="mt-2 h-16 w-16 object-cover rounded-lg shadow-sm ring-1 ring-slate-200" />
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border 
                          ${r.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                            r.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600 border-blue-200' : 
                            r.status === 'ESCALATED' ? 'bg-red-50 text-red-600 border-red-200' : 
                            'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 font-medium">
                        <SlaTimer createdAt={r.createdAt} status={r.status} acceptedAt={r.acceptedAt} />
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-xs text-slate-900"><span className="font-bold text-slate-500">By:</span> {r.employee?.name || 'Unknown'}</div>
                        <div className="text-xs text-slate-900 mt-1"><span className="font-bold text-slate-500">To:</span> {r.technician?.name || 'Unassigned'}</div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm font-bold">
                        <button onClick={() => setViewingRequestId(r.id)} className="text-blue-600 hover:text-blue-800 transition-colors">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Users List */
        <div className="bg-white rounded-3xl shadow-sm ring-1 ring-slate-100 overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="text-lg font-extrabold text-slate-900">Personnel Directory</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-left text-xs font-extrabold text-slate-400 uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-500 text-sm font-medium">
                      No users found.
                    </td>
                  </tr>
                ) : users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm shadow-sm border border-white">
                          {u.name?.charAt(0) || u.email?.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{u.name || 'N/A'}</div>
                          <div className="text-xs font-medium text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-full border 
                        ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border-purple-200' : 
                          u.role === 'TECHNICIAN' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                          'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-slate-500 font-medium">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
