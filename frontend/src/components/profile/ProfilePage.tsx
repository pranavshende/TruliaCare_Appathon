import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { useToast } from '../../context/useToast';
import { Sidebar } from '../common/Sidebar';

const ICON = {
  mail: 'M2.25 6.75c0-.621.504-1.125 1.125-1.125h17.25c.621 0 1.125.504 1.125 1.125v10.5c0 .621-.504 1.125-1.125 1.125H3.375A1.125 1.125 0 012.25 17.25V6.75zm2.25.375L12 12l7.5-4.875',
  phone:
    'M2.25 6.75c0 8.284 6.716 15 15 15h1.5a1.5 1.5 0 001.5-1.5v-2.163a1.5 1.5 0 00-1.281-1.484l-4.246-.606a1.5 1.5 0 00-1.494.7l-.665 1.108a12.02 12.02 0 01-5.65-5.65l1.108-.665a1.5 1.5 0 00.7-1.494l-.606-4.246A1.5 1.5 0 0011.663 4.5H9.75a1.5 1.5 0 00-1.5 1.5v.75z',
  building: 'M3 21h18M6 21V6.75A1.5 1.5 0 017.5 5.25h9a1.5 1.5 0 011.5 1.5V21M9 8.25h.008v.008H9V8.25zm3 0h.008v.008H12V8.25zm3 0h.008v.008H15V8.25zM9 12h.008v.008H9V12zm3 0h.008v.008H12V12zm3 0h.008v.008H15V12zM9 15.75h.008v.008H9v-.008zm3 0h.008v.008H12v-.008zm3 0h.008v.008H15v-.008z',
  briefcase:
    'M20.25 14.15v4.25a2 2 0 01-2 2H5.75a2 2 0 01-2-2v-4.25M20.25 14.15a2 2 0 00-1.061-1.767l-6.75-3.6a2 2 0 00-1.878 0l-6.75 3.6A2 2 0 003.75 14.15M20.25 14.15v-.05a2 2 0 00-1.061-1.767M8.25 6.75V5.25a2 2 0 012-2h3.5a2 2 0 012 2v1.5',
  idCard:
    'M2.25 8.25h19.5M6 12h.008v.008H6V12zm3 0h6M4.5 6h15a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0119.5 18h-15a2.25 2.25 0 01-2.25-2.25v-7.5A2.25 2.25 0 014.5 6z',
  pin: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z',
  calendar:
    'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0V11.25A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5',
  camera:
    'M6.827 6.175A2.25 2.25 0 018.92 4.5h6.16a2.25 2.25 0 012.093 1.675l.285 1.05h2.292a1.5 1.5 0 011.5 1.5v10.5a1.5 1.5 0 01-1.5 1.5H4.25a1.5 1.5 0 01-1.5-1.5V8.725a1.5 1.5 0 011.5-1.5h2.292l.285-1.05zM12 17.25a4.125 4.125 0 100-8.25 4.125 4.125 0 000 8.25z',
  pencil:
    'M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM19.5 9.75l-4.5-4.5',
  shield: 'M12 2.25l8.25 3.375v5.85c0 5.4-3.6 8.775-8.25 10.275-4.65-1.5-8.25-4.875-8.25-10.275v-5.85L12 2.25z',
  lock: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75M3.75 10.5h16.5v9a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-9z',
  cog: 'M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.108 1.204.166.397.506.71.93.78l.894.15c.542.09.94.56.94 1.109v1.094c0 .55-.398 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.93.78-.164.398-.142.854.108 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.108-.397.166-.71.506-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.425-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.108.397-.166.71-.506.78-.93l.15-.894z',
  info: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
};

function Icon({ path, className = 'w-5 h-5' }: { path: string; className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}

function ContactRow({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-slate-400 mt-0.5">
        <Icon path={icon} className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
        <p className="text-xs text-slate-400">{label}</p>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-sm text-slate-500">{label}</label>
      <div className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700">
        {value}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [twoFactor, setTwoFactor] = useState(true);

  const soon = (label: string) => showToast(`${label} is coming soon.`, 'info');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const name = user?.name || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '—';
  const isTechnician = user?.role === 'TECHNICIAN';
  const isAdmin = user?.role === 'ADMIN';
  const roleLabel = isAdmin ? 'Admin' : isTechnician ? 'Technician' : 'Employee';
  const designation = isAdmin ? 'Facility Administrator' : isTechnician ? 'Maintenance Technician' : 'IT Support Engineer';
  const department = isAdmin ? 'Administration' : isTechnician ? 'Maintenance' : 'IT Support';
  const employeeId = `EMP${(user?.id || '00000').toString().replace(/\D/g, '').padStart(5, '0').slice(-5)}`;

  const contactRows = [
    { icon: ICON.mail, value: email, label: 'Email' },
    { icon: ICON.phone, value: '+91 98765 43210', label: 'Phone' },
    { icon: ICON.building, value: department, label: 'Department' },
    { icon: ICON.briefcase, value: designation, label: 'Designation' },
    { icon: ICON.pin, value: 'Pune, Maharashtra', label: 'Location' },
    { icon: ICON.idCard, value: employeeId, label: 'Employee ID' },
    { icon: ICON.calendar, value: '15 Jan 2024', label: 'Date Joined' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        notificationsCount={0}
        variant={isAdmin ? 'admin' : isTechnician ? 'technician' : 'employee'}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700 p-2 -ml-2"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            </button>

            <div className="flex items-center gap-4 ml-auto">
              <button
                className="relative text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-100 transition"
                aria-label="Notifications"
              >
                <Icon path={ICON.info} className="hidden" />
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
              </button>

              <div className="text-sm text-right leading-tight hidden sm:block">
                <p className="text-slate-500">
                  Welcome, <span className="font-semibold text-slate-800">{name}</span>
                </p>
                <p className="text-xs text-slate-400">{roleLabel}</p>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg px-3.5 py-2 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H3"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">My Profile</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your personal information and account settings.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-6 flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center text-blue-300">
                  <Icon path={ICON.idCard} className="w-10 h-10" />
                </div>
                <button
                  onClick={() => soon('Photo upload')}
                  className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white ring-1 ring-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 transition"
                  aria-label="Change photo"
                >
                  <Icon path={ICON.camera} className="w-4 h-4" />
                </button>
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">{name}</h2>
              <span className="mt-1 inline-flex items-center rounded-full bg-blue-50 text-blue-600 text-xs font-semibold px-3 py-1">
                {roleLabel}
              </span>

              <div className="w-full mt-6 space-y-4 text-left">
                {contactRows.map((row) => (
                  <ContactRow key={row.label} {...row} />
                ))}
              </div>

              <button
                onClick={() => soon('Edit Profile')}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl py-2.5 hover:bg-slate-50 transition"
              >
                <Icon path={ICON.pencil} className="w-4 h-4" />
                Edit Profile
              </button>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600">
                      <Icon path={ICON.idCard} className="w-5 h-5" />
                    </span>
                    <h3 className="text-base font-bold text-slate-900">Personal Information</h3>
                  </div>
                  <button
                    onClick={() => soon('Edit Information')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition"
                  >
                    <Icon path={ICON.pencil} className="w-4 h-4" />
                    Edit Information
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <InfoField label="Full Name" value={name} />
                  <InfoField label="Department" value={department} />
                  <InfoField label="Email Address" value={email} />
                  <InfoField label="Designation" value={designation} />
                  <InfoField label="Phone Number" value="+91 98765 43210" />
                  <InfoField label="Employee ID" value={employeeId} />
                  <InfoField label="Location" value="Pune, Maharashtra" />
                  <InfoField label="Date Joined" value="15 Jan 2024" />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600">
                    <Icon path={ICON.shield} className="w-5 h-5" />
                  </span>
                  <h3 className="text-base font-bold text-slate-900">Account &amp; Security</h3>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Password</p>
                    <p className="text-xs text-slate-400">Last changed on 12 Aug 2024</p>
                  </div>
                  <button
                    onClick={() => soon('Change Password')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition"
                  >
                    <Icon path={ICON.lock} className="w-4 h-4" />
                    Change Password
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Two-Factor Authentication</p>
                    <p className="text-xs text-slate-400">Adds an extra layer of security to your account</p>
                  </div>
                  <button
                    role="switch"
                    aria-checked={twoFactor}
                    onClick={() => setTwoFactor((v) => !v)}
                    className={`relative w-11 h-6 rounded-full transition ${twoFactor ? 'bg-blue-600' : 'bg-slate-200'}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                        twoFactor ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-100 p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-blue-50 text-blue-600">
                    <Icon path={ICON.cog} className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Preferences</h3>
                    <p className="text-xs text-slate-400">Manage your notification and communication preferences.</p>
                  </div>
                </div>
                <button
                  onClick={() => soon('Manage Preferences')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg px-3 py-1.5 hover:bg-blue-50 transition shrink-0"
                >
                  Manage Preferences
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-blue-50 text-blue-700 text-sm rounded-xl px-4 py-3">
            <Icon path={ICON.info} className="w-5 h-5 shrink-0 mt-0.5" />
            <p>Keep your profile information updated to ensure smooth communication and faster support.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
