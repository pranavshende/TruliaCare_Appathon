import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EmployeeDashboard from './EmployeeDashboard';
import AdminDashboard from './AdminDashboard';
import { useState } from 'react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('Overview');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 bg-[#0b1526] flex flex-col justify-between border-r border-slate-800/60 relative z-10 shadow-2xl">
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/50">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              <span className="text-white">Trulía</span>
              <span className="text-blue-500">Care</span>
            </h1>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveNav('Overview')}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                activeNav === 'Overview'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                Overview
              </div>
            </button>

            <button
              onClick={() => setActiveNav('Tickets')}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                activeNav === 'Tickets'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Tickets
              </div>
              <span className="bg-red-500 text-white text-xs font-extrabold px-2 py-0.5 rounded-full">3</span>
            </button>

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => setActiveNav('Users')}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 ${
                  activeNav === 'Users'
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Users
                </div>
              </button>
            )}
          </nav>
        </div>

        {/* Bottom section of sidebar */}
        <div className="relative mt-auto">
          {/* Skyline illustration */}
          <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none opacity-40 z-0 flex items-end">
             <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full fill-current text-[#16294f]">
               <path d="M0,40 L0,30 L10,30 L10,15 L20,15 L20,25 L35,25 L35,5 L45,5 L45,20 L60,20 L60,10 L75,10 L75,25 L90,25 L90,15 L100,15 L100,40 Z" />
               <path d="M5,40 L5,25 L15,25 L15,10 L25,10 L25,35 L40,35 L40,15 L50,15 L50,28 L65,28 L65,5 L80,5 L80,30 L95,30 L95,20 L100,20 L100,40 Z" className="text-[#1c3868]" />
               {/* Windows */}
               <rect x="12" y="18" width="2" height="3" className="text-amber-400" />
               <rect x="22" y="14" width="2" height="3" className="text-amber-400" />
               <rect x="37" y="10" width="2" height="3" className="text-amber-400" />
               <rect x="42" y="15" width="2" height="3" className="text-amber-400" />
               <rect x="62" y="15" width="2" height="3" className="text-amber-400" />
               <rect x="67" y="8" width="2" height="3" className="text-amber-400" />
               <rect x="77" y="14" width="2" height="3" className="text-amber-400" />
               <rect x="92" y="22" width="2" height="3" className="text-amber-400" />
               <rect x="0" y="38" width="100" height="2" className="text-[#0f2147]" />
             </svg>
          </div>

          <div className="p-6 relative z-10 space-y-6">
            {/* Need Help Card */}
            <div className="bg-white/5 rounded-2xl p-4 ring-1 ring-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-white text-sm font-bold mb-1">Need help?</h4>
              <p className="text-slate-400 text-xs mb-3">Contact support or view our documentation.</p>
              <button className="w-full py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-colors">
                Contact Support
              </button>
            </div>

            {/* Profile / Logout */}
            <div className="flex items-center justify-between border-t border-slate-800/60 pt-6">
              <div className="flex items-center space-x-3 truncate">
                <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-sm uppercase flex-shrink-0 shadow-sm border border-slate-600">
                  {user?.name?.charAt(0) || user?.email?.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="text-sm font-bold text-white truncate">{user?.name || 'User'}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 flex items-center justify-center transition-colors flex-shrink-0 ml-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full flex flex-col">
          {user?.role === 'ADMIN' ? <AdminDashboard /> : <EmployeeDashboard />}
        </div>
      </main>
    </div>
  );
}
