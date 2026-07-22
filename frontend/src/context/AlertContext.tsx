import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import AlertToast from '@/components/AlertToast';
import ConfirmDialog from '@/components/ConfirmDialog';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AlertType = 'success' | 'delete';

export interface AlertItem {
  id: number;
  type: AlertType;
  title: string;
  body: string;
}

interface ConfirmOptions {
  title?: string;
  body?: string;
}

interface AlertContextValue {
  showAlert: (opts: { type: AlertType; title: string; body: string }) => void;
  confirmDelete: (opts?: ConfirmOptions) => Promise<boolean>;
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AlertContext = createContext<AlertContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<AlertItem[]>([]);
  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    title: string;
    body: string;
  }>({ open: false, title: 'Remove Data?', body: 'This action cannot be undone. Are you sure?' });

  // Stores the resolve function of the pending confirmDelete promise
  const confirmResolveRef = useRef<((value: boolean) => void) | null>(null);
  const idCounter = useRef(0);

  // ── Show a toast notification ────────────────────────────────────────────
  const showAlert = useCallback(
    ({ type, title, body }: { type: AlertType; title: string; body: string }) => {
      const id = ++idCounter.current;
      setToasts((prev) => [...prev, { id, type, title, body }]);

      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  // ── Dismiss a specific toast ─────────────────────────────────────────────
  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Show confirmation dialog, return a Promise<boolean> ──────────────────
  const confirmDelete = useCallback(
    (opts?: ConfirmOptions): Promise<boolean> => {
      return new Promise<boolean>((resolve) => {
        confirmResolveRef.current = resolve;
        setConfirmState({
          open: true,
          title: opts?.title ?? 'Remove Data?',
          body: opts?.body ?? 'This action cannot be undone. Are you sure?',
        });
      });
    },
    []
  );

  const handleConfirm = useCallback(() => {
    setConfirmState((s) => ({ ...s, open: false }));
    confirmResolveRef.current?.(true);
    confirmResolveRef.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    setConfirmState((s) => ({ ...s, open: false }));
    confirmResolveRef.current?.(false);
    confirmResolveRef.current = null;
  }, []);

  return (
    <AlertContext.Provider value={{ showAlert, confirmDelete }}>
      {children}

      {/* Toast stack — bottom-right */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-[9998] flex flex-col-reverse gap-3 pointer-events-none"
      >
        {toasts.map((toast, index) => (
          <AlertToast
            key={toast.id}
            toast={toast}
            index={index}
            onDismiss={dismissToast}
          />
        ))}
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmState.open}
        title={confirmState.title}
        body={confirmState.body}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </AlertContext.Provider>
  );
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export const useAlert = (): AlertContextValue => {
  const ctx = useContext(AlertContext);
  if (!ctx) {
    throw new Error('useAlert must be used inside <AlertProvider>');
  }
  return ctx;
};
