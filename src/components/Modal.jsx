import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ children, onClose, title, maxWidth = 680 }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.modal, maxWidth }} onClick={e => e.stopPropagation()}>
        <div style={{ ...styles.header, ...(title ? {} : { borderBottomColor: 'transparent', paddingTop: 'var(--space-3)', paddingBottom: 0 }) }}>
          {title ? <h2 style={styles.title}>{title}</h2> : <div />}
          <button style={styles.close} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(45,43,40,0.3)',
    zIndex: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--space-8)',
  },
  modal: {
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-lg)',
    width: '100%',
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 50,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 'var(--space-6)',
    paddingBottom: 'var(--space-4)',
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--color-border)',
    flexShrink: 0,
  },
  title: { fontSize: 18, fontWeight: 600, lineHeight: '28px' },
  close: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
    padding: 'var(--space-1)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
  },
  body: { padding: 'var(--space-4) var(--space-6) var(--space-6)', overflowY: 'auto', flex: 1, overscrollBehavior: 'contain' },
};
