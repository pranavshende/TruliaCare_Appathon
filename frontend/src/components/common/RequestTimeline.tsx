import type { MaintenanceRequest } from '../../types';

function formatDateTime(iso?: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function RequestTimeline({ request }: { request: MaintenanceRequest }) {
  const hasAssignee = Boolean(request.assignedTo || request.assignedTechnician);
  const isInProgress = ['IN_PROGRESS', 'ESCALATED', 'RESOLVED'].includes(request.status);
  const isEscalated = Boolean(request.escalatedAt) || (request.escalationLogs?.length ?? 0) > 0;
  const isResolved = request.status === 'RESOLVED';

  const lastEscalation = request.escalationLogs?.[request.escalationLogs.length - 1];

  const steps = [
    {
      key: 'created',
      label: 'Request Created',
      done: true,
      time: formatDateTime(request.createdAt),
      color: 'bg-slate-500',
    },
    {
      key: 'assigned',
      label: 'Assigned to Technician',
      done: hasAssignee,
      time: hasAssignee ? formatDateTime(request.updatedAt) : '',
      color: 'bg-blue-500',
    },
    {
      key: 'in_progress',
      label: 'In Progress',
      done: isInProgress,
      time: '',
      color: 'bg-blue-500',
    },
    {
      key: 'escalated',
      label: 'Escalated',
      done: isEscalated,
      time: formatDateTime(request.escalatedAt || lastEscalation?.createdAt),
      color: 'bg-red-500',
      note: lastEscalation ? `${lastEscalation.escalationType} · ${lastEscalation.reason}` : undefined,
    },
    {
      key: 'resolved',
      label: 'Resolved',
      done: isResolved,
      time: isResolved ? formatDateTime(request.updatedAt) : '',
      color: 'bg-emerald-500',
    },
  ].filter((s) => s.done);

  return (
    <ol className="relative border-l-2 border-slate-100 pl-5 space-y-5">
      {steps.map((s) => (
        <li key={s.key} className="relative">
          <span className={`absolute -left-[27px] top-0.5 w-3 h-3 rounded-full ring-4 ring-white ${s.color}`} />
          <p className="text-sm font-semibold text-slate-800">{s.label}</p>
          {s.time && <p className="text-xs text-slate-400">{s.time}</p>}
          {s.note && <p className="text-xs text-red-600 mt-0.5">{s.note}</p>}
        </li>
      ))}
    </ol>
  );
}
