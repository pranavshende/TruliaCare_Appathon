import { useEffect, useState } from 'react';
import { apiFetch } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RequestTimelineModal({ requestId, onClose }: { requestId: string, onClose: () => void }) {
  const { user } = useAuth();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const endpoint = user?.role === 'ADMIN' ? `/admin/requests/${requestId}` : `/requests/${requestId}`;
        const res = await apiFetch(endpoint);
        const data = await res.json();
        if (data.success) {
          setRequest(data.request);
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
                    <time className="text-xs font-medium text-indigo-500">{new Date(request.updatedAt).toLocaleString()}</time>
                  </div>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
