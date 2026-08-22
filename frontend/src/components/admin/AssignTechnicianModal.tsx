import { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { assignTechnician, getTechnicians } from '../../services/requests';
import { useToast } from '../../context/ToastContext';
import type { MaintenanceRequest } from '../../types';

export function AssignTechnicianModal({
  open,
  onClose,
  request,
  onAssigned,
}: {
  open: boolean;
  onClose: () => void;
  request: MaintenanceRequest | null;
  onAssigned: (request: MaintenanceRequest) => void;
}) {
  const [technicians, setTechnicians] = useState<{ id: string; name?: string; email: string }[]>([]);
  const [technicianId, setTechnicianId] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    if (!open) return;
    const run = async () => {
      setError('');
      setTechnicianId('');
      setLoading(true);
      try {
        const data = await getTechnicians();
        setTechnicians(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load technicians');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [open]);

  if (!request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!technicianId) return;
    setSubmitting(true);
    setError('');
    try {
      const updated = await assignTechnician(request.id, technicianId);
      showToast('Request assigned successfully.', 'success');
      onAssigned(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign technician');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Assign Technician" maxWidth="max-w-md">
      <p className="text-sm text-slate-500 mb-4">
        Assign a technician to <span className="font-semibold text-slate-700">{request.title}</span>. This will move
        the request to <span className="font-semibold">In Progress</span>.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Technician</label>
          {loading ? (
            <p className="text-sm text-slate-400">Loading technicians...</p>
          ) : technicians.length === 0 ? (
            <p className="text-sm text-slate-400">No technicians available.</p>
          ) : (
            <select
              required
              value={technicianId}
              onChange={(e) => setTechnicianId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>
                Select a technician
              </option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || t.email}
                </option>
              ))}
            </select>
          )}
        </div>

        {error && <p className="text-red-600 text-sm text-center bg-red-50 rounded-lg py-2 px-3">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !technicianId}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition ${
              submitting || !technicianId ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            {submitting ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
