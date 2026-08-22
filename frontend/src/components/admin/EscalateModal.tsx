import { useState } from 'react';
import { Modal } from '../common/Modal';
import { escalateRequest } from '../../services/requests';
import { useToast } from '../../context/ToastContext';
import type { MaintenanceRequest } from '../../types';

export function EscalateModal({
  open,
  onClose,
  request,
  onEscalated,
}: {
  open: boolean;
  onClose: () => void;
  request: MaintenanceRequest | null;
  onEscalated: (request: MaintenanceRequest) => void;
}) {
  const [reason, setReason] = useState('Issue unresolved beyond SLA');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  if (!request) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const updated = await escalateRequest(request.id, reason);
      showToast(`⚠ Request #${request.id.slice(-6).toUpperCase()} has been escalated.`, 'warning');
      onEscalated(updated);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to escalate request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Escalate Request" maxWidth="max-w-md">
      <p className="text-sm text-slate-500 mb-4">
        Manually escalate <span className="font-semibold text-slate-700">{request.title}</span>. An escalation log
        will be created and the admin will be notified by email.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Reason</label>
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 resize-none"
          />
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
            disabled={submitting}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition ${
              submitting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {submitting ? 'Escalating...' : 'Confirm Escalation'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
