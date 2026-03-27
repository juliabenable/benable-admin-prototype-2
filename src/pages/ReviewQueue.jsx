import { useState, useMemo } from 'react';
import { Check, X, CheckCircle, AlertTriangle, Play, Image, Clipboard, Shield, Sparkles, ExternalLink, BadgeCheck, Send, ChevronDown, ChevronRight, Eye as EyeIcon } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import Avatar, { BrandAvatar } from '../components/Avatar';
import { formatFollowers, formatEngagement, formatDateTime } from '../utils/formatters';
import { CAMPAIGN_BRIEFS } from '../utils/stageConfig';

export default function ReviewQueue() {
  const { creators, campaigns, approveContent, addToast } = useAppState();
  const [expandedId, setExpandedId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  const reviewItems = useMemo(() => {
    return creators.filter(c => c.stage === 'content_submitted' && c.contentSubmission);
  }, [creators]);

  // Group by campaign
  const groupedByCampaign = useMemo(() => {
    const groups = [];
    campaigns.forEach(camp => {
      const items = reviewItems.filter(c => c.campaignId === camp.id);
      if (items.length > 0) {
        groups.push({ campaign: camp, items });
      }
    });
    return groups;
  }, [reviewItems, campaigns]);

  const handleApprove = (creatorId) => {
    approveContent(creatorId);
    setExpandedId(null);
  };

  const handleSendFeedback = (creatorId) => {
    if (!feedbackText.trim()) return;
    addToast(`Feedback sent to ${creators.find(c => c.id === creatorId)?.name}. Creator stays in current stage.`, 'info');
    setFeedbackText('');
    setExpandedId(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">
          Review Queue
          {reviewItems.length > 0 && <span style={styles.countBadge}>{reviewItems.length} pending</span>}
        </h1>
      </div>

      {reviewItems.length === 0 ? (
        <div style={styles.emptyState}>
          <CheckCircle size={40} color="var(--color-success)" />
          <p style={styles.emptyText}>No content to review — nice work!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {groupedByCampaign.map(({ campaign, items }) => (
            <CampaignReviewGroup
              key={campaign.id}
              campaign={campaign}
              items={items}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              feedbackText={feedbackText}
              setFeedbackText={setFeedbackText}
              onApprove={handleApprove}
              onSendFeedback={handleSendFeedback}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignReviewGroup({ campaign, items, expandedId, setExpandedId, feedbackText, setFeedbackText, onApprove, onSendFeedback }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={styles.sectionWrap}>
      {/* Section header */}
      <div style={styles.sectionHeader} onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <BrandAvatar initial={(campaign.brand || campaign.name)[0]} size={28} photo={campaign.logo} />
          <div>
            <span style={styles.sectionBrand}>{campaign.brand || campaign.name}</span>
            <span style={styles.sectionCampaign}>{campaign.name}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={styles.sectionCount}>{items.length} pending</span>
          <span style={{ color: 'var(--color-text-tertiary)', fontSize: 13 }}>{isOpen ? '▾' : '▸'}</span>
        </div>
      </div>

      {isOpen && (
        <div>
          {/* Column headers */}
          <div style={styles.colHeaders}>
            <span style={{ ...styles.colH, flex: '1 1 30%' }}>Creator</span>
            <span style={{ ...styles.colH, flex: '0 0 80px' }}>Type</span>
            <span style={{ ...styles.colH, flex: '0 0 120px' }}>Submitted</span>
            <span style={{ ...styles.colH, flex: '0 0 80px' }}>AI Check</span>
            <span style={{ ...styles.colH, flex: '0 0 100px', textAlign: 'right' }}>Actions</span>
          </div>

          {items.map(creator => {
            const sub = creator.contentSubmission;
            const brief = CAMPAIGN_BRIEFS[creator.campaignId];
            const isExpanded = expandedId === creator.id;

            return (
              <div key={creator.id}>
                {/* Collapsed row */}
                <div style={styles.row}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: '1 1 30%', minWidth: 0 }}>
                    <Avatar initials={creator.initials} size={36} photo={creator.photo} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{creator.name}</span>
                        <BadgeCheck size={13} color="#5B8EC9" />
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{creator.handle}</div>
                    </div>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--color-text-secondary)', flex: '0 0 80px' }}>
                    {sub.type === 'video' ? <Play size={14} /> : <Image size={14} />}
                    {sub.type === 'video' ? 'Video' : 'Photo'}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--color-text-secondary)', flex: '0 0 120px' }}>{formatDateTime(sub.submittedAt)}</span>
                  <span style={{ flex: '0 0 80px' }}>
                    <span style={{
                      ...styles.reviewBadge,
                      background: sub.aiReview === 'ok' ? 'var(--color-success-light)' : 'var(--color-warning-light)',
                      color: sub.aiReview === 'ok' ? 'var(--color-success-text)' : 'var(--color-warning-text)',
                    }}>
                      {sub.aiReview === 'ok' ? 'OK' : 'Flagged'}
                    </span>
                  </span>
                  <div style={{ flex: '0 0 100px', textAlign: 'right' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setExpandedId(isExpanded ? null : creator.id)}>
                      <EyeIcon size={12} /> {isExpanded ? 'Close' : 'Review'}
                    </button>
                  </div>
                </div>

                {/* Expanded review panel */}
                {isExpanded && (
                  <div style={styles.reviewPanel}>
                    {/* Header */}
                    <div style={styles.expandedHeader}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                        <Avatar initials={creator.initials} size={40} photo={creator.photo} />
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: 15 }}>{creator.name}</span>
                            <BadgeCheck size={14} color="#5B8EC9" />
                          </div>
                          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                            {creator.handle} · {creator.city || ''} · {formatFollowers(creator.followers)} · {formatEngagement(creator.engagement)} eng
                          </div>
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => setExpandedId(null)}>
                        <X size={16} /> Close
                      </button>
                    </div>

                    {/* Content: Media + Caption */}
                    <div style={styles.contentArea}>
                      <div>
                        {sub.type === 'video' ? (
                          <div style={styles.videoPlaceholder}><Play size={40} color="#fff" /><span style={{ color: '#fff', fontSize: 13 }}>Video Content</span></div>
                        ) : (
                          <div style={styles.imagePlaceholder}><Image size={40} color="var(--color-text-tertiary)" /><span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>Photo Content</span></div>
                        )}
                      </div>
                      <div>
                        <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Caption / Post Copy</h4>
                        <p style={{ fontSize: 14, lineHeight: '22px', whiteSpace: 'pre-wrap' }}>{sub.caption}</p>
                      </div>
                    </div>

                    {/* Campaign Brief */}
                    {brief && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                        <CollapsibleBrief title="What Creators Will Do" icon={<Clipboard size={16} />}>
                          <div style={styles.briefSection}><span style={styles.briefSectionLabel}>POST</span><p style={styles.briefText}>{brief.whatCreatorsWillDo.post}</p></div>
                          <div style={styles.briefSection}><span style={styles.briefSectionLabel}>BENABLE</span><p style={styles.briefText}>{brief.whatCreatorsWillDo.benable}</p></div>
                          <div style={styles.briefSection}><span style={styles.briefSectionLabel}>CONTENT IDEAS</span><ul style={styles.briefList}>{brief.whatCreatorsWillDo.contentIdeas.map((idea, i) => <li key={i}>{idea}</li>)}</ul></div>
                          <div style={styles.briefSection}><span style={styles.briefSectionLabel}>TALKING POINT SUGGESTIONS</span><ul style={styles.briefList}>{brief.whatCreatorsWillDo.talkingPoints.map((tp, i) => <li key={i}>{tp}</li>)}</ul></div>
                          <div style={styles.briefSection}><span style={styles.briefSectionLabel}>LINK</span><a href={brief.whatCreatorsWillDo.link} style={styles.briefLink} target="_blank" rel="noreferrer">{brief.whatCreatorsWillDo.link} <ExternalLink size={12} /></a></div>
                        </CollapsibleBrief>
                        <CollapsibleBrief title="Brand Guidelines" icon={<Shield size={16} />}>
                          <div style={styles.briefSection}>
                            <span style={{ ...styles.briefSectionLabel, color: '#3D8B5E' }}>DO'S</span>
                            <ul style={{ ...styles.briefList, listStyle: 'none', paddingLeft: 0 }}>
                              {brief.brandGuidelines.dos.map((d, i) => (<li key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4 }}><span style={{ color: '#3D8B5E', fontWeight: 600, flexShrink: 0 }}>✓</span> {d}</li>))}
                            </ul>
                          </div>
                          <div style={styles.briefSection}>
                            <span style={{ ...styles.briefSectionLabel, color: '#C75B4A' }}>DON'TS</span>
                            <ul style={{ ...styles.briefList, listStyle: 'none', paddingLeft: 0 }}>
                              {brief.brandGuidelines.donts.map((d, i) => (<li key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4 }}><span style={{ color: '#C75B4A', fontWeight: 600, flexShrink: 0 }}>✗</span> {d}</li>))}
                            </ul>
                          </div>
                        </CollapsibleBrief>
                      </div>
                    )}

                    {/* AI Warning */}
                    {sub.aiReview === 'flagged' && (
                      <div style={styles.aiWarning}><AlertTriangle size={16} /><span>{sub.aiNotes || 'AI flagged potential issues.'}</span></div>
                    )}

                    {/* Feedback + Actions */}
                    <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Write specific feedback for the creator (required for rejection)..." style={{ width: '100%', minHeight: 60, fontSize: 13, fontFamily: 'inherit', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', outline: 'none', marginBottom: 'var(--space-3)', resize: 'vertical' }} />
                    <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                      <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onSendFeedback(creator.id)} disabled={!feedbackText.trim()}>
                        <Send size={16} /> Send Feedback
                      </button>
                      <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', background: '#3D8B5E', color: '#fff', border: 'none' }} onClick={() => onApprove(creator.id)}>
                        <Check size={16} /> Approve Without Feedback
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CollapsibleBrief({ title, icon, children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={styles.briefCard}>
      <div style={styles.briefHeader} onClick={() => setIsOpen(!isOpen)}>
        {icon}
        <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{title}</span>
        <span style={styles.aiBadge}>AI Suggested</span>
        {isOpen ? <ChevronDown size={16} color="var(--color-text-tertiary)" /> : <ChevronRight size={16} color="var(--color-text-tertiary)" />}
      </div>
      {isOpen && children}
    </div>
  );
}

const styles = {
  countBadge: { fontSize: 14, fontWeight: 500, color: 'var(--color-text-secondary)', marginLeft: 'var(--space-2)' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-10)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', outline: '1px solid var(--color-border)' },
  emptyText: { fontSize: 14, color: 'var(--color-text-secondary)' },

  // Campaign group section
  sectionWrap: {
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
    outline: '1px solid var(--color-border)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 24px',
    cursor: 'pointer',
    background: 'var(--color-bg-sidebar)',
    borderBottom: '1px solid var(--color-border)',
  },
  sectionBrand: {
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    display: 'block',
    lineHeight: '20px',
  },
  sectionCampaign: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    display: 'block',
    lineHeight: '18px',
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-warning-text)',
    background: 'var(--color-warning-light)',
    padding: '2px 10px',
    borderRadius: 'var(--radius-full)',
  },

  // Table
  colHeaders: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 24px',
    gap: 'var(--space-4)',
    borderBottom: '1px solid var(--color-border)',
  },
  colH: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    padding: '12px 24px',
    borderBottom: '1px solid var(--color-border)',
    minHeight: 56,
  },

  // Review panel
  reviewPanel: {
    padding: 'var(--space-5) 24px 24px',
    borderBottom: '1px solid var(--color-border)',
    background: 'var(--color-bg-sidebar)',
  },
  expandedHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-4)',
    paddingBottom: 'var(--space-3)',
    borderBottom: '1px solid var(--color-border)',
  },
  contentArea: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' },
  videoPlaceholder: { background: '#1a1a1a', borderRadius: 'var(--radius-lg)', height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' },
  imagePlaceholder: { background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', outline: '1px solid var(--color-border)', height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' },
  reviewBadge: { fontSize: 12, fontWeight: 500, padding: '2px 10px', borderRadius: 'var(--radius-full)' },

  // Brief cards
  briefCard: { background: 'var(--color-bg-card)', outline: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' },
  briefHeader: { display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-border)', cursor: 'pointer' },
  aiBadge: { fontSize: 10, fontWeight: 600, color: 'var(--color-accent)', background: 'var(--color-accent-light)', padding: '1px 6px', borderRadius: 'var(--radius-full)', textTransform: 'uppercase', letterSpacing: '0.3px' },
  briefSection: { marginBottom: 'var(--space-3)' },
  briefSectionLabel: { display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 },
  briefText: { fontSize: 13, lineHeight: '20px', color: 'var(--color-text-primary)', margin: 0 },
  briefList: { fontSize: 13, lineHeight: '22px', paddingLeft: 16, margin: 0 },
  briefLink: { fontSize: 13, color: 'var(--color-accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 },
  aiWarning: { display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--color-warning-light)', color: 'var(--color-warning-text)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: 13 },
};
