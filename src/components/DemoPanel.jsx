import { useState } from 'react';
import { Play, Plus, SkipForward, RotateCcw, ChevronUp, ChevronDown, Zap } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { STAGES } from '../utils/stageConfig';

const STAGE_KEYS = STAGES.filter(s => s.key !== 'denied').map(s => s.key);

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

  const addCreatorsToSetup = (count = 3) => {
    const newCreators = [];
    for (let i = 0; i < count; i++) {
      const template = RANDOM_NAMES[demoCounter % RANDOM_NAMES.length];
      demoCounter++;
      newCreators.push({
        ...template,
        id: `demo_${Date.now()}_${i}`,
        handle: `${template.handle}${demoCounter}`,
        followers: Math.floor(Math.random() * 30000) + 5000,
        engagement: +(Math.random() * 6 + 2).toFixed(1),
        avgViews: Math.floor(Math.random() * 30000) + 8000,
        avgLikes: Math.floor(Math.random() * 4000) + 500,
        platform: ['ig', 'tiktok', 'both'][Math.floor(Math.random() * 3)],
        campaignId: targetCampaign,
        stage: 'not_in_program',
        daysInStage: 0,
        isOverdue: false,
        notes: [],
        emails: [],
        campaignsCompleted: 0,
        usedBefore: false,
        igUrl: `https://instagram.com/${template.handle.slice(1)}`,
        tiktokUrl: Math.random() > 0.5 ? `https://tiktok.com/${template.handle}` : null,
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
    const camp = campaigns.find(c => c.id === targetCampaign);
    addToast(`${count} creators added to ${camp?.brand || camp?.name} setup`, 'success');
  };

  const advanceAll = () => {
    let moved = 0;
    setCreators(prev => prev.map(c => {
      if (c.campaignId !== targetCampaign) return c;
      const idx = STAGE_KEYS.indexOf(c.stage);
      if (idx < 0 || idx >= STAGE_KEYS.length - 1) return c;
      moved++;
      const nextStage = STAGE_KEYS[idx + 1];
      // When moving to in_program, add full stats
      const extras = {};
      if (nextStage === 'in_program') {
        extras.engagement = +(Math.random() * 5 + 3).toFixed(1);
        extras.avgViews = Math.floor(Math.random() * 25000) + 10000;
        extras.avgLikes = Math.floor(Math.random() * 3000) + 1000;
      }
      if (nextStage === 'content_submitted' && !c.contentSubmission) {
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
    const camp = campaigns.find(c => c.id === targetCampaign);
    addToast(`Advanced ${moved} creators in ${camp?.brand || camp?.name}`, 'success');
  };

  const advanceOne = () => {
    const campCreators = creators.filter(c => c.campaignId === targetCampaign);
    // Find the first creator that can advance
    const candidate = campCreators.find(c => {
      const idx = STAGE_KEYS.indexOf(c.stage);
      return idx >= 0 && idx < STAGE_KEYS.length - 1;
    });
    if (!candidate) {
      addToast('No creators to advance', 'info');
      return;
    }
    const idx = STAGE_KEYS.indexOf(candidate.stage);
    const nextStage = STAGE_KEYS[idx + 1];
    const extras = {};
    if (nextStage === 'in_program') {
      extras.engagement = +(Math.random() * 5 + 3).toFixed(1);
      extras.avgViews = Math.floor(Math.random() * 25000) + 10000;
      extras.avgLikes = Math.floor(Math.random() * 3000) + 1000;
    }
    if (nextStage === 'content_submitted' && !candidate.contentSubmission) {
      extras.contentSubmission = {
        type: Math.random() > 0.5 ? 'video' : 'photo',
        caption: `Loving this product! Such a great fit for my audience. #gifted #benable`,
        submittedAt: new Date().toISOString(),
        aiReview: Math.random() > 0.3 ? 'ok' : 'flagged',
        aiNotes: null,
      };
    }
    setCreators(prev => prev.map(c =>
      c.id === candidate.id ? { ...c, stage: nextStage, daysInStage: 0, isOverdue: false, ...extras } : c
    ));
    const stageLabel = STAGES.find(s => s.key === nextStage)?.label;
    addToast(`${candidate.name} → ${stageLabel}`, 'success');
  };

  const resetAll = () => {
    setCreators(prev => prev.map(c => {
      if (c.campaignId !== targetCampaign) return c;
      return { ...c, stage: 'not_in_program', daysInStage: 0, isOverdue: false };
    }));
    const camp = campaigns.find(c => c.id === targetCampaign);
    addToast(`Reset all ${camp?.brand || camp?.name} creators to setup`, 'info');
  };

  return (
    <div style={styles.wrap}>
      {/* Toggle button */}
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
            <button style={styles.actionBtn} onClick={() => addCreatorsToSetup(3)}>
              <Plus size={14} /> Add 3 to Setup
            </button>
            <button style={styles.actionBtn} onClick={() => addCreatorsToSetup(5)}>
              <Plus size={14} /> Add 5 to Setup
            </button>
            <button style={{ ...styles.actionBtn, ...styles.actionPrimary }} onClick={advanceOne}>
              <Play size={14} /> Advance 1 Creator
            </button>
            <button style={{ ...styles.actionBtn, ...styles.actionPrimary }} onClick={advanceAll}>
              <SkipForward size={14} /> Advance All 1 Stage
            </button>
            <button style={{ ...styles.actionBtn, ...styles.actionDanger }} onClick={resetAll}>
              <RotateCcw size={14} /> Reset All to Setup
            </button>
          </div>

          {/* Stage summary */}
          <div style={styles.summary}>
            {STAGES.filter(s => s.key !== 'denied').map(s => {
              const count = creators.filter(c => c.campaignId === targetCampaign && c.stage === s.key).length;
              if (count === 0) return null;
              return (
                <div key={s.key} style={styles.summaryRow}>
                  <span style={{ ...styles.summaryDot, background: s.color }} />
                  <span style={styles.summaryLabel}>{s.label}</span>
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
