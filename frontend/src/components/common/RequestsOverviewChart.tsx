import type { MaintenanceRequest } from '../../types';

const DAY_MS = 86_400_000;

function lastNDays(n: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i--) {
    days.push(new Date(today.getTime() - i * DAY_MS));
  }
  return days;
}

function formatDayLabel(d: Date) {
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleString(undefined, { month: 'short' });
  return `${day} ${month}`;
}

export function RequestsOverviewChart({ requests }: { requests: MaintenanceRequest[] }) {
  const days = lastNDays(7);
  const counts = days.map((day) => {
    const next = day.getTime() + DAY_MS;
    return requests.filter((r) => {
      const t = new Date(r.createdAt).getTime();
      return t >= day.getTime() && t < next;
    }).length;
  });

  const max = Math.max(4, ...counts);
  const width = 560;
  const height = 200;
  const padTop = 16;
  const padBottom = 28;
  const padLeft = 8;
  const padRight = 8;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const points = counts.map((c, i) => {
    const x = padLeft + (counts.length === 1 ? chartW / 2 : (i / (counts.length - 1)) * chartW);
    const y = padTop + chartH - (c / max) * chartH;
    return { x, y, c };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;

  const yTicks = 5;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => Math.round((max / yTicks) * i));

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-5 sm:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-bold text-slate-900">
          Requests Overview <span className="font-medium text-slate-400 text-sm">(Last 7 Days)</span>
        </h3>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1.5">
          Last 7 Days
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </span>
      </div>

      <div className="flex-1 min-h-[180px]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
          {tickValues.map((v, i) => {
            const y = padTop + chartH - (v / max) * chartH;
            return (
              <g key={i}>
                <line x1={padLeft} x2={width - padRight} y1={y} y2={y} stroke="#f1f5f9" strokeWidth={1} />
                <text x={0} y={y + 3} fontSize="9" fill="#94a3b8">
                  {v}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#requestsAreaGradient)" opacity={0.5} />
          <path d={linePath} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={4} fill="#2563eb" stroke="white" strokeWidth={1.5} />
              <text x={p.x} y={p.y - 10} fontSize="10" fontWeight={700} fill="#1e293b" textAnchor="middle">
                {p.c}
              </text>
              <text x={p.x} y={height - 6} fontSize="9" fill="#94a3b8" textAnchor="middle">
                {formatDayLabel(days[i])}
              </text>
            </g>
          ))}

          <defs>
            <linearGradient id="requestsAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
        Number of Requests
      </p>
    </div>
  );
}
