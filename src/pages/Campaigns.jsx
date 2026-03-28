import { useState, useMemo } from 'react';
import { useAppState } from '../hooks/useAppState';
import Avatar from '../components/Avatar';
import { formatFollowers } from '../utils/formatters';
import { ChevronRight, X, Send, Check, Image, Sparkles, Search, Mail, Phone } from 'lucide-react';

const CAMPAIGN_STAGES = [
  { key: 'invited_to_campaign', label: 'Invited', color: '#92400E', bg: '#FEF3C7' },
  { key: 'accepted_campaign', label: 'Accepted', color: '#166534', bg: '#DCFCE7' },
  { key: 'declined_campaign', label: 'Declined', color: '#991B1B', bg: '#FEE2E2' },
  { key: 'products_ordered', label: 'Products Ordered', color: '#6D28D9', bg: '#EDE9FE' },
  { key: 'awaiting_content', label: 'Awaiting Content', color: '#0E7490', bg: '#CFFAFE' },
  { key: 'awaiting_review', label: 'Awaiting Review', color: '#991B1B', bg: '#FEE2E2' },
  { key: 'feedback_given', label: 'Feedback Given', color: '#1E40AF', bg: '#DBEAFE' },
  { key: 'posted', label: 'Posted', color: '#0E7490', bg: '#CFFAFE' },
  { key: 'completed', label: 'Completed', color: '#6B7280', bg: '#F3F4F6' },
];

const STAGE_MAP = Object.fromEntries(CAMPAIGN_STAGES.map(s => [s.key, s]));
const PROGRAM_STAGES = ['not_in_program', 'invited_to_program', 'in_program'];

export default function Campaigns() {
  const { creators, setCreators, campaigns, addToast } = useAppState();
  const liveCampaigns = campaigns.filter(c => c.status === 'live');
  const [activeTab, setActiveTab] = useState(liveCampaigns[0]?.id || '');
  const activeCampaign = campaigns.find(c => c.id === activeTab);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [feedback, setFeedback] = useState({});

  const allForCampaign = useMemo(() => {
    return creators.filter(c =>
      c.campaignId === activeTab && !PROGRAM_STAGES.includes(c.stage)
    );
  }, [creators, activeTab]);

  const campaignCreators = useMemo(() => {
    let list = [...allForCampaign];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter(c => c.stage === statusFilter);
    }

    return list;
  }, [allForCampaign, searchQuery, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { all: allForCampaign.length };
    allForCampaign.forEach(c => { counts[c.stage] = (counts[c.stage] || 0) + 1; });
    return counts;
  }, [allForCampaign]);

  const changeStage = (creatorId, newStage) => {
    const label = STAGE_MAP[newStage]?.label || newStage;
    setCreators(prev => prev.map(c =>
      c.id === creatorId ? { ...c, stage: newStage, daysInStage: 0, isOverdue: false } : c
    ));
    const creator = creators.find(c => c.id === creatorId);
    addToast(`${creator?.name} → ${label}`);
  };

  const handleApprove = (creatorId) => {
    addToast('Content approved');
    setExpandedId(null);
  };

  const handleSendFeedback = (creatorId) => {
    const text = feedback[creatorId];
    if (!text?.trim()) {
      addToast('Please write feedback before sending', 'danger');
      return;
    }
    addToast('Feedback sent to creator');
    setFeedback(prev => ({ ...prev, [creatorId]: '' }));
    setExpandedId(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Campaigns</h1>
      </div>

      {/* Brand tabs */}
      <div style={styles.tabBar}>
        {liveCampaigns.map(camp => (
          <button
            key={camp.id}
            style={{ ...styles.tab, ...(activeTab === camp.id ? styles.tabActive : styles.tabInactive) }}
            onClick={() => { setActiveTab(camp.id); setExpandedId(null); setStatusFilter('all'); setSearchQuery(''); }}
          >
            {camp.logo && <img src={camp.logo} alt="" style={styles.tabLogo} />}
            {camp.brand || camp.name}
          </button>
        ))}
      </div>

      {/* Status filter pills */}
      <div style={styles.pillRow}>
        <button
          style={{
            ...styles.pill,
            borderColor: statusFilter === 'all' ? '#6B7280' : 'var(--color-border)',
            color: statusFilter === 'all' ? '#374151' : 'var(--color-text-tertiary)',
            fontWeight: statusFilter === 'all' ? 600 : 400,
          }}
          onClick={() => setStatusFilter('all')}
        >
          All ({statusCounts.all || 0})
        </button>
        {CAMPAIGN_STAGES.map(s => {
          const count = statusCounts[s.key] || 0;
          const isActive = statusFilter === s.key;
          return (
            <button
              key={s.key}
              style={{
                ...styles.pill,
                borderColor: s.color,
                borderLeftWidth: 3,
                color: s.color,
                backgroundColor: s.bg,
                fontWeight: isActive ? 700 : 500,
                boxShadow: isActive ? `0 0 0 1px ${s.color}` : 'none',
                opacity: count === 0 ? 0.45 : 1,
              }}
              onClick={() => setStatusFilter(s.key)}
            >
              {s.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Combined card: search + table */}
      <div style={styles.card}>
        {/* Search bar */}
        <div style={styles.filterBar}>
          <div style={styles.searchWrap}>
            <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by name or handle..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <span style={styles.countBadge}>{campaignCreators.length} creators</span>
        </div>

        {/* Column headers */}
        <div style={styles.columnHeader}>
          <div style={{ width: 34, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>Creator</div>
          <div style={{ width: 160, flexShrink: 0 }}>Status</div>
          <div style={{ width: 30, flexShrink: 0, textAlign: 'center' }}>Days</div>
          <div style={{ width: 16, flexShrink: 0 }} />
        </div>

        {/* Rows */}
        {campaignCreators.length === 0 ? (
          <div style={styles.emptyState}>
            No creators in this status for {activeCampaign?.brand || activeCampaign?.name}.
          </div>
        ) : (
          <div>
            {campaignCreators.map(creator => {
              const stageInfo = STAGE_MAP[creator.stage] || { label: creator.stage, color: '#6B7280', bg: '#F3F4F6' };
              const isExpanded = expandedId === creator.id;
              const hasContent = creator.stage === 'awaiting_review' && creator.contentSubmission;

              return (
                <div key={creator.id} style={styles.row}>
                  {/* Main row */}
                  <div
                    style={{ ...styles.mainRow, ...(isExpanded ? styles.mainRowExpanded : {}), cursor: hasContent ? 'pointer' : 'default' }}
                    onClick={() => hasContent && setExpandedId(isExpanded ? null : creator.id)}
                  >
                    <Avatar initials={creator.initials} size={34} photo={creator.photo} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <span style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{creator.name}</span>
                        {creator.igUrl && (
                          <a href={creator.igUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={styles.socialLink} title="Instagram">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="#E1306C" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="#E1306C" strokeWidth="2"/><circle cx="18" cy="6" r="1.5" fill="#E1306C"/></svg>
                          </a>
                        )}
                        {creator.tiktokUrl && (
                          <a href={creator.tiktokUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={styles.socialLink} title="TikTok">
                            <svg width="12" height="14" viewBox="0 0 14 16" fill="none"><path d="M10 0.5C10 2.71 11.79 4.5 14 4.5V7C12.17 7 10.5 6.26 9.25 5.1V11C9.25 13.76 7.01 16 4.25 16C1.49 16 -0.75 13.76 -0.75 11C-0.75 8.24 1.49 6 4.25 6V8.5C2.87 8.5 1.75 9.62 1.75 11C1.75 12.38 2.87 13.5 4.25 13.5C5.63 13.5 6.75 12.38 6.75 11V0.5H10Z" fill="#010101" transform="translate(0.5, 0)"/></svg>
                          </a>
                        )}
                        {creator.email && (
                          <button
                            style={styles.contactBtn}
                            title={creator.email}
                            onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(creator.email); addToast(`Copied ${creator.email}`); }}
                          >
                            <Mail size={12} />
                          </button>
                        )}
                        {creator.phone && (
                          <button
                            style={styles.contactBtn}
                            title={creator.phone}
                            onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(creator.phone); addToast(`Copied ${creator.phone}`); }}
                          >
                            <Phone size={12} />
                          </button>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                        {creator.handle}
                        {creator.followers ? ` · ${formatFollowers(creator.followers)}` : ''}
                      </div>
                    </div>

                    <div style={{ width: 160, flexShrink: 0 }}>
                    <select
                      value={creator.stage}
                      onChange={e => { e.stopPropagation(); changeStage(creator.id, e.target.value); }}
                      onClick={e => e.stopPropagation()}
                      style={{
                        fontSize: 11,
                        fontWeight: 500,
                        padding: '3px 6px',
                        borderRadius: 4,
                        color: stageInfo.color,
                        backgroundColor: stageInfo.bg,
                        border: `1px solid ${stageInfo.bg}`,
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        paddingRight: 18,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='${encodeURIComponent(stageInfo.color)}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 4px center',
                      }}
                    >
                      {CAMPAIGN_STAGES.map(s => (
                        <option key={s.key} value={s.key}>{s.label}</option>
                      ))}
                    </select>
                    </div>

                    <span style={{ fontSize: 12, color: creator.isOverdue ? '#DC2626' : 'var(--color-text-tertiary)', fontWeight: creator.isOverdue ? 600 : 400, width: 30, textAlign: 'center', flexShrink: 0 }}>
                      {creator.daysInStage}d
                    </span>

                    {hasContent ? (
                      <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 150ms', flexShrink: 0 }} />
                    ) : (
                      <div style={{ width: 16, flexShrink: 0 }} />
                    )}
                  </div>

                  {/* Expanded content review panel */}
                  {isExpanded && hasContent && (
                        <div style={styles.expandedPanel}>
                          {/* Creator header */}
                          <div style={styles.reviewHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                              <Avatar initials={creator.initials} size={40} photo={creator.photo} />
                              <div>
                                <div style={{ fontWeight: 600, fontSize: 15 }}>
                                  {creator.name}
                                  {creator.contentSubmission.aiReview === 'ok' && (
                                    <span style={{ color: '#22C55E', marginLeft: 6 }}>✓</span>
                                  )}
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
                                  {creator.handle} · {creator.city} · {formatFollowers(creator.followers)} · {creator.engagement}% eng
                                </div>
                              </div>
                            </div>
                            <button
                              style={styles.closeBtn}
                              onClick={(e) => { e.stopPropagation(); setExpandedId(null); }}
                            >
                              <X size={16} /> Close
                            </button>
                          </div>

                          {/* Content area */}
                          <div style={styles.contentGrid}>
                            <div style={styles.contentPlaceholder}>
                              <Image size={40} color="#9CA3AF" />
                              <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)', marginTop: 8 }}>
                                {creator.contentSubmission.type === 'video' ? 'Video Content' : 'Photo Content'}
                              </span>
                            </div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8 }}>
                                Caption / Post Copy
                              </div>
                              <div style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--color-text-primary)' }}>
                                {creator.contentSubmission.caption}
                              </div>
                            </div>
                          </div>

                          {/* AI flagged notes */}
                          {creator.contentSubmission.aiNotes && (
                            <div style={styles.flaggedNote}>
                              <Sparkles size={14} color="#DC2626" />
                              <span style={{ fontSize: 13, color: '#991B1B' }}>{creator.contentSubmission.aiNotes}</span>
                            </div>
                          )}

                          {/* Feedback textarea */}
                          <textarea
                            placeholder="Write specific feedback for the creator (required for rejection)..."
                            value={feedback[creator.id] || ''}
                            onChange={e => setFeedback(prev => ({ ...prev, [creator.id]: e.target.value }))}
                            style={styles.feedbackInput}
                          />

                          {/* Action buttons */}
                          <div style={styles.actionRow}>
                            <button style={styles.feedbackBtn} onClick={() => handleSendFeedback(creator.id)}>
                              <Send size={16} /> Send Feedback
                            </button>
                            <button style={styles.approveBtn} onClick={() => handleApprove(creator.id)}>
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
    </div>
  );
}

const styles = {
  tabBar: {
    display: 'flex',
    gap: 0,
    borderBottom: '2px solid var(--color-border)',
    marginBottom: 'var(--space-4)',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 500,
    marginBottom: -2,
  },
  tabActive: { color: 'var(--color-accent)', borderBottomColor: 'var(--color-accent)', fontWeight: 600 },
  tabInactive: { color: 'var(--color-text-tertiary)' },
  tabLogo: { width: 22, height: 22, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--color-border)' },
  pillRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 'var(--space-4)',
    flexWrap: 'nowrap',
    overflowX: 'auto',
  },
  pill: {
    padding: '4px 10px',
    fontSize: 11,
    fontFamily: 'inherit',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    background: 'var(--color-bg-card)',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 150ms',
  },
  card: {
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  socialLink: {
    display: 'inline-flex',
    alignItems: 'center',
    opacity: 0.7,
  },
  contactBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
    padding: 0,
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    color: '#94A3B8',
    borderRadius: 3,
    transition: 'color 150ms',
    flexShrink: 0,
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '8px 14px',
    background: 'var(--color-bg-sidebar)',
    borderBottom: '1px solid var(--color-border)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px',
    borderBottom: '1px solid var(--color-border)',
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px 8px 36px',
    fontSize: 13,
    fontFamily: 'inherit',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    outline: 'none',
    background: 'var(--color-bg-page)',
  },
  countBadge: {
    fontSize: 13,
    fontWeight: 500,
    padding: '6px 14px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--color-bg-hover)',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    border: '1px solid var(--color-border)',
  },
  row: {
    borderBottom: '1px solid var(--color-border)',
  },
  mainRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 14px',
  },
  mainRowExpanded: {
    background: '#F8F6FF',
  },
  emptyState: {
    textAlign: 'center',
    padding: 'var(--space-10)',
    color: 'var(--color-text-secondary)',
    fontSize: 14,
  },
  expandedPanel: {
    padding: '0 24px 24px',
    background: '#FAFAFA',
    borderTop: '1px solid var(--color-border)',
    borderLeft: '3px solid #7C3AED',
    marginLeft: 12,
  },
  reviewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 0',
    borderBottom: '1px solid var(--color-border)',
    marginBottom: 20,
  },
  closeBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#DC2626',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'inherit',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
    marginBottom: 20,
  },
  contentPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    minHeight: 240,
  },
  flaggedNote: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: 8,
    marginBottom: 16,
  },
  feedbackInput: {
    width: '100%',
    minHeight: 80,
    padding: 14,
    fontSize: 14,
    fontFamily: 'inherit',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    outline: 'none',
    background: 'var(--color-bg-card)',
    resize: 'vertical',
    marginBottom: 16,
  },
  actionRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
  },
  feedbackBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '14px 24px',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: 'inherit',
    background: '#A5B4FC',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  approveBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '14px 24px',
    fontSize: 15,
    fontWeight: 600,
    fontFamily: 'inherit',
    background: '#2D6A4F',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
};
