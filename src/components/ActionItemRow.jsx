import { AlertTriangle, Send, Eye } from 'lucide-react';

export default function ActionItemRow({ item, onCreatorClick, onAction }) {
  const accentColor = item.actionType === 'review' ? 'var(--color-warning)' : 'var(--color-danger)';

  return (
    <div style={{
      ...styles.row,
      outline: '1px solid var(--color-border)',
      boxShadow: `inset 3px 0 0 ${accentColor}`,
    }}>
      <AlertTriangle
        size={16}
        style={{ color: accentColor, flexShrink: 0, marginTop: 2 }}
      />
      <div style={styles.content}>
        <div style={styles.topLine}>
          <span style={styles.name} onClick={onCreatorClick}>{item.creatorName}</span>
          <span style={styles.campaign}>{item.campaignName}</span>
        </div>
        <div style={styles.desc}>{item.description}</div>
        <span style={{ ...styles.time, color: accentColor }}>{item.timeLabel}</span>
      </div>
      <button
        style={item.actionType === 'nudge' ? styles.nudgeBtn : item.actionType === 'review' ? styles.reviewBtn : undefined}
        className={item.actionType === 'nudge' || item.actionType === 'review' ? '' : 'btn btn-ghost btn-sm'}
        onClick={onAction}
      >
        {item.actionType === 'nudge' && <><Send size={14} /> Nudge</>}
        {item.actionType === 'review' && <><Eye size={14} /> Review</>}
        {item.actionType === 'view' && 'View'}
      </button>
    </div>
  );
}

const styles = {
  row: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-3)',
    padding: 'var(--space-3) var(--space-4)',
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--space-2)',
  },
  content: { flex: 1, minWidth: 0 },
  topLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    marginBottom: 2,
  },
  name: {
    fontWeight: 500,
    fontSize: 14,
    color: 'var(--color-accent)',
    cursor: 'pointer',
  },
  campaign: {
    fontSize: 12,
    fontWeight: 500,
    padding: '1px 8px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-bg-hover)',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  desc: { fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: '20px' },
  time: { fontSize: 13, fontWeight: 500 },
  nudgeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    border: 'none',
    background: 'var(--color-bg-hover)',
    color: 'var(--color-text-primary)',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  reviewBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    borderRadius: 'var(--radius-full)',
    border: 'none',
    background: '#FFF8EB',
    color: '#8B6914',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
};
