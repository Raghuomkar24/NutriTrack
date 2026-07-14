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
    success: 'border-green-500/30 bg-green-950/80 text-green-300 shadow-green-500/10',
    error: 'border-red-500/30 bg-red-950/80 text-red-300 shadow-red-500/10',
    info: 'border-blue-500/30 bg-slate-900/80 text-blue-350 shadow-blue-500/10'
  };

  const icons = {
    success: <CheckCircle2 className="text-green-400 flex-shrink-0" size={16} />,
    error: <AlertCircle className="text-red-400 flex-shrink-0" size={16} />,
    info: <Info className="text-blue-400 flex-shrink-0" size={16} />
  };

  return (
    <div 
      className={`fixed right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-fade-in ${colors[type]}`}
      style={{ bottom: `${20 + (index * 60)}px` }}
    >
      {icons[type]}
      <span className="text-xs font-semibold">{message}</span>
      <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg text-slate-450 hover:text-white transition">
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
