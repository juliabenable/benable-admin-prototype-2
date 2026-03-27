import { X } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';

const TYPE_COLORS = {
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  danger: 'var(--color-danger)',
  info: 'var(--color-info)',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useAppState();

  return (
    <div style={styles.container}>
      {toasts.map(toast => (
        <div key={toast.id} style={{ ...styles.toast, boxShadow: `inset 4px 0 0 ${TYPE_COLORS[toast.type] || TYPE_COLORS.success}, var(--shadow-toast)` }}>
          <span style={styles.message}>{toast.message}</span>
          <div style={styles.actions}>
            {toast.undoAction && (
              <button className="btn btn-ghost btn-sm" onClick={() => { toast.undoAction(); removeToast(toast.id); }}>
                Undo
              </button>
            )}
            <button style={styles.close} onClick={() => removeToast(toast.id)} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  container: {
    position: 'fixed',
    bottom: 24,
    right: 24,
    zIndex: 30,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
    maxWidth: 400,
  },
  toast: {
    background: 'var(--color-bg-card)',
    outline: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-3) var(--space-4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-3)',
  },
  message: { fontSize: 14, lineHeight: '22px', flex: 1 },
  actions: { display: 'flex', alignItems: 'center', gap: 'var(--space-1)', flexShrink: 0 },
  close: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)', padding: 2, display: 'flex', borderRadius: 'var(--radius-sm)' },
};
