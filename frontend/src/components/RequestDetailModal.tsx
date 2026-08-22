import type { ReactNode } from 'react';
import type { MaintenanceRequest } from '../types';
import { Modal } from './common/Modal';
import { PriorityBadge, StatusBadge } from './common/StatusBadge';
import { RequestTimeline } from './common/RequestTimeline';

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-slate-800 mt-0.5">{value || '—'}</p>
    </div>
  );
}

function formatDateTime(iso?: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function RequestDetailModal({
  open,
  onClose,
  request,
  showEmployee = false,
  actions,
}: {
  open: boolean;
  onClose: () => void;
  request: MaintenanceRequest | null;
  showEmployee?: boolean;
  actions?: ReactNode;
}) {
  if (!request) return null;

  const technicianName =
    request.assignedTechnician?.name || request.assignedTechnician?.email || request.assignedTo || null;

  return (
    <Modal open={open} onClose={onClose} title={`Request #${request.id.slice(-6).toUpperCase()}`} maxWidth="max-w-2xl">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h4 className="text-lg font-bold text-slate-900">{request.title}</h4>
          <p className="text-sm text-slate-500 mt-1 whitespace-pre-wrap">{request.description}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusBadge status={request.status} />
          <PriorityBadge priority={request.priority} />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-6 bg-slate-50 rounded-xl p-4">
        <Field label="Category" value={request.category} />
        {showEmployee && <Field label="Employee" value={request.employee?.name || request.employee?.email} />}
        <Field label="Assigned Technician" value={technicianName} />
        <Field label="Created At" value={formatDateTime(request.createdAt)} />
        <Field label="Updated At" value={formatDateTime(request.updatedAt)} />
        {request.escalatedAt && <Field label="Escalated At" value={formatDateTime(request.escalatedAt)} />}
      </div>

      <div className="mb-6">
        <h5 className="text-sm font-bold text-slate-800 mb-3">Request Timeline</h5>
        <RequestTimeline request={request} />
      </div>

      {(request.escalationLogs?.length ?? 0) > 0 && (
        <div className="mb-2">
          <h5 className="text-sm font-bold text-slate-800 mb-3">Escalation History</h5>
          <ul className="space-y-2">
            {request.escalationLogs!.map((log) => (
              <li key={log.id} className="rounded-xl border border-red-100 bg-red-50/60 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-700">
                    {log.previousStatus} → {log.newStatus}
                  </span>
                  <span className="text-xs font-semibold text-red-500">{log.escalationType}</span>
                </div>
                <p className="text-sm text-slate-700 mt-1">{log.reason}</p>
                <p className="text-xs text-slate-400 mt-1">{formatDateTime(log.createdAt)}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {actions && <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap gap-2 justify-end">{actions}</div>}
    </Modal>
  );
}
