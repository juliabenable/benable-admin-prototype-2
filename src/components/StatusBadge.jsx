import { STAGE_MAP } from '../utils/stageConfig';

export default function StatusBadge({ stage, style: extraStyle }) {
  const config = STAGE_MAP[stage];
  if (!config) return null;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 24,
      padding: '4px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: 12,
      fontWeight: 500,
      lineHeight: '16px',
      background: config.bg,
      color: config.color,
      whiteSpace: 'nowrap',
      ...extraStyle,
    }}>
      {config.label}
    </span>
  );
}

export function LiveBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 24,
      padding: '4px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: 12,
      fontWeight: 500,
      background: 'var(--color-success-light)',
      color: 'var(--color-success-text)',
    }}>
      Live
    </span>
  );
}

export function ArchivedBadge() {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      height: 24,
      padding: '4px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: 12,
      fontWeight: 500,
      background: 'var(--color-neutral-light)',
      color: 'var(--color-neutral)',
    }}>
      Archived
    </span>
  );
}

export function DaysBadge({ days, isOverdue }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '3px 10px',
      borderRadius: 'var(--radius-full)',
      fontSize: 16,
      fontWeight: 500,
      lineHeight: '24px',
      background: isOverdue ? 'var(--color-danger-light)' : 'var(--color-success-light)',
      color: isOverdue ? 'var(--color-danger-text)' : 'var(--color-success-text)',
      whiteSpace: 'nowrap',
    }}>
      {days} {days === 1 ? 'day' : 'days'}
    </span>
  );
}
