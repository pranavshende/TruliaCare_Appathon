import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const [error, setError] = useState('');
  const { setUser, setToken } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoadingLocal(true);

    try {
      const res = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToken(data.token);
        setUser(data.user);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setIsLoadingLocal(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 flex items-center justify-center px-4 py-12">
      {/* Decorative diagonal bands */}
      <div
        className="pointer-events-none absolute -top-24 -left-24 w-[70vw] h-[55vw] max-h-[600px] max-w-[900px] bg-orange-500"
        style={{ clipPath: 'polygon(0 0, 65% 0, 30% 100%, 0 100%)' }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-24 w-[70vw] h-[55vw] max-h-[600px] max-w-[900px] bg-blue-800"
        style={{ clipPath: 'polygon(100% 100%, 100% 0, 70% 100%, 35% 100%)' }}
      />

      {/* Decorative dot grids */}
      <div className="pointer-events-none absolute top-10 right-10 grid grid-cols-3 gap-2 opacity-60">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-orange-400" />
        ))}
      </div>
      <div className="pointer-events-none absolute bottom-10 left-10 grid grid-cols-3 gap-2 opacity-60">
        {Array.from({ length: 9 }).map((_, i) => (
          <span key={i} className="w-1.5 h-1.5 rounded-full bg-blue-400" />
        ))}
      </div>

      {/* Card */}
      <div className="relative w-full max-w-md">
        <span className="absolute -top-1 left-8 right-1/2 h-1.5 rounded-full bg-orange-500" />
        <span className="absolute -bottom-1 right-8 left-1/2 h-1.5 rounded-full bg-blue-700" />

        <div className="relative bg-white rounded-2xl shadow-xl px-8 py-10 sm:px-10">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center rounded-2xl border-2 border-orange-500 rotate-45 mb-6">
              <svg
                className="w-7 h-7 text-orange-500 -rotate-45"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z"
                />
              </svg>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 text-center mb-8">
              <span className="text-orange-500">Sign in</span> to your account
            </h2>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-orange-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </span>
                <input
                  id="email-address"
                  type="email"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  disabled={isLoadingLocal}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-orange-500">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 10-8 0v4h8z"
                    />
                  </svg>
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={isLoadingLocal}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <div>
              <button
                type="submit"
                disabled={isLoadingLocal}
                className={`w-full flex justify-center py-3 px-4 rounded-xl text-sm font-semibold text-white shadow-md transition duration-150 ease-in-out ${
                  isLoadingLocal
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-800 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
              >
                {isLoadingLocal ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            <div className="text-sm text-center text-slate-700">
              Need an account?{' '}
              <Link to="/register" className="font-semibold text-orange-500 hover:text-orange-600">
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
