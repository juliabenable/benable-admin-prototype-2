import { useState } from 'react';
import { Play, Plus, SkipForward, RotateCcw, ChevronUp, ChevronDown, Zap, UserPlus, Trash2 } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';

const PROGRAM_STAGES = ['not_in_program', 'invited_to_program', 'in_program'];

const CAMPAIGN_STAGES = [
  'invited_to_campaign',
  'accepted_campaign',
  'products_ordered',
  'awaiting_content',
  'awaiting_review',
  'feedback_given',
  'posted',
  'completed',
];

const STAGE_LABELS = {
  not_in_program: 'Not in Program',
  invited_to_program: 'Invited to Program',
  in_program: 'In Program',
  invited_to_campaign: 'Invited',
  accepted_campaign: 'Accepted',
  declined_campaign: 'Declined',
  products_ordered: 'Products Ordered',
  awaiting_content: 'Awaiting Content',
  awaiting_review: 'Awaiting Review',
  feedback_given: 'Feedback Given',
  posted: 'Posted',
  completed: 'Completed',
};

const STAGE_COLORS = {
  not_in_program: '#6B7280',
  invited_to_program: '#92400E',
  in_program: '#166534',
  invited_to_campaign: '#92400E',
  accepted_campaign: '#166534',
  declined_campaign: '#991B1B',
  products_ordered: '#6D28D9',
  awaiting_content: '#0E7490',
  awaiting_review: '#991B1B',
  feedback_given: '#1E40AF',
  posted: '#0E7490',
  completed: '#6B7280',
};

const RANDOM_NAMES = [
  { name: 'Elena Cruz', handle: '@elenacruz', niche: 'Beauty', initials: 'EC', city: 'Phoenix, AZ', bio: 'Beauty creator sharing honest reviews.', photo: 'https://images.unsplash.com/photo-1485893226355-9a1c32a0c81e?w=200&h=200&fit=crop&crop=face' },
  { name: 'Destiny Ray', handle: '@destinyray', niche: 'Wellness', initials: 'DR', city: 'Austin, TX', bio: 'Wellness coach and content creator.', photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&h=200&fit=crop&crop=face' },
  { name: 'Naomi Scott', handle: '@naomiscott', niche: 'Food', initials: 'NS', city: 'Chicago, IL', bio: 'Food photography and recipe creation.', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face' },
  { name: 'Luna Park', handle: '@lunapark', niche: 'Lifestyle', initials: 'LP', city: 'Seattle, WA', bio: 'Lifestyle and travel content.', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face' },
  { name: 'Ivy Chang', handle: '@ivychang', niche: 'Beauty', initials: 'IC', city: 'San Jose, CA', bio: 'Skincare routines and product reviews.', photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face' },
  { name: 'Ruby Flores', handle: '@rubyflores', niche: 'Food', initials: 'RF', city: 'Dallas, TX', bio: 'Latina food creator. Kitchen experiments.', photo: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face' },
  { name: 'Sienna Cole', handle: '@siennacole', niche: 'Wellness', initials: 'SC', city: 'Denver, CO', bio: 'Mindful living and self-care.', photo: 'https://images.unsplash.com/photo-1499557354967-2b2d8910bcca?w=200&h=200&fit=crop&crop=face' },
  { name: 'Jade Moon', handle: '@jademoon', niche: 'Beauty', initials: 'JM', city: 'Portland, OR', bio: 'Clean beauty and sustainable living.', photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200&h=200&fit=crop&crop=face' },
];

let demoCounter = 100;

export default function DemoPanel() {
  const { creators, setCreators, campaigns, addToast } = useAppState();
  const [isOpen, setIsOpen] = useState(false);
  const [targetCampaign, setTargetCampaign] = useState(campaigns[0]?.id || 'camp1');

  const camp = campaigns.find(c => c.id === targetCampaign);
  const campName = camp?.brand || camp?.name || 'Campaign';

  // Add new creators to the Creator Program (not_in_program stage)
  const addToProgram = (count = 3) => {
    const newCreators = [];
    for (let i = 0; i < count; i++) {
      const template = RANDOM_NAMES[demoCounter % RANDOM_NAMES.length];
      demoCounter++;
      const email = `${template.handle.slice(1)}${demoCounter}@gmail.com`;
      const hasPhone = Math.random() > 0.5;
      newCreators.push({
        ...template,
        id: `demo_${Date.now()}_${i}`,
        handle: `${template.handle}${demoCounter}`,
        email,
        phone: hasPhone ? `(${Math.floor(Math.random() * 900) + 100}) 555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}` : null,
        followers: Math.floor(Math.random() * 30000) + 5000,
        engagement: +(Math.random() * 6 + 2).toFixed(1),
        avgViews: Math.floor(Math.random() * 30000) + 8000,
        avgLikes: Math.floor(Math.random() * 4000) + 500,
        platform: ['ig', 'tiktok', 'both'][Math.floor(Math.random() * 3)],
        campaignId: targetCampaign,
        campaignIds: [targetCampaign],
        stage: 'not_in_program',
        daysInStage: Math.floor(Math.random() * 5),
        isOverdue: false,
        dateAdded: new Date().toISOString().slice(0, 10),
        notes: [],
        emails: [],
        campaignsCompleted: 0,
        usedBefore: false,
        igUrl: `https://instagram.com/${template.handle.slice(1)}${demoCounter}`,
        tiktokUrl: Math.random() > 0.5 ? `https://tiktok.com/${template.handle}${demoCounter}` : null,
        aiMatchReasons: [
          'Strong audience alignment with campaign',
          'High engagement in target niche',
          'Authentic content style',
        ],
        demographics: { location: `${Math.floor(Math.random() * 20 + 60)}% USA`, gender: `${Math.floor(Math.random() * 20 + 65)}% Female`, age: '22–35' },
        posts: Array.from({ length: 6 }, (_, j) => ({
          id: `demo_p_${demoCounter}_${j}`,
          image: `https://images.unsplash.com/photo-${1504674900247 + j * 111}-0877df9cc836?w=400&h=400&fit=crop`,
          platform: ['ig', 'tiktok'][j % 2],
          likes: Math.floor(Math.random() * 40000) + 5000,
          comments: Math.floor(Math.random() * 3000) + 200,
          shares: Math.floor(Math.random() * 5000) + 500,
        })),
      });
    }
    setCreators(prev => [...prev, ...newCreators]);
    addToast(`${count} creators added to Creator Program`, 'success');
  };

  // Advance creators through the Creator Program pipeline
  const advanceProgramCreators = () => {
    let moved = 0;
    setCreators(prev => prev.map(c => {
      const campaignIds = c.campaignIds || (c.campaignId ? [c.campaignId] : []);
      if (!campaignIds.includes(targetCampaign)) return c;
      const idx = PROGRAM_STAGES.indexOf(c.stage);
      if (idx < 0 || idx >= PROGRAM_STAGES.length - 1) return c;
      moved++;
      return { ...c, stage: PROGRAM_STAGES[idx + 1], daysInStage: 0, isOverdue: false };
    }));
    addToast(`Advanced ${moved} creators in Creator Program`, 'success');
  };

  // Advance creators through the Campaign pipeline
  const advanceCampaignCreators = () => {
    let moved = 0;
    setCreators(prev => prev.map(c => {
      if (c.campaignId !== targetCampaign) return c;
      const idx = CAMPAIGN_STAGES.indexOf(c.stage);
      if (idx < 0 || idx >= CAMPAIGN_STAGES.length - 1) return c;
      moved++;
      const nextStage = CAMPAIGN_STAGES[idx + 1];
      const extras = {};
      if (nextStage === 'awaiting_review' && !c.contentSubmission) {
        extras.contentSubmission = {
          type: Math.random() > 0.5 ? 'video' : 'photo',
          caption: `Loving this product from the campaign! Such a great fit for my audience. #gifted #benable`,
          submittedAt: new Date().toISOString(),
          aiReview: Math.random() > 0.3 ? 'ok' : 'flagged',
          aiNotes: Math.random() > 0.3 ? null : 'Caption missing required hashtag.',
        };
      }
      return { ...c, stage: nextStage, daysInStage: 0, isOverdue: false, ...extras };
    }));
    addToast(`Advanced ${moved} creators in ${campName} campaign`, 'success');
  };

  // Move all "in_program" creators to "invited_to_campaign" for the selected campaign
  const inviteToCampaign = () => {
    let moved = 0;
    setCreators(prev => prev.map(c => {
      const campaignIds = c.campaignIds || (c.campaignId ? [c.campaignId] : []);
      if (!campaignIds.includes(targetCampaign)) return c;
      if (c.stage !== 'in_program') return c;
      moved++;
      return { ...c, stage: 'invited_to_campaign', campaignId: targetCampaign, daysInStage: 0, isOverdue: false };
    }));
    addToast(`${moved} creators invited to ${campName}`, 'success');
  };

  // Reset all campaign creators back to not_in_program
  const resetAll = () => {
    setCreators(prev => prev.map(c => {
      const campaignIds = c.campaignIds || (c.campaignId ? [c.campaignId] : []);
      if (!campaignIds.includes(targetCampaign) && c.campaignId !== targetCampaign) return c;
      return { ...c, stage: 'not_in_program', daysInStage: 0, isOverdue: false };
    }));
    addToast(`Reset all ${campName} creators`, 'info');
  };

  // Remove demo creators
  const removeDemoCreators = () => {
    setCreators(prev => prev.filter(c => !c.id.startsWith('demo_')));
    addToast('Removed all demo creators', 'info');
  };

  // Stage counts
  const allStages = [...PROGRAM_STAGES, ...CAMPAIGN_STAGES, 'declined_campaign'];
  const stageCounts = {};
  creators.forEach(c => {
    const campaignIds = c.campaignIds || (c.campaignId ? [c.campaignId] : []);
    if (campaignIds.includes(targetCampaign) || c.campaignId === targetCampaign) {
      stageCounts[c.stage] = (stageCounts[c.stage] || 0) + 1;
    }
  });

  return (
    <div style={styles.wrap}>
      <button style={styles.toggleBtn} onClick={() => setIsOpen(!isOpen)}>
        <Zap size={16} />
        Demo
        {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
      </button>

      {isOpen && (
        <div style={styles.panel}>
          <div style={styles.panelHeader}>Demo Controls</div>

          {/* Campaign selector */}
          <div style={styles.field}>
            <label style={styles.fieldLabel}>Campaign</label>
            <select value={targetCampaign} onChange={e => setTargetCampaign(e.target.value)} style={styles.select}>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.brand || c.name}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <div style={styles.sectionLabel}>Creator Program</div>
            <button style={styles.actionBtn} onClick={() => addToProgram(3)}>
              <Plus size={14} /> Add 3 Creators
            </button>
            <button style={{ ...styles.actionBtn, ...styles.actionPrimary }} onClick={advanceProgramCreators}>
              <SkipForward size={14} /> Advance Program Stage
            </button>

            <div style={{ ...styles.sectionLabel, marginTop: 8 }}>Campaign Pipeline</div>
            <button style={styles.actionBtn} onClick={inviteToCampaign}>
              <UserPlus size={14} /> Invite to Campaign
            </button>
            <button style={{ ...styles.actionBtn, ...styles.actionPrimary }} onClick={advanceCampaignCreators}>
              <SkipForward size={14} /> Advance Campaign Stage
            </button>

            <div style={{ ...styles.sectionLabel, marginTop: 8 }}>Reset</div>
            <button style={{ ...styles.actionBtn, ...styles.actionDanger }} onClick={resetAll}>
              <RotateCcw size={14} /> Reset All Stages
            </button>
            <button style={{ ...styles.actionBtn, ...styles.actionDanger }} onClick={removeDemoCreators}>
              <Trash2 size={14} /> Remove Demo Creators
            </button>
          </div>

          {/* Stage summary */}
          <div style={styles.summary}>
            {allStages.map(key => {
              const count = stageCounts[key] || 0;
              if (count === 0) return null;
              return (
                <div key={key} style={styles.summaryRow}>
                  <span style={{ ...styles.summaryDot, background: STAGE_COLORS[key] || '#6B7280' }} />
                  <span style={styles.summaryLabel}>{STAGE_LABELS[key] || key}</span>
                  <span style={styles.summaryCount}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrap: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: '#2D2B28',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
  },
  panel: {
    background: '#fff',
    borderRadius: 'var(--radius-xl)',
    border: '1px solid var(--color-border)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    padding: 'var(--space-4)',
    width: 260,
    maxHeight: '70vh',
    overflowY: 'auto',
  },
  panelHeader: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 'var(--space-3)',
    color: 'var(--color-text-primary)',
  },
  field: {
    marginBottom: 'var(--space-3)',
  },
  fieldLabel: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: 2,
  },
  select: {
    width: '100%',
    height: 32,
    fontSize: 13,
    padding: '4px 8px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    fontFamily: 'inherit',
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    marginBottom: 'var(--space-3)',
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 12px',
    background: 'var(--color-bg-sidebar)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
    color: 'var(--color-text-primary)',
    transition: 'background 100ms ease',
  },
  actionPrimary: {
    background: 'var(--color-accent)',
    color: '#fff',
    border: 'none',
  },
  actionDanger: {
    background: '#FEE2E2',
    color: '#dc2626',
    border: '1px solid #FECACA',
  },
  summary: {
    borderTop: '1px solid var(--color-border)',
    paddingTop: 'var(--space-2)',
  },
  summaryRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 0',
  },
  summaryDot: {
    width: 8,
    height: 8,
    borderRadius: 'var(--radius-full)',
    flexShrink: 0,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    flex: 1,
  },
  summaryCount: {
    fontSize: 12,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
  },
};
