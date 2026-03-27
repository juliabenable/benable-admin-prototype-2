import { useNavigate } from 'react-router-dom';
import { Calendar, Users, AlertTriangle, Clock, Eye, ArrowRight } from 'lucide-react';
import { BrandAvatar } from './Avatar';
import { PHASES, STAGES } from '../utils/stageConfig';
import { getUrgencyState } from '../utils/urgency';

export default function CampaignCard({ campaign, creators }) {
  const navigate = useNavigate();

  // Compute stats using urgency system
  const overdue = creators.filter(c => getUrgencyState(c).state === 'overdue').length;
  const dueSoon = creators.filter(c => getUrgencyState(c).state === 'due_soon').length;
  const pendingReview = creators.filter(c => c.stage === 'content_submitted').length;

  // Phase counts
  const phaseCounts = {};
  PHASES.forEach(p => { phaseCounts[p.key] = 0; });
  creators.forEach(c => {
    const stage = STAGES.find(s => s.key === c.stage);
    if (stage) phaseCounts[stage.phase]++;
  });

  // Format date nicely
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `Started ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  };

  // Only show phases that make sense (not denied for the bar)
  const visiblePhases = PHASES.filter(p => p.key !== 'denied');

  return (
    <div style={styles.card} onClick={() => navigate(`/admin/campaigns/${campaign.id}`)}>
      {/* Top: Avatar + Name + Open button */}
      <div style={styles.topRow}>
        <BrandAvatar initial={(campaign.brand || campaign.name)[0]} size={56} photo={campaign.logo} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={styles.name}>{campaign.brand || campaign.name}</span>
          <div style={styles.campaignSubtitle}>{campaign.name}</div>
          {campaign.description && (
            <div style={styles.desc}>{campaign.description}</div>
          )}
        </div>
        <button style={styles.openBtn} onClick={e => { e.stopPropagation(); navigate(`/admin/campaigns/${campaign.id}`); }}>
          Open campaign <ArrowRight size={14} />
        </button>
      </div>

      {/* Info + status pills */}
      <div style={styles.infoBlock}>
        <span style={styles.infoText}>{formatDate(campaign.createdAt)} · {creators.length} creators</span>
        {(overdue > 0 || dueSoon > 0 || pendingReview > 0) && (
          <div style={styles.statusPills}>
            {overdue > 0 && (
              <span style={{ ...styles.pill, ...styles.pillOverdue }}>
                <AlertTriangle size={13} />
                {overdue} overdue
              </span>
            )}
            {dueSoon > 0 && (
              <span style={{ ...styles.pill, ...styles.pillDueSoon }}>
                <Clock size={13} />
                {dueSoon} due soon
              </span>
            )}
            {pendingReview > 0 && (
              <span style={{ ...styles.pill, ...styles.pillReview }}>
                <Eye size={13} />
                {pendingReview} pending review
              </span>
            )}
          </div>
        )}
      </div>

      {/* Phase progress bars — each phase gets its own bar */}
      <div style={styles.phaseBars}>
        {visiblePhases.map(phase => {
          const count = phaseCounts[phase.key] || 0;
          const total = creators.length;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={phase.key} style={styles.phaseCol}>
              <div style={styles.phaseHeader}>
                <span style={styles.phaseLabel}>{phase.label}<span style={styles.phaseCount}>{count}</span></span>
              </div>
              <div style={styles.barTrack}>
                <div style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: phase.color,
                  borderRadius: 'var(--radius-full)',
                  minWidth: count > 0 ? 6 : 0,
                  transition: 'width 300ms ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}

const styles = {
  card: {
    background: 'var(--color-bg-card)',
    outline: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-xl)',
    padding: '24px 28px',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'pointer',
    transition: 'box-shadow 150ms ease',
  },
  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-2)',
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    lineHeight: '30px',
    display: 'block',
  },
  campaignSubtitle: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    lineHeight: '20px',
    marginTop: 1,
  },
  desc: {
    fontSize: 13,
    color: 'var(--color-text-tertiary)',
    lineHeight: '20px',
    marginTop: 2,
  },
  openBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    borderRadius: 'var(--radius-full)',
    border: 'none',
    outline: '1px solid var(--color-border)',
    background: 'var(--color-bg-card)',
    color: 'var(--color-text-primary)',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    transition: 'background 100ms ease',
  },
  // Info block
  infoBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 'var(--space-4)',
  },
  infoText: {
    fontSize: 13,
    color: 'var(--color-text-tertiary)',
    fontWeight: 400,
  },
  statusPills: {
    display: 'flex',
    gap: 'var(--space-2)',
    flexWrap: 'wrap',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 14px',
    borderRadius: 'var(--radius-full)',
    fontSize: 13,
    fontWeight: 500,
    whiteSpace: 'nowrap',
  },
  pillOverdue: {
    background: '#FEE2E2',
    color: '#dc2626',
  },
  pillDueSoon: {
    background: '#FFF7ED',
    color: '#ea580c',
  },
  pillReview: {
    background: '#FFF8EB',
    color: '#8B6914',
  },
  // Phase bars
  phaseBars: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 'var(--space-2)',
    marginBottom: 'var(--space-3)',
  },
  phaseCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  phaseHeader: {
    display: 'flex',
    alignItems: 'baseline',
  },
  phaseLabel: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  phaseCount: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    marginLeft: 4,
  },
  barTrack: {
    height: 6,
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-bg-hover)',
    overflow: 'hidden',
  },
};
