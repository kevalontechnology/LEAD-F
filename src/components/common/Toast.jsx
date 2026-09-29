import React from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const styles = {
    success: 'bg-emerald-800 text-white border-emerald-700',
    error: 'bg-red-800 text-white border-red-700',
    info: 'bg-brand-800 text-white border-brand-700'
  };

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-300" />,
    error: <AlertCircle className="w-4 h-4 text-red-300" />,
    info: <Info className="w-4 h-4 text-brand-300" />
  };

  return (
    <div
      className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${styles[type]} text-xs font-medium max-w-md animate-slide-up`}
    >
      {icons[type]}
      <span className="flex-1">{message}</span>
      {onClose && (
        <button onClick={onClose} className="opacity-70 hover:opacity-100 p-0.5">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default Toast;
