import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type ToastKind = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

interface ToastContextType {
  showToast: (message: string, kind?: ToastKind) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

const KIND_STYLES: Record<ToastKind, string> = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  warning: 'bg-amber-500',
  info: 'bg-blue-600',
};

const KIND_ICON: Record<ToastKind, string> = {
  success: 'M5 13l4 4L19 7',
  error: 'M6 18L18 6M6 6l12 12',
  warning: 'M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-8.25 3.75h.008v.008h-.008v-.008z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, kind }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg ring-1 ring-black/5 ${KIND_STYLES[t.kind]} animate-[fadeIn_0.15s_ease-out]`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d={KIND_ICON[t.kind]} />
            </svg>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
