import { useState } from 'react';
import { Modal } from '../common/Modal';
import { CATEGORIES, PRIORITIES } from '../../types';
import type { Category, MaintenanceRequest, Priority } from '../../types';
import { createRequest } from '../../services/requests';
import { useToast } from '../../context/ToastContext';

export function CreateRequestModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (request: MaintenanceRequest) => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category>('IT');
  const [priority, setPriority] = useState<Priority>('MEDIUM');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const reset = () => {
    setTitle('');
    setDescription('');
    setCategory('IT');
    setPriority('MEDIUM');
    setError('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const request = await createRequest({ title, description, category, priority });
      showToast('Request created successfully.', 'success');
      onCreated(request);
      reset();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create request';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="New Maintenance Request">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Internet Not Working"
            className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the issue in detail..."
            className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full rounded-xl border border-slate-200 py-2.5 px-3.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <p className="text-red-600 text-sm text-center bg-red-50 rounded-lg py-2 px-3">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition ${
              submitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
