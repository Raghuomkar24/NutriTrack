import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
  index?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, index = 0 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    success: 'border-emerald-200 bg-white/85 text-slate-800 shadow-card',
    error: 'border-primary-200 bg-white/85 text-slate-800 shadow-card',
    info: 'border-blue-200 bg-white/85 text-slate-800 shadow-card'
  };

  const icons = {
    success: <CheckCircle2 className="text-emerald-600 flex-shrink-0" size={16} />,
    error: <AlertCircle className="text-primary-650 flex-shrink-0" size={16} />,
    info: <Info className="text-blue-500 flex-shrink-0" size={16} />
  };

  return (
    <div 
      className={`fixed right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-fade-in ${colors[type]}`}
      style={{ bottom: `${20 + (index * 60)}px` }}
    >
      {icons[type]}
      <span className="text-xs font-semibold">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-slate-200/50 rounded-lg text-slate-500 hover:text-slate-800 transition">
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
