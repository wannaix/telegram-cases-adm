import React, { useEffect } from 'react';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
export type ToastType = 'success' | 'error' | 'info' | 'warning';
interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}
const toastStyles: Record<ToastType, string> = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  info: 'bg-blue-50 text-blue-800 border-blue-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
};
const toastIcons: Record<ToastType, React.ComponentType<any>> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};
export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  const Icon = toastIcons[type];
  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-lg border shadow-lg max-w-sm animate-slide-in ${toastStyles[type]}`}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};