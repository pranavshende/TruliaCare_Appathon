import type { ReactNode } from 'react';
import { Logo } from '../common/Logo';
import { BuildingIllustration } from '../common/BuildingIllustration';

const FEATURES = [
  {
    title: 'Submit Requests',
    desc: 'Raise IT or facility requests in seconds',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  },
  {
    title: 'Real-time Tracking',
    desc: 'Track status and SLA in real time',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Smart Escalations',
    desc: 'Automatic escalations for faster resolution',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
];

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen bg-slate-100 flex items-center justify-center p-3 sm:p-5 overflow-hidden">
      <div className="w-full max-w-4xl h-full max-h-[92vh] lg:max-h-[600px] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left branding panel */}
        <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-900 via-[#0e1e3f] to-slate-900 px-7 py-6 text-white">
          {/* decorative dot grids */}
          <div className="pointer-events-none absolute top-6 right-6 grid grid-cols-6 gap-1.5 opacity-40">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-blue-400" />
            ))}
          </div>
          <div className="pointer-events-none absolute bottom-6 left-6 grid grid-cols-6 gap-1.5 opacity-30">
            {Array.from({ length: 24 }).map((_, i) => (
              <span key={i} className="w-1 h-1 rounded-full bg-blue-300" />
            ))}
          </div>
          <div className="pointer-events-none absolute -right-16 top-20 w-56 h-56 rounded-full border border-blue-500/20" />

          <Logo dark />

          <div className="relative z-10 mt-3">
            <h1 className="text-2xl xl:text-3xl font-extrabold leading-tight">
              <span className="text-blue-400">Smarter</span> Requests.
              <br />
              <span className="text-blue-400">Faster</span> Resolutions.
            </h1>
            <p className="mt-2.5 text-xs text-blue-100/80 leading-relaxed max-w-sm">
              TruliaCare helps your organization manage facility and IT issues efficiently with
              real-time tracking, SLA monitoring and intelligent escalations.
            </p>

            <ul className="mt-4 space-y-2.5">
              {FEATURES.map((f) => (
                <li key={f.title} className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/20 text-blue-300 shrink-0">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                    </svg>
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-white">{f.title}</p>
                    <p className="text-[11px] text-blue-100/70">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-0 -mx-7 -mb-6 mt-2 h-[110px] overflow-hidden">
            <BuildingIllustration />
          </div>
        </div>

        {/* Right form panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-5 sm:px-10 sm:py-6 overflow-y-auto">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
