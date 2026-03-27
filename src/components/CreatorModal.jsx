import { useState, useRef, useCallback } from 'react';
import { Send, ExternalLink, MessageSquare, Clock, BadgeCheck, Sparkles, Eye, Mail, Phone, Info } from 'lucide-react';
import Modal from './Modal';
import Avatar from './Avatar';
import StatusBadge, { DaysBadge } from './StatusBadge';
import NudgeDialog from './NudgeDialog';
import { useAppState } from '../hooks/useAppState';
import { STAGES } from '../utils/stageConfig';
import { formatFollowers, formatEngagement, formatDateTime } from '../utils/formatters';

export default function CreatorModal({ creator, onClose }) {
  const { campaigns, addNote, moveCreatorStage, addToast, logActivity } = useAppState();
  const [showNudge, setShowNudge] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showStageDropdown, setShowStageDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('campaign');
  const tabRef = useRef(null);
  const switchTab = useCallback((tab) => {
    setActiveTab(tab);
    if (tabRef.current) tabRef.current.scrollIntoView({ behavior: 'instant', block: 'nearest' });
  }, []);

  const campaign = campaigns.find(c => c.id === creator.campaignId);

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    addNote(creator.id, noteText.trim());
    setNoteText('');
  };

  const handleStageChange = (stageKey) => {
    moveCreatorStage(creator.id, stageKey);
    logActivity(`Moved ${creator.name} to ${STAGES.find(s => s.key === stageKey)?.label}`, 'Kate', creator.id);
    addToast(`Moved ${creator.name} to ${STAGES.find(s => s.key === stageKey)?.label}`);
    setShowStageDropdown(false);
  };

  if (showNudge) return <NudgeDialog creator={creator} campaign={campaign} onClose={() => setShowNudge(false)} />;

  const demographics = creator.demographics || { location: '70% USA', gender: '85% Female', age: '24–35' };
  const matchReasons = creator.aiMatchReasons || ['Already recommends 3 clean beauty products', 'High engagement in your niche', 'Audience demographics align with target'];

  return (
    <Modal title="" onClose={onClose} maxWidth={680}>
      {/* Header */}
      <div style={styles.profileHeader}>
        <Avatar initials={creator.initials} size={64} photo={creator.photo} />
        <div style={{ flex: 1 }}>
          <div style={styles.nameRow}>
            <span style={styles.name}>{creator.name}</span>
            <BadgeCheck size={16} color="#5B8EC9" />
            <a href="#" style={styles.viewLink} onClick={e => { e.preventDefault(); addToast('Would open Benable profile', 'info'); }}>
              <ExternalLink size={14} /> View in Benable
            </a>
          </div>
          <div style={styles.handleRow}>{creator.handle} · {creator.city || 'Unknown'}</div>
          {creator.bio && <div style={styles.bio}>{creator.bio}</div>}
          <span style={styles.nichePill}>{creator.niche}</span>
          <div style={styles.contactRow}>
            {creator.email && <a href={`mailto:${creator.email}`} style={styles.contactLink}><Mail size={13} /> {creator.email}</a>}
            {creator.phone && <span style={styles.contactLink}><Phone size={13} /> {creator.phone}</span>}
            <button className="btn btn-outlined btn-sm" style={{ marginLeft: 'auto' }} onClick={() => addToast('Preview would open brand portal view', 'info')}><Eye size={14} /> Preview</button>
          </div>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Tabs */}
      <div ref={tabRef} style={styles.tabBar}>
        <button style={{ ...styles.tab, ...(activeTab === 'campaign' ? styles.tabActive : styles.tabInactive) }} onClick={() => switchTab('campaign')}>Campaign</button>
        <button style={{ ...styles.tab, ...(activeTab === 'social' ? styles.tabActive : styles.tabInactive) }} onClick={() => switchTab('social')}>Social Profile</button>
      </div>

      {/* ═══════ CAMPAIGN TAB ═══════ */}
      {activeTab === 'campaign' && (<div>
      {/* Status Row: Stage / Time / Status / Nudge */}
      <div style={styles.statusBar}>
        <div style={styles.statusItem}>
          <span style={styles.label}>Stage</span>
          <div style={{ position: 'relative' }}>
            <span onClick={() => setShowStageDropdown(!showStageDropdown)} style={{ cursor: 'pointer' }}>
              <StatusBadge stage={creator.stage} />
            </span>
            {showStageDropdown && (
              <>
                <div style={styles.dropdownBackdrop} onClick={() => setShowStageDropdown(false)} />
                <div style={styles.dropdown}>
                  {STAGES.map(s => (
                    <button key={s.key} style={{ ...styles.dropdownItem, fontWeight: s.key === creator.stage ? 600 : 400, background: s.key === creator.stage ? 'var(--color-accent-light)' : 'transparent' }} onClick={() => handleStageChange(s.key)}>{s.label}</button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
        <div style={styles.statusItem}>
          <span style={styles.label}>Time in Stage</span>
          <DaysBadge days={creator.daysInStage} isOverdue={creator.isOverdue} />
        </div>
        <div style={styles.statusItem}>
          <span style={styles.label}>Status</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: creator.isOverdue ? 'var(--color-danger)' : 'var(--color-success)' }}>{creator.isOverdue ? 'Overdue' : 'On Track'}</span>
        </div>
        <div style={{ ...styles.statusItem, justifyContent: 'center' }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowNudge(true)}><Send size={14} /> Send Nudge</button>
        </div>
      </div>

      <div style={styles.divider} />

      {/* Notes */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}><MessageSquare size={16} /> Notes ({creator.notes.length})</h3>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
          <input type="text" value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..." style={{ flex: 1 }} onKeyDown={e => { if (e.key === 'Enter') handleAddNote(); }} />
          <button className="btn btn-primary btn-sm" onClick={handleAddNote} disabled={!noteText.trim()}>Add</button>
        </div>
        {creator.notes.length === 0 ? <p style={styles.emptyText}>No notes yet.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {creator.notes.map(note => (
              <div key={note.id} style={styles.noteItem}>
                <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{note.author}</span>
                  <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{formatDateTime(note.date)}</span>
                </div>
                <p style={{ fontSize: 13, lineHeight: '20px' }}>{note.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={styles.divider} />

      {/* Recent Communications — most recent first */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}><Clock size={16} /> Recent Communications</h3>
        {creator.emails.length === 0 ? <p style={styles.emptyText}>No emails sent yet.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {[...creator.emails].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).map(email => (
              <div key={email.id} style={styles.emailItem}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{email.subject}</span>
                <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>{formatDateTime(email.date)} · {email.type}</span>
              </div>
            ))}
            {creator.emails.length > 5 && <button className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>View All</button>}
          </div>
        )}
      </div>

      <div style={styles.divider} />

      {/* Campaign History */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>&#128218; Campaign History</h3>
        {creator.campaignsCompleted === 0 ? <p style={styles.emptyText}>First campaign — no history.</p> : (
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{creator.campaignsCompleted} previous campaign(s)</p>
        )}
      </div>
      </div>)}

      {/* ═══════ SOCIAL PROFILE TAB ═══════ */}
      {activeTab === 'social' && (<div>
      {/* Stats Row */}
      <div style={styles.statsRow}>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Followers</span>
          <span style={styles.statValue}>{formatFollowers(creator.followers)}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Engagement <Info size={10} color="var(--color-text-tertiary)" /></span>
          <span style={styles.statValue}>~{formatEngagement(creator.engagement)}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Avg. views</span>
          <span style={styles.statValue}>{creator.avgViews ? formatFollowers(creator.avgViews) : '—'}</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statLabel}>Avg. likes</span>
          <span style={styles.statValue}>{creator.avgLikes ? formatFollowers(creator.avgLikes) : '—'}</span>
        </div>
      </div>

      {/* Audience Demographics */}
      <div style={styles.demoRow}>
        <div style={styles.demoBox}><span style={styles.demoLabel}>Top Location</span><span style={styles.demoValue}>{demographics.location}</span></div>
        <div style={styles.demoBox}><span style={styles.demoLabel}>Gender Split</span><span style={styles.demoValue}>{demographics.gender}</span></div>
        <div style={styles.demoBox}><span style={styles.demoLabel}>Age Range</span><span style={styles.demoValue}>{demographics.age}</span></div>
      </div>

      <div style={styles.divider} />

      {/* AI Match */}
      <div style={styles.aiCard}>
        <div style={styles.aiHeader}>
          <Sparkles size={16} color="#C68A19" />
          <span style={styles.aiTitle}>Why they're perfect for this campaign</span>
        </div>
        {matchReasons.map((reason, i) => (
          <div key={i} style={styles.aiItem}><span style={{ color: '#3D8B5E', fontWeight: 600 }}>✓</span> {reason}</div>
        ))}
      </div>
      </div>)}
    </Modal>
  );
}

const styles = {
  profileHeader: { display: 'flex', alignItems: 'flex-start', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' },
  nameRow: { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 },
  name: { fontSize: 20, fontWeight: 600, lineHeight: '28px' },
  viewLink: { fontSize: 13, color: 'var(--color-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' },
  handleRow: { fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 4 },
  bio: { fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: '20px', marginBottom: 6 },
  nichePill: { display: 'inline-block', fontSize: 12, padding: '2px 10px', borderRadius: 'var(--radius-full)', outline: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', marginBottom: 6 },
  contactRow: { display: 'flex', gap: 'var(--space-4)', marginTop: 4, flexWrap: 'wrap', alignItems: 'center' },
  contactLink: { fontSize: 13, color: 'var(--color-accent)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 },
  divider: { height: 1, background: 'var(--color-border)', margin: 'var(--space-4) 0' },
  tabBar: { display: 'flex', gap: 0, borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-4)' },
  tab: { padding: '10px 20px', fontSize: 14, fontWeight: 500, background: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottomWidth: 2, borderBottomStyle: 'solid', borderBottomColor: 'transparent', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 150ms ease', marginBottom: -1 },
  tabActive: { color: 'var(--color-accent)', fontWeight: 600, borderBottomColor: 'var(--color-accent)' },
  tabInactive: { color: 'var(--color-text-tertiary)', borderBottomColor: 'transparent' },
  statusBar: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', alignItems: 'start' },
  statusItem: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 },
  value: { fontSize: 14, fontWeight: 500 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' },
  statBox: { display: 'flex', flexDirection: 'column', gap: 2 },
  statLabel: { fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: 4 },
  statValue: { fontSize: 18, fontWeight: 700, fontFeatureSettings: '"tnum"' },
  demoRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' },
  demoBox: { display: 'flex', flexDirection: 'column', gap: 2, padding: 'var(--space-3)', outline: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' },
  demoLabel: { fontSize: 11, color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.3px' },
  demoValue: { fontSize: 16, fontWeight: 600 },
  aiCard: { background: 'linear-gradient(135deg, #FAFBFF 0%, #F5F0FF 50%, #FFF8F0 100%)', outline: '1px solid #D8D0E8', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)' },
  aiHeader: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--space-3)' },
  aiTitle: { fontSize: 15, fontWeight: 600, color: '#C68A19' },
  aiItem: { fontSize: 14, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, lineHeight: '22px' },
  dropdownBackdrop: { position: 'fixed', inset: 0, zIndex: 19 },
  dropdown: { position: 'absolute', top: '100%', left: 0, marginTop: 4, background: 'var(--color-bg-card)', outline: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)', zIndex: 20, minWidth: 200, maxHeight: 300, overflowY: 'auto' },
  dropdownItem: { display: 'block', width: '100%', padding: 'var(--space-2) var(--space-3)', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' },
  section: { marginBottom: 0 },
  sectionTitle: { fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 'var(--space-3)' },
  noteItem: { padding: 'var(--space-3)', background: 'var(--color-bg-sidebar)', borderRadius: 'var(--radius-md)' },
  emailItem: { padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 2 },
  emptyText: { fontSize: 13, color: 'var(--color-text-tertiary)', fontStyle: 'italic' },
};
