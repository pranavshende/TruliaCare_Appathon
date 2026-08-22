import { useState, useEffect } from 'react';
import { apiFetch } from '../services/api';

export default function ReassignModal({ requestId, onClose, onSuccess }: { requestId: string, onClose: () => void, onSuccess: () => void }) {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    const fetchTechs = async () => {
      try {
        const res = await apiFetch('/admin/technicians/status');
        const data = await res.json();
        if (data.success) {
          setTechnicians(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTechs();
  }, []);

  const handleReassign = async () => {
    if (!selectedTech) return;
    setSubmitting(true);
    try {
      const res = await apiFetch(`/admin/requests/${requestId}/reassign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: selectedTech, reason })
      });
      if (res.ok) {
        onSuccess();
      } else {
        alert('Failed to reassign');
      }
    } catch (err) {
      console.error(err);
      alert('Error during reassignment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-lg font-extrabold text-slate-900">Reassign Ticket #{requestId.slice(-4)}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
        
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <p className="text-sm text-slate-500">Loading available technicians...</p>
          ) : technicians.length === 0 ? (
            <p className="text-sm text-slate-500">No technicians found.</p>
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-slate-700">Select Technician</label>
              <div className="grid gap-3">
                {technicians.map(tech => (
                  <div 
                    key={tech.id} 
                    onClick={() => setSelectedTech(tech.id)}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedTech === tech.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold text-slate-900">{tech.name}</div>
                        <div className="text-xs font-medium text-slate-500">{tech.email}</div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          tech.availability === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700' :
                          tech.availability === 'MODERATE' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {tech.availability}
                        </span>
                        <div className="text-xs font-medium text-slate-500 mt-1">Active: {tech.activeTicketCount}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Reason (Optional)</label>
            <input 
              type="text" 
              value={reason} 
              onChange={e => setReason(e.target.value)} 
              className="w-full border-slate-200 rounded-lg p-2 bg-slate-50 text-sm focus:ring-blue-500 focus:border-blue-500" 
              placeholder="e.g. Current tech unavailable, urgent priority" 
            />
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-100 flex space-x-3 bg-slate-50/50">
          <button onClick={onClose} className="flex-1 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50">Cancel</button>
          <button 
            onClick={handleReassign} 
            disabled={!selectedTech || submitting}
            className="flex-1 px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Reassigning...' : 'Confirm Reassignment'}
          </button>
        </div>
      </div>
    </div>
  );
}
