import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// ─── Animation variants ───────────────────────────────────────────────────────
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2, delay: 0.05 } },
};

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 320, damping: 24 },
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 10,
    transition: { duration: 0.18, ease: 'easeInOut' },
  },
};

const iconVariants = {
  hidden: { scale: 0, rotate: -20 },
  visible: {
    scale: [0, 1.4, 1],
    rotate: 0,
    transition: { delay: 0.3, duration: 0.5, times: [0, 0.6, 1], ease: 'easeOut' },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  body,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="confirm-backdrop"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[9999] bg-black/20 backdrop-blur-[6px]"
            onClick={onCancel}
            aria-hidden="true"
          />

          {/* Dialog card */}
          <motion.div
            key="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-body"
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="
              fixed inset-0 z-[10000] flex items-center justify-center p-4
              pointer-events-none
            "
          >
            <div
              className="
                pointer-events-auto
                relative w-full max-w-sm
                rounded-3xl border border-[rgba(255,168,150,0.45)]
                backdrop-blur-[20px] saturate-150
                bg-[rgba(255,255,255,0.28)]
                shadow-[0_30px_70px_-12px_rgba(181,106,69,0.22),0_12px_32px_-8px_rgba(0,0,0,0.08),inset_0_1.5px_0_rgba(255,255,255,0.9)]
                p-8 text-center
              "
            >
              {/* Close (cancel) button top-right */}
              <button
                onClick={onCancel}
                aria-label="Cancel"
                className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/40 transition"
              >
                <X size={15} strokeWidth={2.5} />
              </button>

              {/* Icon with spring pop */}
              <div className="flex justify-center mb-5">
                <motion.div
                  variants={iconVariants}
                  initial="hidden"
                  animate="visible"
                  className="
                    w-14 h-14 rounded-2xl
                    bg-[rgba(255,168,150,0.18)]
                    border border-[rgba(255,168,150,0.4)]
                    flex items-center justify-center
                  "
                >
                  <Trash2 size={26} className="text-[#C96A52]" strokeWidth={2} />
                </motion.div>
              </div>

              {/* Title */}
              <h3
                id="confirm-title"
                className="text-xl font-extrabold text-slate-800 tracking-tight"
              >
                {title}
              </h3>

              {/* Body */}
              <p
                id="confirm-body"
                className="text-sm text-slate-500 font-medium mt-2 leading-relaxed"
              >
                {body}
              </p>

              {/* Actions */}
              <div className="flex gap-3 mt-7">
                {/* Cancel */}
                <button
                  id="confirm-cancel-btn"
                  onClick={onCancel}
                  className="
                    flex-1 py-3 rounded-2xl
                    bg-[rgba(255,255,255,0.45)]
                    border border-[rgba(255,255,255,0.6)]
                    backdrop-blur-md
                    text-slate-700 font-bold text-sm
                    shadow-sm
                    hover:bg-white/65
                    active:scale-95
                    transition-all duration-200
                  "
                >
                  Cancel
                </button>

                {/* Delete */}
                <button
                  id="confirm-delete-btn"
                  onClick={onConfirm}
                  className="
                    flex-1 py-3 rounded-2xl
                    bg-[rgba(255,168,150,0.38)]
                    border border-[rgba(255,140,120,0.55)]
                    backdrop-blur-md
                    text-[#9E3D25] font-extrabold text-sm
                    shadow-sm
                    hover:bg-[rgba(255,168,150,0.55)]
                    active:scale-95
                    transition-all duration-200
                  "
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmDialog;
