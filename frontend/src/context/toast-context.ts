import { createContext } from 'react';

export type ToastKind = 'success' | 'error' | 'warning' | 'info';

export interface ToastContextType {
  showToast: (message: string, kind?: ToastKind) => void;
}

export const ToastContext = createContext<ToastContextType>({ showToast: () => {} });
