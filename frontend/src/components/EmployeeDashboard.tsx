import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';
import CreateRequest from './CreateRequest';
import SlaTimer from './SlaTimer';
import RequestTimelineModal from './RequestTimelineModal';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]); // For employees
  const [availableTickets, setAvailableTickets] = useState<any[]>([]); // For technicians
  const [assignedTickets, setAssignedTickets] = useState<any[]>([]); // For technicians
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [viewingRequestId, setViewingRequestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'AVAILABLE' | 'ASSIGNED'>('AVAILABLE');

  const fetchRequests = async () => {
    try {
      const res = await apiFetch('/requests/my');
      const data = await res.json();
      if (data.success) {
        if (user?.role === 'TECHNICIAN') {
          setAvailableTickets(data.availableTickets || []);
          setAssignedTickets(data.assignedTickets || []);
        } else {
          setRequests(data.requests || []);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolve = async (id: string) => {
    try {
      const res = await apiFetch(`/requests/${id}/resolve`, { method: 'PATCH' });
      if (res.ok) fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const res = await apiFetch(`/requests/${id}/accept`, { method: 'PATCH' });
      if (res.ok) {
        fetchRequests();
      } else {
        const errorData = await res.json();
        alert(errorData.message || 'Error accepting ticket');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Socket Setup
    const socket: Socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000');
    
    socket.on('ticket_created', () => fetchRequests());
    socket.on('ticket_accepted', () => fetchRequests());
    socket.on('ticket_resolved', () => fetchRequests());

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const activeRequests = user?.role === 'TECHNICIAN' 
    ? (activeTab === 'AVAILABLE' ? availableTickets : assignedTickets) 
    : requests;

  const stats = {
    total: requests.length || assignedTickets.length,
    pending: requests.filter(r => r.status === 'PENDING').length,
    inProgress: requests.filter(r => r.status === 'IN_PROGRESS').length || assignedTickets.filter(r => r.status === 'IN_PROGRESS').length,
    escalated: requests.filter(r => r.status === 'ESCALATED').length || assignedTickets.filter(r => r.status === 'ESCALATED').length,
    resolved: requests.filter(r => r.status === 'RESOLVED').length || assignedTickets.filter(r => r.status === 'RESOLVED').length,
  };

  const filteredRequests = filter === 'ALL' ? activeRequests : activeRequests.filter(r => r.status === filter);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {user?.role === 'EMPLOYEE' && (
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-white shadow p-4 rounded-lg text-center"><p className="text-sm text-gray-500">Total</p><p className="text-2xl font-bold">{stats.total}</p></div>
          <div className="bg-white shadow p-4 rounded-lg text-center"><p className="text-sm text-gray-500">Pending</p><p className="text-2xl font-bold text-yellow-500">{stats.pending}</p></div>
          <div className="bg-white shadow p-4 rounded-lg text-center"><p className="text-sm text-gray-500">In Progress</p><p className="text-2xl font-bold text-blue-500">{stats.inProgress}</p></div>
          <div className="bg-white shadow p-4 rounded-lg text-center"><p className="text-sm text-gray-500">Escalated</p><p className="text-2xl font-bold text-red-500">{stats.escalated}</p></div>
          <div className="bg-white shadow p-4 rounded-lg text-center"><p className="text-sm text-gray-500">Resolved</p><p className="text-2xl font-bold text-green-500">{stats.resolved}</p></div>
        </div>
      )}

      {user?.role === 'TECHNICIAN' && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('AVAILABLE')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'AVAILABLE' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Ticket Pool ({availableTickets.length})
            </button>
            <button
              onClick={() => setActiveTab('ASSIGNED')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'ASSIGNED' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              My Assigned Tickets ({assignedTickets.length})
            </button>
          </nav>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{user?.role === 'TECHNICIAN' ? (activeTab === 'AVAILABLE' ? 'Available Tickets' : 'My Tickets') : 'My Requests'}</h2>
        
        <div className="flex space-x-4 items-center">
          <select value={filter} onChange={e => setFilter(e.target.value)} className="border-gray-300 rounded-md shadow-sm p-2 text-sm">
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {user?.role === 'EMPLOYEE' && (
            <button 
              onClick={() => setShowCreate(!showCreate)} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showCreate ? 'Cancel' : 'Raise Maintenance Request'}
            </button>
          )}
        </div>
      </div>

      {showCreate && <CreateRequest onSuccess={() => { setShowCreate(false); fetchRequests(); }} />}
      {viewingRequestId && <RequestTimelineModal requestId={viewingRequestId} onClose={() => setViewingRequestId(null)} />}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SLA Timer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((r) => (
              <tr key={r.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">#{r.id.slice(-4)}</td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-gray-900">{r.title}</div>
                  <div className="text-sm text-gray-500 mb-2">{r.category} | Priority: {r.priority}</div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">{r.description}</div>
                  {r.imageUrl && (
                    <img src={r.imageUrl} alt="Issue" className="mt-2 h-20 w-20 object-cover rounded shadow-sm border" />
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${r.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                      r.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 
                      r.status === 'ESCALATED' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <SlaTimer createdAt={r.createdAt} status={r.status} acceptedAt={r.acceptedAt} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button onClick={() => setViewingRequestId(r.id)} className="text-blue-600 hover:text-blue-900">View Details</button>
                    {user?.role === 'TECHNICIAN' && activeTab === 'AVAILABLE' && r.status === 'PENDING' && (
                      <button 
                        onClick={() => handleAccept(r.id)}
                        className="text-yellow-600 hover:text-yellow-900 font-medium ml-4"
                      >
                        Accept Request
                      </button>
                    )}
                    {user?.role === 'TECHNICIAN' && activeTab === 'ASSIGNED' && r.status === 'IN_PROGRESS' && (
                      <button 
                        onClick={() => handleResolve(r.id)}
                        className="text-green-600 hover:text-green-900 font-medium ml-4"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
