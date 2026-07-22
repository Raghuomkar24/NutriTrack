import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Trash2, X } from 'lucide-react';
import type { AlertItem } from '@/context/AlertContext';

interface AlertToastProps {
  toast: AlertItem;
  index: number;
  onDismiss: (id: number) => void;
}

// ─── Design tokens per alert type ────────────────────────────────────────────
const STYLES = {
  success: {
    border: 'border-[rgba(100,210,190,0.55)]',
    iconBg: 'bg-[rgba(100,210,190,0.15)]',
    iconColor: 'text-[#2BADA0]',
    titleColor: 'text-slate-800',
    icon: CheckCircle2,
  },
  delete: {
    border: 'border-[rgba(255,168,150,0.55)]',
    iconBg: 'bg-[rgba(255,168,150,0.15)]',
    iconColor: 'text-[#D4735A]',
    titleColor: 'text-slate-800',
    icon: Trash2,
  },
} as const;

// ─── Spring animation variants ────────────────────────────────────────────────
const toastVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
  exit: {
    opacity: 0,
    scale: 0.88,
    y: 20,
    transition: { duration: 0.22, ease: 'easeInOut' },
  },
};

const iconVariants = {
  hidden: { scale: 0, rotate: -15 },
  visible: {
    scale: [0, 1.35, 1],
    rotate: 0,
    transition: {
      delay: 0.35,
      duration: 0.45,
      times: [0, 0.6, 1],
      ease: 'easeOut',
    },
  },
};

// ─── Progress bar (auto-dismissal indicator) ──────────────────────────────────
const ProgressBar: React.FC<{ type: AlertItem['type'] }> = ({ type }) => {
  const barColor = type === 'success' ? 'bg-[#2BADA0]' : 'bg-[#D4735A]';
  return (
    <div className="absolute bottom-0 left-0 right-0 h-[3px] rounded-b-2xl overflow-hidden bg-white/20">
      <motion.div
        className={`h-full ${barColor} opacity-60`}
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 4, ease: 'linear' }}
      />
    </div>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
const AlertToast: React.FC<AlertToastProps> = ({ toast, onDismiss }) => {
  const [visible, setVisible] = useState(true);
  const style = STYLES[toast.type];
  const Icon = style.icon;

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(toast.id), 250);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={toast.id}
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className={`
            pointer-events-auto relative
            w-[320px] max-w-[calc(100vw-2.5rem)]
            rounded-2xl border ${style.border}
            backdrop-blur-[20px] saturate-150
            bg-[rgba(255,255,255,0.25)]
            shadow-[0_20px_50px_-10px_rgba(181,106,69,0.18),0_8px_24px_-6px_rgba(0,0,0,0.06)]
            overflow-hidden
          `}
          role="alert"
        >
          <div className="flex items-start gap-3 px-4 py-3.5 pr-10">
            {/* Icon with pop animation */}
            <motion.div
              variants={iconVariants}
              initial="hidden"
              animate="visible"
              className={`flex-shrink-0 w-9 h-9 rounded-xl ${style.iconBg} flex items-center justify-center mt-0.5`}
            >
              <Icon size={18} className={style.iconColor} strokeWidth={2.5} />
            </motion.div>

            {/* Text content */}
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-extrabold ${style.titleColor} leading-tight`}>
                {toast.title}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-0.5 leading-snug">
                {toast.body}
              </p>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            aria-label="Dismiss notification"
            className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white/40 transition"
          >
            <X size={13} strokeWidth={2.5} />
          </button>

          {/* Auto-dismiss progress bar */}
          <ProgressBar type={toast.type} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertToast;
