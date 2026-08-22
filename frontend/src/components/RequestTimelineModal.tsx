import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RequestTimelineModal({ requestId, onClose }: { requestId: string, onClose: () => void }) {
  const { user } = useAuth();
  const [request, setRequest] = useState<any>(null);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [assigningTechId, setAssigningTechId] = useState('');
  const [loading, setLoading] = useState(true);

  const handleAssign = async () => {
    if (!assigningTechId) return;
    try {
      const res = await apiFetch(`/admin/requests/${requestId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: assigningTechId })
      });
      if (res.ok) {
        onClose();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const endpoint = user?.role === 'ADMIN' ? `/admin/requests/${requestId}` : `/requests/${requestId}`;
        const res = await apiFetch(endpoint);
        const data = await res.json();
        if (data.success) {
          setRequest(data.request);
        }
        
        if (user?.role === 'ADMIN') {
          const techRes = await apiFetch('/admin/technicians');
          const techData = await techRes.json();
          if (techData.success) {
            setTechnicians(techData.technicians || []);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [requestId, user?.role]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center">
        <div className="bg-white p-5 rounded-lg shadow-xl"><p>Loading...</p></div>
      </div>
    );
  }

  if (!request) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-xl font-bold text-gray-900">Request Timeline: #{request.id.slice(-4)}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 font-bold text-xl">&times;</button>
        </div>
        
        <div className="mt-4">
          <div className="mb-6 bg-gray-50 p-4 rounded">
            <h4 className="font-bold">{request.title}</h4>
            <p className="text-sm text-gray-600 mt-1">{request.description}</p>
            <div className="mt-2 text-xs flex gap-4 text-gray-500">
              <span>Category: {request.category}</span>
              <span>Priority: {request.priority}</span>
              <span>Status: <span className="font-bold">{request.status}</span></span>
            </div>
            {request.imageUrl && (
              <div className="mt-4">
                <p className="text-sm font-bold text-gray-700 mb-2">Attached Photo:</p>
                <img src={request.imageUrl} alt="Issue" className="max-w-full h-auto rounded-lg shadow-sm max-h-64 object-contain" />
              </div>
            )}

            {user?.role === 'ADMIN' && request.status === 'PENDING' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-bold text-sm text-gray-700 mb-2">Assign Technician</h4>
                <div className="flex gap-2">
                  <select 
                    value={assigningTechId} 
                    onChange={e => setAssigningTechId(e.target.value)}
                    className="border border-gray-300 rounded p-2 text-sm flex-1"
                  >
                    <option value="">Select Technician...</option>
                    {technicians.map(t => {
                      const isMatch = t.skills?.includes(request.category);
                      return (
                        <option key={t.id} value={t.id}>
                          {t.name} {isMatch ? '★ (Skill Match)' : ''}
                        </option>
                      )
                    })}
                  </select>
                  <button 
                    onClick={handleAssign}
                    disabled={!assigningTechId}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                  >
                    Assign
                  </button>
                </div>
              </div>
            )}
          </div>

          <h4 className="font-bold mb-4 text-lg">Activity History</h4>
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
            
            {/* Created Event */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-500 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow">
                <div className="flex items-center justify-between space-x-2 mb-1">
                  <div className="font-bold text-slate-900">Request Created</div>
                  <time className="text-xs font-medium text-indigo-500">{new Date(request.createdAt).toLocaleString()}</time>
                </div>
                <div className="text-slate-500 text-sm">Status: PENDING</div>
              </div>
            </div>

            {/* Escalation Logs */}
            {request.escalationLogs?.map((log: any) => (
              <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ${log.newStatus === 'ESCALATED' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-slate-900">{log.newStatus}</div>
                    <time className="text-xs font-medium text-indigo-500">{new Date(log.createdAt).toLocaleString()}</time>
                  </div>
                  <div className="text-slate-500 text-sm">{log.reason}</div>
                  {log.escalationType && <div className="text-xs text-gray-400 mt-1">Type: {log.escalationType}</div>}
                </div>
              </div>
            ))}

            {/* Resolved Event */}
            {request.status === 'RESOLVED' && (
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-green-500 text-slate-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded border border-slate-200 shadow">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-bold text-slate-900">Request Resolved</div>
                    <time className="text-xs font-medium text-indigo-500">{new Date(request.resolvedAt || request.updatedAt).toLocaleString()}</time>
                  </div>
                  
                  {/* Resolution Details */}
                  {request.workPerformed && (
                    <div className="mt-3 text-sm">
                      <div className="text-gray-500 font-bold text-xs uppercase mb-1">Resolution Summary</div>
                      <div className="bg-gray-50 p-2 rounded text-gray-700 mb-2">{request.workPerformed}</div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {request.resourcesUsed && <div><span className="font-bold text-gray-500">Resources:</span> {request.resourcesUsed}</div>}
                        {request.cost !== null && <div><span className="font-bold text-gray-500">Cost:</span> ${request.cost}</div>}
                        {request.timeSpentHours !== null && <div><span className="font-bold text-gray-500">Time Spent:</span> {request.timeSpentHours}h</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
