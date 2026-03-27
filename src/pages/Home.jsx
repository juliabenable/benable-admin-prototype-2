import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import ActionItemRow from '../components/ActionItemRow';
import CampaignCard from '../components/CampaignCard';
import CreatorModal from '../components/CreatorModal';
import NudgeDialog from '../components/NudgeDialog';

export default function Home() {
  const { creators, campaigns } = useAppState();
  const navigate = useNavigate();
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [nudgeCreator, setNudgeCreator] = useState(null);

  const actionItems = useMemo(() => {
    const items = [];
    creators.filter(c => c.isOverdue).forEach(c => {
      const camp = campaigns.find(ca => ca.id === c.campaignId);
      items.push({
        id: `overdue-${c.id}`, creatorId: c.id, creatorName: c.name,
        description: `No response to invite — ${c.daysInStage * 24}h overdue`,
        campaignName: camp?.brand || camp?.name || '', timeLabel: `${c.daysInStage}d overdue`,
        urgency: c.daysInStage >= 3 ? 'high' : 'medium', actionType: 'nudge',
      });
    });
    creators.filter(c => c.stage === 'content_submitted').forEach(c => {
      const camp = campaigns.find(ca => ca.id === c.campaignId);
      items.push({
        id: `review-${c.id}`, creatorId: c.id, creatorName: c.name,
        description: 'Content submitted, awaiting review',
        campaignName: camp?.brand || camp?.name || '', timeLabel: c.daysInStage === 0 ? 'Today' : `${c.daysInStage}d ago`,
        urgency: 'medium', actionType: 'review',
      });
    });
    return items;
  }, [creators, campaigns]);

  const liveCampaigns = campaigns.filter(c => c.status === 'live');

  const handleAction = (item) => {
    if (item.actionType === 'review') navigate('/admin/review');
    else if (item.actionType === 'nudge') setNudgeCreator(creators.find(c => c.id === item.creatorId));
    else setSelectedCreator(creators.find(c => c.id === item.creatorId));
  };

  return (
    <div className="page-container">
      <div style={styles.grid}>
        {/* LEFT: Campaigns (60%) */}
        <div>
          <h2 style={styles.sectionTitle}>Campaigns</h2>
          <div style={styles.campaignStack}>
            {liveCampaigns.map(camp => (
              <CampaignCard key={camp.id} campaign={camp} creators={creators.filter(c => c.campaignId === camp.id)} />
            ))}
          </div>
        </div>

        {/* RIGHT: Action Items (40%) */}
        <div>
          <h2 style={styles.sectionTitle}>
            Needs Attention
            {actionItems.length > 0 && <span style={styles.countBadge}>{actionItems.length}</span>}
          </h2>
          {actionItems.length === 0 ? (
            <div style={styles.emptyState}>
              <CheckCircle size={32} color="var(--color-success)" />
              <p style={styles.emptyText}>All caught up — no action items right now.</p>
            </div>
          ) : (
            <div>
              {actionItems.map(item => (
                <ActionItemRow
                  key={item.id} item={item}
                  onCreatorClick={() => setSelectedCreator(creators.find(c => c.id === item.creatorId))}
                  onAction={() => handleAction(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedCreator && <CreatorModal creator={selectedCreator} onClose={() => setSelectedCreator(null)} />}
      {nudgeCreator && (
        <NudgeDialog creator={nudgeCreator} campaign={campaigns.find(c => c.id === nudgeCreator.campaignId)} onClose={() => setNudgeCreator(null)} />
      )}
    </div>
  );
}

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: '3fr 2fr',
    gap: 'var(--space-6)',
    alignItems: 'start',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 700,
    lineHeight: '32px',
    marginBottom: 'var(--space-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  countBadge: {
    fontSize: 13,
    fontWeight: 600,
    color: 'var(--color-accent-text)',
    background: 'var(--color-danger)',
    padding: '2px 10px',
    borderRadius: 'var(--radius-full)',
    lineHeight: '18px',
  },
  campaignStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-4)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-3)',
    padding: 'var(--space-10)',
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
  },
  emptyText: { fontSize: 14, color: 'var(--color-text-secondary)' },
};
