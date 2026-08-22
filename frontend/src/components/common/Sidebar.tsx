import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/useToast';
import { Logo } from './Logo';
import { BuildingIllustration } from './BuildingIllustration';

const ICONS = {
  home: 'M2.25 12l8.954-8.955a1.125 1.125 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75',
  list: 'M8.25 6.75h12M8.25 12h12M8.25 17.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z',
  plus: 'M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z',
  bell: 'M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0',
  user: 'M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z',
  warning: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-8.25 3.75h.008v.008h-.008v-.008z',
  wrench:
    'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
  headset:
    'M3 18v-6a9 9 0 0118 0v6a3 3 0 01-3 3h-1.5a1.5 1.5 0 01-1.5-1.5v-3a1.5 1.5 0 011.5-1.5H21M3 18h1.5a1.5 1.5 0 001.5-1.5v-3A1.5 1.5 0 004.5 12H3',
};

function NavIcon({ path, className = 'w-5 h-5' }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

export function Sidebar({
  isOpen,
  onClose,
  onRaiseRequest,
  notificationsCount = 0,
  variant = 'employee',
}: {
  isOpen: boolean;
  onClose: () => void;
  onRaiseRequest?: () => void;
  notificationsCount?: number;
  variant?: 'employee' | 'admin' | 'technician';
}) {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isProfile = location.pathname === '/profile';
  const soon = (label: string) => showToast(`${label} is coming soon.`, 'info');
  const goDashboard = () => navigate('/dashboard');
  const goProfile = () => navigate('/profile');

  const navItems =
    variant === 'admin'
      ? [
          { label: 'Dashboard', icon: ICONS.home, active: !isProfile, onClick: goDashboard },
          { label: 'Technicians', icon: ICONS.wrench, onClick: () => soon('Technicians') },
          {
            label: 'Escalations',
            icon: ICONS.warning,
            badge: notificationsCount,
            onClick: () => soon('Escalations'),
          },
          { label: 'Profile', icon: ICONS.user, active: isProfile, onClick: goProfile },
        ]
      : variant === 'technician'
      ? [
          { label: 'Dashboard', icon: ICONS.home, active: !isProfile, onClick: goDashboard },
          { label: 'My Assignments', icon: ICONS.list, onClick: () => soon('My Assignments') },
          { label: 'Notifications', icon: ICONS.bell, badge: notificationsCount, onClick: () => soon('Notifications') },
          { label: 'Profile', icon: ICONS.user, active: isProfile, onClick: goProfile },
        ]
      : [
          { label: 'Dashboard', icon: ICONS.home, active: !isProfile, onClick: goDashboard },
          { label: 'My Requests', icon: ICONS.list, onClick: () => soon('My Requests') },
          { label: 'Raise Request', icon: ICONS.plus, onClick: () => onRaiseRequest?.() },
          { label: 'Notifications', icon: ICONS.bell, badge: notificationsCount, onClick: () => soon('Notifications') },
          { label: 'Profile', icon: ICONS.user, active: isProfile, onClick: goProfile },
        ];

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden" onClick={onClose} />}

      <aside
        className={`fixed lg:sticky inset-y-0 lg:inset-y-auto lg:top-0 left-0 z-50 lg:z-0 h-screen w-72 shrink-0 bg-[#0b1526] border-r border-slate-800/60 flex flex-col transform transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="px-6 py-6 border-b border-white/5">
          <Logo dark />
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.onClick();
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                item.active ? 'bg-blue-700 text-white shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <NavIcon path={item.icon} />
              <span className="flex-1 text-left">{item.label}</span>
              {!!item.badge && (
                <span className="bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="h-36 shrink-0 -mt-2 -mb-2 opacity-90 pointer-events-none">
          <BuildingIllustration />
        </div>

      </aside>
    </>
  );
}
