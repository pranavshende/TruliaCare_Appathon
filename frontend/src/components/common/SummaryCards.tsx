import type { DashboardStats } from '../../types';

const CARDS: {
  key: keyof DashboardStats;
  label: string;
  caption: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
}[] = [
  {
    key: 'total',
    label: 'Total Requests',
    caption: 'All time requests',
    icon: 'M4 4h6v6H4V4zm10 0h6v6h-6V4zM4 14h6v6H4v-6zm10 0h6v6h-6v-6z',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-600',
  },
  {
    key: 'pending',
    label: 'Pending',
    caption: 'Awaiting assignment',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    borderColor: 'border-amber-500',
  },
  {
    key: 'inProgress',
    label: 'In Progress',
    caption: 'Currently being worked on',
    icon: 'M16.023 9.348h4.992v-.001M4.5 12a7.5 7.5 0 0113.5-4.9m1.023 4.9v-4.65m0 0h-4.992M4.5 12a7.5 7.5 0 0013.5 4.9m0 0l3.977-.001M19.023 16.9v4.65m0 0h-4.992',
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    borderColor: 'border-blue-600',
  },
  {
    key: 'escalated',
    label: 'Escalated',
    caption: 'Requires immediate attention',
    icon: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-8.25 3.75h.008v.008h-.008v-.008z',
    iconBg: 'bg-red-50',
    iconColor: 'text-red-600',
    borderColor: 'border-red-500',
  },
  {
    key: 'resolved',
    label: 'Resolved',
    caption: 'Successfully resolved',
    icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    borderColor: 'border-emerald-500',
  },
];

export function SummaryCards({ stats, loading }: { stats: DashboardStats | null; loading?: boolean }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
      {CARDS.map((c) => (
        <div
          key={c.key}
          className={`bg-white rounded-3xl shadow-sm ring-1 ring-slate-100 border-b-4 ${c.borderColor} p-6`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 ${c.iconBg} ${c.iconColor}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={c.icon} />
              </svg>
            </span>
            <p className="text-sm font-bold text-slate-700 uppercase tracking-wide truncate">{c.label}</p>
          </div>
          <p className="text-4xl font-extrabold text-slate-900 mt-6">{loading ? '—' : stats?.[c.key] ?? 0}</p>
          <p className="text-sm text-slate-500 mt-3">{c.caption}</p>
        </div>
      ))}
    </div>
  );
}
