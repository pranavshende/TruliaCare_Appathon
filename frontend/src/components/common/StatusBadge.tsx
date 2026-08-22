import type { Priority, RequestStatus } from '../../types';

const STATUS_STYLES: Record<RequestStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  ESCALATED: 'bg-red-50 text-red-700 ring-red-600/20',
  RESOLVED: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
};

const STATUS_DOT: Record<RequestStatus, string> = {
  PENDING: 'bg-amber-500',
  IN_PROGRESS: 'bg-blue-500',
  ESCALATED: 'bg-red-500',
  RESOLVED: 'bg-emerald-500',
};

const STATUS_LABEL: Record<RequestStatus, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  ESCALATED: 'Escalated',
  RESOLVED: 'Resolved',
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[status]} ${status === 'ESCALATED' ? 'animate-pulse' : ''}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}

const PRIORITY_STYLES: Record<Priority, string> = {
  LOW: 'bg-slate-100 text-slate-600',
  MEDIUM: 'bg-blue-100 text-blue-700',
  HIGH: 'bg-orange-100 text-orange-700',
  CRITICAL: 'bg-red-100 text-red-700',
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${PRIORITY_STYLES[priority]}`}>
      {priority}
    </span>
  );
}
