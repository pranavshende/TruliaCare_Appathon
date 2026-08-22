import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const initials = (user?.name || user?.email || '?')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Logo subtitle={false} />

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1">
              {user?.role}
            </span>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-slate-800 text-white text-xs font-bold flex items-center justify-center">
                {initials}
              </span>
              <span className="hidden md:inline text-sm font-medium text-slate-700">
                {user?.name || user?.email}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm font-semibold text-slate-500 hover:text-red-600 border border-slate-200 hover:border-red-200 hover:bg-red-50 rounded-lg px-3 py-1.5 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
