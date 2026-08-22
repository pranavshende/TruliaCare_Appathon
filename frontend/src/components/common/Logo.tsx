export function ShieldIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
      />
    </svg>
  );
}

export function Logo({ dark = false, subtitle = true }: { dark?: boolean; subtitle?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-md shrink-0">
        <ShieldIcon className="w-6 h-6" />
      </span>
      <div className="leading-tight">
        <p className={`text-xl font-extrabold tracking-tight ${dark ? 'text-white' : 'text-slate-900'}`}>
          Trulia<span className="text-blue-500">Care</span>
        </p>
        {subtitle && (
          <p className={`text-xs font-medium ${dark ? 'text-blue-200/80' : 'text-slate-500'}`}>
            Facility &amp; IT Helpdesk
          </p>
        )}
      </div>
    </div>
  );
}
