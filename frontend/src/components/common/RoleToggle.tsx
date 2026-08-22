import type { Role } from '../../types';

const ROLES: { value: Role; label: string; icon: string }[] = [
  {
    value: 'ADMIN',
    label: 'Admin',
    icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  },
  {
    value: 'TECHNICIAN',
    label: 'Technician',
    icon: 'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
  },
  {
    value: 'EMPLOYEE',
    label: 'Employee',
    icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  },
];

export function RoleToggle({ value, onChange }: { value: Role; onChange: (role: Role) => void }) {
  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
      {ROLES.map((r) => {
        const active = value === r.value;
        return (
          <button
            key={r.value}
            type="button"
            onClick={() => onChange(r.value)}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition ${
              active ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-white'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={r.icon} />
            </svg>
            {r.label}
          </button>
        );
      })}
    </div>
  );
}
