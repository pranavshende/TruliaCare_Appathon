import { Link } from 'react-router-dom';
import { Logo } from './common/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-sm w-full text-center">
        <div className="flex justify-center mb-6">
          <Logo subtitle={false} />
        </div>
        <p className="text-6xl font-extrabold text-slate-200">404</p>
        <h1 className="text-lg font-bold text-slate-900 mt-2">Page not found</h1>
        <p className="text-sm text-slate-500 mt-1.5">The page you're looking for doesn't exist or has moved.</p>
        <Link
          to="/dashboard"
          className="inline-flex mt-6 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md transition"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
