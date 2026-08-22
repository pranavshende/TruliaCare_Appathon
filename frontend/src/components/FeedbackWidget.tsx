import { useState } from 'react';
import { apiFetch } from '../services/api';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'SELECT' | 'FLAG' | 'RATE'>('SELECT');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('FACILITY');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleFlag = async () => {
    if (!location) return alert('Location is required');
    setLoading(true);
    try {
      await apiFetch('/feedback/flag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, category })
      });
      setSuccessMsg('Flag submitted anonymously. Thanks!');
      setTimeout(() => reset(), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRate = async (val: number) => {
    if (!location) return alert('Location is required to rate');
    setLoading(true);
    try {
      await apiFetch('/feedback/rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location, rating: val })
      });
      setSuccessMsg('Rating submitted. Thanks!');
      setTimeout(() => reset(), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setIsOpen(false);
    setMode('SELECT');
    setLocation('');
    setSuccessMsg('');
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-slate-800 text-white p-4 rounded-full shadow-lg hover:bg-slate-700 transition-transform hover:scale-105 z-50 flex items-center space-x-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
        <span className="font-bold text-sm hidden sm:inline">Report / Rate</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl ring-1 ring-slate-200 z-50 overflow-hidden animate-fade-in-up">
      <div className="bg-slate-800 p-4 flex justify-between items-center">
        <h3 className="text-white font-bold text-sm">
          {mode === 'SELECT' ? 'Feedback & Reports' : mode === 'FLAG' ? 'Anonymous Flag' : 'Rate Location'}
        </h3>
        <button onClick={reset} className="text-slate-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="p-5">
        {successMsg ? (
          <div className="text-emerald-600 font-bold text-center py-4">{successMsg}</div>
        ) : mode === 'SELECT' ? (
          <div className="space-y-3">
            <button onClick={() => setMode('FLAG')} className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 flex items-center space-x-3">
              <span className="text-xl">🚩</span>
              <div>
                <div className="font-bold text-slate-800 text-sm">Flag an Issue</div>
                <div className="text-xs text-slate-500">Quick, anonymous report without a ticket</div>
              </div>
            </button>
            <button onClick={() => setMode('RATE')} className="w-full text-left p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100 flex items-center space-x-3">
              <span className="text-xl">⭐</span>
              <div>
                <div className="font-bold text-slate-800 text-sm">Rate a Location</div>
                <div className="text-xs text-slate-500">Rate cleanliness or condition</div>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1">Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. 3rd Floor Washroom" className="w-full border-slate-200 rounded-lg text-sm p-2 bg-slate-50 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            {mode === 'FLAG' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border-slate-200 rounded-lg text-sm p-2 bg-slate-50 focus:ring-blue-500 focus:border-blue-500">
                    <option value="IT">IT</option>
                    <option value="FACILITY">Facility</option>
                    <option value="ELECTRICAL">Electrical</option>
                    <option value="PLUMBING">Plumbing</option>
                    <option value="HVAC">HVAC</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <button onClick={handleFlag} disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  {loading ? 'Submitting...' : 'Submit Flag'}
                </button>
              </>
            )}

            {mode === 'RATE' && (
              <div className="flex justify-between px-2 pt-2">
                {[1, 2, 3, 4, 5].map(val => (
                  <button key={val} onClick={() => handleRate(val)} disabled={loading} className="text-2xl hover:scale-125 transition-transform" title={`${val} Stars`}>
                    {val <= 2 ? '😠' : val === 3 ? '😐' : '😊'}
                  </button>
                ))}
              </div>
            )}
            
            <button onClick={() => setMode('SELECT')} className="w-full text-center text-xs text-slate-500 hover:text-slate-700 mt-2">
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
