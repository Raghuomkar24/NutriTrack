import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Trash2, Info, X } from 'lucide-react';

export type PopUpType = 'success' | 'error' | 'info' | 'delete';

interface PopUpModalProps {
  open: boolean;
  title: string;
  body: string;
  type?: PopUpType;
  onOk: () => void;
}

const STYLES = {
  success: {
    border: 'border-emerald-200/80',
    bg: 'bg-emerald-500/10',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    icon: CheckCircle2,
  },
  error: {
    border: 'border-red-200/80',
    bg: 'bg-red-500/10',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    buttonBg: 'bg-red-600 hover:bg-red-700 text-white',
    icon: AlertCircle,
  },
  info: {
    border: 'border-blue-200/80',
    bg: 'bg-blue-500/10',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    buttonBg: 'bg-blue-600 hover:bg-blue-700 text-white',
    icon: Info,
  },
  delete: {
    border: 'border-rose-200/80',
    bg: 'bg-rose-500/10',
    iconBg: 'bg-rose-100',
    iconColor: 'text-rose-600',
    buttonBg: 'bg-rose-600 hover:bg-rose-700 text-white',
    icon: Trash2,
  },
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.85, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 24 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 10,
    transition: { duration: 0.15 },
  },
};

const iconVariants = {
  hidden: { scale: 0, rotate: -15 },
  visible: {
    scale: [0, 1.3, 1],
    rotate: 0,
    transition: { delay: 0.15, duration: 0.4, ease: 'easeOut' },
  },
};

const PopUpModal: React.FC<PopUpModalProps> = ({
  open,
  title,
  body,
  type = 'success',
  onOk,
}) => {
  const style = STYLES[type] || STYLES.success;
  const IconComponent = style.icon;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="popup-backdrop"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[9999] bg-slate-900/40 backdrop-blur-md"
            onClick={onOk}
          />

          {/* Dialog card */}
          <motion.div
            key="popup-dialog"
            role="dialog"
            aria-modal="true"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className={`
                pointer-events-auto relative w-full max-w-sm rounded-[2rem]
                bg-white/95 backdrop-blur-xl border ${style.border}
                shadow-2xl p-7 text-center space-y-4 animate-fade-in
              `}
            >
              {/* Top close icon */}
              <button
                onClick={onOk}
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X size={16} strokeWidth={2.5} />
              </button>

              {/* Animated Icon */}
              <div className="flex justify-center pt-2">
                <motion.div
                  variants={iconVariants}
                  initial="hidden"
                  animate="visible"
                  className={`w-16 h-16 rounded-2xl ${style.iconBg} flex items-center justify-center shadow-inner`}
                >
                  <IconComponent size={32} className={style.iconColor} strokeWidth={2.2} />
                </motion.div>
              </div>

              {/* Title & Body */}
              <div className="space-y-1.5 px-2">
                <h3 className="text-xl font-black text-slate-850 tracking-tight">
                  {title}
                </h3>
                <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                  {body}
                </p>
              </div>

              {/* OK Button */}
              <div className="pt-2">
                <button
                  onClick={onOk}
                  className={`
                    w-full py-3 px-6 font-extrabold text-sm rounded-xl shadow-md
                    transition-all duration-200 active:scale-95 cursor-pointer ${style.buttonBg}
                  `}
                >
                  OK
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PopUpModal;
