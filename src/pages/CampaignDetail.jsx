import { useState, useMemo } from 'react';
import { Upload, Send, BadgeCheck, Eye as EyeIcon, MoreHorizontal, AlertTriangle, Clock, AlertCircle, Check, Play, Image, Clipboard, Shield, Sparkles, ExternalLink, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import StatusBadge, { LiveBadge, ArchivedBadge, DaysBadge } from '../components/StatusBadge';
import Avatar, { BrandAvatar } from '../components/Avatar';
import { getUrgencyState, getUrgencyCardStyles } from '../utils/urgency';
import CreatorModal from '../components/CreatorModal';
import NudgeDialog from '../components/NudgeDialog';
import ImportDialog from '../components/ImportDialog';
import CreatorSetupCard from '../components/CreatorSetupCard';
import { STAGES, PHASES, STAGE_MAP, KANBAN_STAGES, CAMPAIGN_BRIEFS } from '../utils/stageConfig';
import { formatFollowers, formatEngagement } from '../utils/formatters';

export default function CampaignDetailContent({ campaignId }) {
  const { creators, campaigns, moveCreatorStage, addToast, logActivity } = useAppState();
  const campaign = campaigns.find(c => c.id === campaignId);
  const campaignCreators = creators.filter(c => c.campaignId === campaignId);

  const [view, setView] = useState('list');
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [nudgeCreator, setNudgeCreator] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [selectedSetup, setSelectedSetup] = useState([]);
  const [top3, setTop3] = useState([]);
  const [expandedSetupId, setExpandedSetupId] = useState(null);

  // Grouped list sections
  const listSections = useMemo(() => {
    const needReview = campaignCreators.filter(c => c.stage === 'content_submitted');
    const needsAttention = campaignCreators.filter(c => c.isOverdue && c.stage !== 'content_submitted');
    const approved = campaignCreators.filter(c => ['content_approved', 'posted'].includes(c.stage) && !c.isOverdue);
    const completed = campaignCreators.filter(c => c.stage === 'completed');
    const denied = campaignCreators.filter(c => c.stage === 'denied');
    const inProgressStages = ['not_in_program', 'invited_to_program', 'in_program', 'invited_to_campaign', 'accepted_campaign', 'assigned_to_campaign', 'products_chosen', 'products_ordered', 'products_received', 'waiting_for_content'];
    const inProgress = campaignCreators.filter(c => inProgressStages.includes(c.stage) && !c.isOverdue);
    return [
      { key: 'review', label: 'Needs Review', color: '#C68A19', bg: '#FFF8EB', items: needReview, defaultOpen: true, actionType: 'review' },
      { key: 'attention', label: 'Needs Your Attention', color: '#ea580c', bg: '#FFF7ED', items: needsAttention, defaultOpen: true, actionType: 'nudge' },
      { key: 'progress', label: 'In Progress', color: '#4A7FC7', bg: '#EBF1FA', items: inProgress, defaultOpen: true, actionType: 'view' },
      { key: 'approved', label: 'Approved — Waiting to Post', color: '#3D8B5E', bg: '#EDF7F0', items: approved, defaultOpen: true, actionType: 'preview' },
      { key: 'completed', label: 'Completed', color: '#9E9B97', bg: '#F5F4F1', items: completed, defaultOpen: false, actionType: 'view' },
      { key: 'denied', label: 'Denied', color: '#C75B4A', bg: '#FDF0EE', items: denied, defaultOpen: false, actionType: 'view' },
    ].filter(s => s.items.length > 0);
  }, [campaignCreators]);

  const setupCreators = campaignCreators.filter(c => c.stage === 'not_in_program' || c.stage === 'in_program');

  if (!campaign) return <div style={{ padding: 32 }}>Campaign not found.</div>;

  return (
    <div style={{ padding: 'var(--space-6) var(--space-8)' }}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <BrandAvatar initial={(campaign.brand || campaign.name)[0]} size={48} photo={campaign.logo} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <h1 style={{ fontSize: 24, fontWeight: 700 }}>{campaign.brand || campaign.name}</h1>
              {campaign.status === 'live' ? <LiveBadge /> : <ArchivedBadge />}
            </div>
            <span style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{campaign.name} · Started {campaign.createdAt}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowImport(true)}>
            <Upload size={14} /> Import Creators
          </button>
          <div style={styles.toggle}>
            {['setup', 'list'].map(v => (
              <button key={v} style={{ ...styles.toggleBtn, ...(view === v ? styles.toggleActive : {}) }} onClick={() => setView(v)}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== SETUP VIEW ===== */}
      {view === 'setup' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600 }}>Creator Setup ({setupCreators.length} creators)</h2>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              {selectedSetup.length > 0 && (
                <>
                  <button className="btn btn-primary btn-sm" onClick={() => {
                    selectedSetup.forEach(id => {
                      const c = campaignCreators.find(cr => cr.id === id);
                      moveCreatorStage(id, c?.stage === 'in_program' ? 'assigned_to_campaign' : 'invited_to_program');
                    });
                    addToast(`${selectedSetup.length} creators shortlisted`);
                    setSelectedSetup([]);
                  }}>Shortlist Selected ({selectedSetup.length})</button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => {
                    selectedSetup.forEach(id => moveCreatorStage(id, 'denied'));
                    addToast(`${selectedSetup.length} creators denied`);
                    setSelectedSetup([]);
                  }}>Mark as Denied</button>
                </>
              )}
            </div>
          </div>
          {setupCreators.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>No creators imported yet.</p>
              <button className="btn btn-primary" onClick={() => setShowImport(true)}>Import Creators</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {setupCreators.map(creator => (
                <CreatorSetupCard
                  key={creator.id}
                  creator={creator}
                  isSelected={selectedSetup.includes(creator.id)}
                  onToggleSelect={() => setSelectedSetup(prev => prev.includes(creator.id) ? prev.filter(id => id !== creator.id) : [...prev, creator.id])}
                  isTop3={top3.includes(creator.id)}
                  onToggleTop3={() => setTop3(prev => prev.includes(creator.id) ? prev.filter(id => id !== creator.id) : [...prev, creator.id])}
                  onInvite={(id) => {
                    const target = creator.stage === 'in_program' ? 'assigned_to_campaign' : 'invited_to_program';
                    moveCreatorStage(id, target);
                    addToast(creator.stage === 'in_program' ? `${creator.name} assigned to campaign` : `${creator.name} invited to Creator Program`);
                  }}
                  onDeny={(id) => { moveCreatorStage(id, 'denied'); addToast(`${creator.name} denied`); }}
                  isExpanded={expandedSetupId === creator.id}
                  onToggleExpand={() => setExpandedSetupId(prev => prev === creator.id ? null : creator.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== LIST VIEW ===== */}
      {view === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {listSections.map(section => (
            <ListSection key={section.key} section={section} onCreatorClick={setSelectedCreator} onNudge={setNudgeCreator} />
          ))}
        </div>
      )}

      {selectedCreator && <CreatorModal creator={selectedCreator} onClose={() => setSelectedCreator(null)} />}
      {nudgeCreator && <NudgeDialog creator={nudgeCreator} campaign={campaign} onClose={() => setNudgeCreator(null)} />}
      {showImport && <ImportDialog campaignId={campaignId} campaignName={`${campaign.brand || campaign.name} — ${campaign.name}`} onClose={() => setShowImport(false)} />}
    </div>
  );
}

/* ─── Grouped List Section (matches Benable table UI) ─── */
function ListSection({ section, onCreatorClick, onNudge }) {
  const { approveContent, rejectContent, addToast, moveCreatorStage } = useAppState();
  const [isOpen, setIsOpen] = useState(section.defaultOpen);
  const [expandedReviewId, setExpandedReviewId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const isAttentionSection = section.key === 'attention';

  return (
    <div style={ls.sectionWrap}>
      {/* Section header band */}
      <div style={{ ...ls.sectionHeader, background: section.bg }} onClick={() => setIsOpen(!isOpen)}>
        <span style={{ ...ls.sectionLabel, color: section.color }}>{section.label}</span>
        <span style={{ marginLeft: 'auto', color: section.color, fontSize: 13, cursor: 'pointer' }}>{isOpen ? '▾' : '▸'}</span>
      </div>

      {isOpen && (
        <div style={ls.tableWrap}>
          {/* Column headers */}
          <div style={ls.colHeaders}>
            <span style={{ ...ls.colH, flex: '1 1 30%' }}>Creator</span>
            <span style={{ ...ls.colH, flex: '0 0 150px' }}>Creator status</span>
            <span style={{ ...ls.colH, flex: '1 1 20%', textAlign: 'right' }}></span>
            <span style={{ ...ls.colH, flex: '0 0 160px', textAlign: 'right' }}>Actions</span>
          </div>

          {/* Rows */}
          {section.items.map(creator => {
            const urgency = getUrgencyState(creator);
            const overdueLeftBorder = urgency.state === 'overdue' ? { boxShadow: 'inset 4px 0 0 var(--overdue-border)' } : {};
            const isReviewExpanded = expandedReviewId === creator.id;
            const sub = creator.contentSubmission;
            const brief = CAMPAIGN_BRIEFS[creator.campaignId];

            return (
            <div key={creator.id}>
              <div style={{ ...ls.row, ...overdueLeftBorder }}>
                {/* Creator */}
                <div style={ls.creatorCell}>
                  <Avatar initials={creator.initials} size={32} photo={creator.photo} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={ls.creatorName} onClick={() => onCreatorClick(creator)}>{creator.name}</span>
                      <BadgeCheck size={14} color="#5B8EC9" />
                      {/* Urgency icon next to name for attention section */}
                      {isAttentionSection && urgency.state === 'overdue' && (
                        <span style={{ ...ls.urgIconInner, background: 'var(--overdue-icon-bg)', color: 'var(--overdue-text)', marginLeft: 2 }}>!</span>
                      )}
                      {isAttentionSection && urgency.state === 'due_soon' && (
                        <span style={{ ...ls.urgIconInner, background: 'var(--due-soon-icon-bg)', color: 'var(--due-soon-text)', marginLeft: 2 }}><Clock size={12} /></span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={ls.creatorHandle}>{creator.handle}</span>
                      {/* Social links for attention section */}
                      {isAttentionSection && creator.igUrl && (
                        <a href={creator.igUrl} target="_blank" rel="noreferrer" style={ls.socialLink} title="Instagram" onClick={e => e.stopPropagation()}>IG</a>
                      )}
                      {isAttentionSection && creator.tiktokUrl && (
                        <a href={creator.tiktokUrl} target="_blank" rel="noreferrer" style={ls.socialLink} title="TikTok" onClick={e => e.stopPropagation()}>TT</a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status */}
                <div style={{ flex: '0 0 150px' }}>
                  <StatusBadge stage={creator.stage} />
                </div>

                {/* Urgency action text (right-aligned) */}
                <div style={{
                  flex: '1 1 20%', textAlign: 'right', fontSize: 11, minWidth: 120,
                  fontWeight: urgency.state === 'overdue' || urgency.state === 'due_soon' ? 600 : 500,
                  color: urgency.state === 'overdue' ? 'var(--overdue-text)' : urgency.state === 'due_soon' ? 'var(--due-soon-text)' : '#888',
                }}>
                  {urgency.actionText}
                </div>

                {/* Actions */}
                <div style={ls.actionsCell}>
                  {section.actionType === 'review' && (
                    <button className="btn btn-primary btn-sm" onClick={() => setExpandedReviewId(isReviewExpanded ? null : creator.id)}>
                      <EyeIcon size={12} /> {isReviewExpanded ? 'Close' : 'Review'}
                    </button>
                  )}
                  {section.actionType === 'nudge' && creator.stage === 'not_in_program' && (
                    <button className="btn btn-primary btn-sm" onClick={() => { moveCreatorStage(creator.id, 'invited_to_program'); addToast(`${creator.name} invited to Creator Program`); }}>
                      <Plus size={12} /> Invite
                    </button>
                  )}
                  {section.actionType === 'nudge' && creator.stage !== 'not_in_program' && (
                    <button className="btn btn-primary btn-sm" onClick={() => onNudge(creator)}>
                      <Send size={12} /> Send Nudge
                    </button>
                  )}
                  {section.actionType === 'preview' && (
                    <button className="btn btn-outlined btn-sm" onClick={() => onCreatorClick(creator)}>
                      <EyeIcon size={12} /> Preview
                    </button>
                  )}
                  {section.actionType === 'view' && creator.stage === 'not_in_program' && (
                    <button className="btn btn-primary btn-sm" onClick={() => { moveCreatorStage(creator.id, 'invited_to_program'); addToast(`${creator.name} invited to Creator Program`); }}>
                      <Plus size={12} /> Invite
                    </button>
                  )}
                  {section.actionType === 'view' && creator.stage !== 'not_in_program' && (
                    <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>{STAGE_MAP[creator.stage]?.helperText}</span>
                  )}
                  {/* Urgency icon on right — only for non-attention sections */}
                  {!isAttentionSection && urgency.state === 'overdue' && (
                    <span style={{ ...ls.urgIconInner, background: 'var(--overdue-icon-bg)', color: 'var(--overdue-text)' }}>!</span>
                  )}
                  {!isAttentionSection && urgency.state === 'due_soon' && (
                    <span style={{ ...ls.urgIconInner, background: 'var(--due-soon-icon-bg)', color: 'var(--due-soon-text)' }}><Clock size={12} /></span>
                  )}
                  <button style={ls.moreBtn}><MoreHorizontal size={16} /></button>
                </div>
              </div>

              {/* Full review expansion — matches Review Queue */}
              {isReviewExpanded && sub && (
                <div style={ls.reviewPanel}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
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
                    <button className="btn btn-ghost btn-sm" onClick={() => setExpandedReviewId(null)}>Close</button>
                  </div>

                  {/* Content: Media + Caption */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                    <div>
                      {sub.type === 'video' ? (
                        <div style={{ background: '#1a1a1a', borderRadius: 'var(--radius-lg)', height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                          <Play size={40} color="#fff" /><span style={{ color: '#fff', fontSize: 13 }}>Video Content</span>
                        </div>
                      ) : (
                        <div style={{ background: 'var(--color-bg-sidebar)', borderRadius: 'var(--radius-lg)', outline: '1px solid var(--color-border)', height: 220, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-2)' }}>
                          <Image size={40} color="var(--color-text-tertiary)" /><span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>Photo Content</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>Caption / Post Copy</h4>
                      <p style={{ fontSize: 14, lineHeight: '22px', whiteSpace: 'pre-wrap' }}>{sub.caption}</p>
                    </div>
                  </div>

                  {/* Campaign Brief Cards */}
                  {brief && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
                      <CollapsibleBrief title="What Creators Will Do" icon={<Clipboard size={16} />}>
                        <div style={{ marginBottom: 12 }}><span style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>POST</span><p style={{ fontSize: 13, lineHeight: '20px', margin: 0 }}>{brief.whatCreatorsWillDo.post}</p></div>
                        <div style={{ marginBottom: 12 }}><span style={{ display: 'block', fontSize: 10, fontWeight: 600, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>CONTENT IDEAS</span><ul style={{ fontSize: 13, lineHeight: '22px', paddingLeft: 16, margin: 0 }}>{brief.whatCreatorsWillDo.contentIdeas.map((idea, i) => <li key={i}>{idea}</li>)}</ul></div>
                      </CollapsibleBrief>
                      <CollapsibleBrief title="Brand Guidelines" icon={<Shield size={16} />}>
                        <div style={{ marginBottom: 12 }}>
                          <span style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#3D8B5E', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>DO'S</span>
                          <ul style={{ fontSize: 13, lineHeight: '22px', listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                            {brief.brandGuidelines.dos.map((d, i) => (<li key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4 }}><span style={{ color: '#3D8B5E', fontWeight: 600, flexShrink: 0 }}>✓</span> {d}</li>))}
                          </ul>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#C75B4A', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>DON'TS</span>
                          <ul style={{ fontSize: 13, lineHeight: '22px', listStyle: 'none', paddingLeft: 0, margin: 0 }}>
                            {brief.brandGuidelines.donts.map((d, i) => (<li key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start', marginBottom: 4 }}><span style={{ color: '#C75B4A', fontWeight: 600, flexShrink: 0 }}>✗</span> {d}</li>))}
                          </ul>
                        </div>
                      </CollapsibleBrief>
                    </div>
                  )}

                  {/* AI Warning */}
                  {sub.aiReview === 'flagged' && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--space-2)', padding: 'var(--space-3)', background: 'var(--color-warning-light)', color: 'var(--color-warning-text)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)', fontSize: 13 }}>
                      <AlertTriangle size={16} /><span>{sub.aiNotes || 'AI flagged potential issues.'}</span>
                    </div>
                  )}

                  {/* Feedback + Actions */}
                  <textarea value={feedbackText} onChange={e => setFeedbackText(e.target.value)} placeholder="Write specific feedback for the creator (required for rejection)..." style={{ width: '100%', minHeight: 60, fontSize: 13, fontFamily: 'inherit', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', outline: 'none', marginBottom: 'var(--space-3)', resize: 'vertical' }} />
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { addToast(`Feedback sent to ${creator.name}. Creator stays in current stage.`, 'info'); setFeedbackText(''); setExpandedReviewId(null); }} disabled={!feedbackText.trim()}>
                      <Send size={16} /> Send Feedback
                    </button>
                    <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center', background: '#3D8B5E', color: '#fff', border: 'none' }} onClick={() => { approveContent(creator.id); setExpandedReviewId(null); }}>
                      <Check size={16} /> Approve Without Feedback
                    </button>
                  </div>
                </div>
              )}
            </div>
          );})
          }
        </div>
      )}
    </div>
  );
}

/* ─── Collapsible Brief Card (used in list review) ─── */
function CollapsibleBrief({ title, icon, children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={{ background: 'var(--color-bg-card)', outline: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: isOpen ? 'var(--space-3)' : 0, paddingBottom: isOpen ? 'var(--space-2)' : 0, borderBottom: isOpen ? '1px solid var(--color-border)' : 'none', cursor: 'pointer' }} onClick={() => setIsOpen(!isOpen)}>
        {icon}
        <span style={{ fontWeight: 600, fontSize: 14, flex: 1 }}>{title}</span>
        {isOpen ? <ChevronDown size={16} color="var(--color-text-tertiary)" /> : <ChevronRight size={16} color="var(--color-text-tertiary)" />}
      </div>
      {isOpen && children}
    </div>
  );
}

/* ─── List Section Styles (matching Benable table UI) ─── */
const ls = {
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
    padding: '12px 24px',
    cursor: 'pointer',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 600,
  },
  tableWrap: {},
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
    padding: '14px 24px',
    borderBottom: '1px solid var(--color-border)',
    minHeight: 60,
    transition: 'background 100ms ease',
  },
  creatorCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    flex: '1 1 30%',
    minWidth: 0,
  },
  creatorName: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
  },
  creatorHandle: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  actionsCell: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    flex: '0 0 160px',
    justifyContent: 'center',
  },
  urgIconInner: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 5, fontSize: 12, fontWeight: 700, flexShrink: 0 },
  socialLink: { fontSize: 11, fontWeight: 600, color: 'var(--color-accent)', textDecoration: 'none', padding: '1px 4px', borderRadius: 'var(--radius-sm)', background: 'var(--color-accent-light)' },
  reviewPanel: { padding: 'var(--space-5) 24px 24px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-bg-sidebar)' },
  moreBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-tertiary)',
    padding: 4,
    display: 'flex',
    borderRadius: 'var(--radius-sm)',
  },
};

/* ─── General Styles ─── */
const styles = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' },
  toggle: { display: 'flex', outline: '1px solid var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' },
  toggleBtn: { background: 'var(--color-bg-card)', border: 'none', padding: '6px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--color-text-secondary)', transition: 'all 150ms ease' },
  toggleActive: { background: 'var(--color-accent)', color: 'var(--color-accent-text)' },
  emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-4)', padding: 'var(--space-10)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', outline: '1px solid var(--color-border)' },
  kanban: { display: 'flex', gap: 'var(--space-4)', overflowX: 'auto', paddingBottom: 'var(--space-4)', alignItems: 'flex-start', minWidth: 0 },
  phaseGroup: { flex: '1 0 auto', minWidth: 220 },
  collapsedPhase: { flex: '0 0 auto', padding: 'var(--space-3)', background: 'var(--color-bg-sidebar)', borderRadius: 'var(--radius-xl)', minWidth: 100, textAlign: 'center' },
  phaseLabel: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '0 0 var(--space-2)' },
  phaseDot: { width: 8, height: 8, borderRadius: 'var(--radius-full)' },
  phaseCount: { fontSize: 11, fontWeight: 600, background: 'var(--color-bg-hover)', borderRadius: 'var(--radius-full)', padding: '0 6px', color: 'var(--color-text-secondary)', lineHeight: '18px' },
  stageColumns: { display: 'flex', gap: 'var(--space-2)', alignItems: 'stretch' },
  column: { flex: '1 0 160px', maxWidth: 300, background: 'var(--color-bg-sidebar)', borderRadius: 'var(--radius-xl)', padding: 'var(--space-3)', outline: '2px solid transparent', transition: 'outline-color 150ms ease', alignSelf: 'stretch', minHeight: 120 },
  emptyCol: { padding: '24px 12px', textAlign: 'center', fontSize: 12, color: 'var(--color-text-tertiary)', border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-md)', opacity: 0.6 },
  columnDrop: { outline: '2px dashed var(--color-accent)' },
  columnReview: { background: 'rgba(239, 68, 68, 0.08)', outline: '2px solid rgba(239, 68, 68, 0.25)' },
  colHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 var(--space-1) var(--space-2)' },
  colTitle: { fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)' },
  colCount: { fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', background: 'var(--color-bg-card)', borderRadius: 'var(--radius-full)', padding: '0 6px', lineHeight: '18px' },
  colCards: { display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' },
  card: { background: '#fff', outline: '1px solid #e8e8f0', borderRadius: 10, padding: '12px 14px', cursor: 'pointer' },
  cardReview: { background: '#FFF3E0', outline: '1px solid #e8e8f0', boxShadow: 'inset 4px 0 0 #F59E0B' },
  urgencyIcon: { flexShrink: 0 },
  urgencyIconInner: { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, borderRadius: 5, fontSize: 12, fontWeight: 700 },
  cardRow1: { display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-1)' },
  cardName: { fontSize: 15, fontWeight: 600, lineHeight: '22px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cardHandle: { fontSize: 13, color: 'var(--color-text-secondary)' },
  nichePill: { display: 'inline-block', fontSize: 12, padding: '2px 10px', borderRadius: 'var(--radius-full)', outline: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', marginBottom: 6, marginTop: 4 },
  cardStats: { display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-2)' },
  statItem: { display: 'flex', flexDirection: 'column' },
  statLabel: { fontSize: 10, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.3px' },
  statValue: { fontSize: 13, fontWeight: 600 },
  cardBottom: { display: 'flex', justifyContent: 'flex-end', alignItems: 'center' },
};
