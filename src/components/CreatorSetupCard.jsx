import { useState } from 'react';
import { ChevronDown, ChevronRight, BadgeCheck, Star, Heart, MessageCircle, Send, Sparkles, Plus, X, Check } from 'lucide-react';
import Avatar from './Avatar';
import { formatFollowers, formatEngagement } from '../utils/formatters';

// IG & TikTok SVG icons (small, inline)
function IgIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48z" />
    </svg>
  );
}

const PRE_PROGRAM_STAGES = ['not_in_program', 'invited_to_program'];

export default function CreatorSetupCard({ creator, onInvite, onDeny, isSelected, onToggleSelect, isTop3, onToggleTop3, isExpanded, onToggleExpand }) {
  const isPreProgram = PRE_PROGRAM_STAGES.includes(creator.stage);
  const [selectedPosts, setSelectedPosts] = useState([]);
  const [activePost, setActivePost] = useState(0);
  const [aiReasons, setAiReasons] = useState([...(creator.aiMatchReasons || [])]);
  const [editingIdx, setEditingIdx] = useState(null);

  const posts = creator.posts || [];

  const handlePostSelect = (postId) => {
    setSelectedPosts(prev => {
      if (prev.includes(postId)) {
        return prev.filter(id => id !== postId);
      }
      return [...prev, postId];
    });
  };

  const getPostNumber = (postId) => {
    const idx = selectedPosts.indexOf(postId);
    return idx >= 0 ? idx + 1 : null;
  };

  const handleReasonChange = (idx, value) => {
    setAiReasons(prev => prev.map((r, i) => i === idx ? value : r));
  };

  const handleRemoveReason = (idx) => {
    setAiReasons(prev => prev.filter((_, i) => i !== idx));
    setEditingIdx(null);
  };

  const handleAddReason = () => {
    setAiReasons(prev => [...prev, '']);
    setEditingIdx(aiReasons.length);
  };

  const formatNum = (n) => {
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + 'K';
    return n.toString();
  };

  // Collapsed row
  if (!isExpanded) {
    return (
      <div style={styles.collapsedRow} onClick={onToggleExpand}>
        <div style={styles.collapsedLeft}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => { e.stopPropagation(); onToggleSelect(); }}
            onClick={(e) => e.stopPropagation()}
            style={styles.checkbox}
          />
          <Avatar initials={creator.initials} size={44} photo={creator.photo} />
          <div style={styles.collapsedInfo}>
            <div style={styles.collapsedNameRow}>
              <span style={styles.collapsedName}>{creator.name}</span>
              <BadgeCheck size={14} color="#5B8EC9" />
              {isTop3 && <span style={styles.top3Badge}><Star size={10} fill="#C68A19" color="#C68A19" /> Top 3</span>}
            </div>
            <div style={styles.collapsedMeta}>
              {creator.handle} · {formatFollowers(creator.followers)} followers{!isPreProgram && ` · ${formatEngagement(creator.engagement)} eng`}
            </div>
          </div>
        </div>
        <div style={styles.collapsedRight}>
          <span style={styles.nichePill}>{creator.niche}</span>
          <div style={styles.socialLinks}>
            {creator.igUrl && (
              <a href={creator.igUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={styles.socialIcon} title="Instagram">
                <IgIcon size={16} />
              </a>
            )}
            {creator.tiktokUrl && (
              <a href={creator.tiktokUrl} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()} style={styles.socialIcon} title="TikTok">
                <TikTokIcon size={16} />
              </a>
            )}
          </div>
          <ChevronRight size={18} color="var(--color-text-tertiary)" />
        </div>
      </div>
    );
  }

  // Expanded card
  const currentPost = posts[activePost];

  return (
    <div style={styles.expandedCard}>
      {/* Expanded header */}
      <div style={styles.expandedHeader} onClick={onToggleExpand}>
        <div style={styles.collapsedLeft}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => { e.stopPropagation(); onToggleSelect(); }}
            onClick={(e) => e.stopPropagation()}
            style={styles.checkbox}
          />
          <Avatar initials={creator.initials} size={44} photo={creator.photo} />
          <div style={styles.collapsedInfo}>
            <div style={styles.collapsedNameRow}>
              <span style={styles.collapsedName}>{creator.name}</span>
              <BadgeCheck size={14} color="#5B8EC9" />
            </div>
            <div style={styles.collapsedMeta}>{creator.handle}</div>
          </div>
        </div>
        <ChevronDown size={18} color="var(--color-text-tertiary)" />
      </div>

      {/* Two-column expanded body */}
      <div style={styles.expandedBody}>
        {/* LEFT: Post carousel */}
        <div style={styles.postCol}>
          {/* Main post display */}
          <div style={styles.mainPostWrap}>
            {/* Platform badge */}
            {currentPost && (
              <div style={styles.platformBadge}>
                {currentPost.platform === 'ig' ? <IgIcon size={20} /> : <TikTokIcon size={20} />}
              </div>
            )}

            {/* Main image */}
            {currentPost ? (
              <img src={currentPost.image} alt="Post" style={styles.mainPostImage} />
            ) : (
              <div style={{ ...styles.mainPostImage, background: 'var(--color-bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-tertiary)' }}>No posts</div>
            )}

            {/* Nav arrows */}
            {posts.length > 1 && (
              <>
                <button
                  style={{ ...styles.navArrow, left: 8 }}
                  onClick={() => setActivePost(prev => prev > 0 ? prev - 1 : posts.length - 1)}
                >‹</button>
                <button
                  style={{ ...styles.navArrow, right: 8 }}
                  onClick={() => setActivePost(prev => prev < posts.length - 1 ? prev + 1 : 0)}
                >›</button>
              </>
            )}

            {/* Engagement overlay */}
            {currentPost && (
              <div style={styles.engagementOverlay}>
                <span style={styles.engStat}><Heart size={14} fill="#fff" /> {formatNum(currentPost.likes)}</span>
                <span style={styles.engStat}><MessageCircle size={14} /> {formatNum(currentPost.comments)}</span>
                <span style={styles.engStat}><Send size={14} /> {formatNum(currentPost.shares)}</span>
              </div>
            )}

            {/* Selection number badge */}
            {currentPost && getPostNumber(currentPost.id) && (
              <div style={styles.selectedBadgeLarge}>{getPostNumber(currentPost.id)}</div>
            )}
          </div>

          {/* Carousel dots */}
          <div style={styles.dotsRow}>
            {posts.slice(0, 8).map((_, i) => (
              <button
                key={i}
                style={{ ...styles.dot, ...(i === activePost ? styles.dotActive : {}) }}
                onClick={() => setActivePost(i)}
              />
            ))}
          </div>

          {/* Post thumbnail grid — selectable with order numbers */}
          <div style={styles.thumbGrid}>
            {posts.slice(0, 8).map((post, i) => {
              const num = getPostNumber(post.id);
              const isActive = i === activePost;
              return (
                <div key={post.id} style={styles.thumbWrap}>
                  <img
                    src={post.image}
                    alt={`Post ${i + 1}`}
                    style={{
                      ...styles.thumbImg,
                      outline: num ? '3px solid var(--color-accent)' : isActive ? '2px solid var(--color-text-tertiary)' : '1px solid var(--color-border)',
                    }}
                    onClick={() => { setActivePost(i); handlePostSelect(post.id); }}
                  />
                  {num && <div style={styles.thumbNumber}>{num}</div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: Creator info */}
        <div style={styles.infoCol}>
          {/* Name + social links */}
          <div style={styles.infoHeader}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 20, fontWeight: 700 }}>{creator.name}</span>
                <BadgeCheck size={16} color="#5B8EC9" />
              </div>
              <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>{creator.handle}</div>
            </div>
            <div style={styles.socialLinksLarge}>
              {creator.igUrl && (
                <a href={creator.igUrl} target="_blank" rel="noreferrer" style={styles.socialIconLarge} title="Instagram">
                  <IgIcon size={22} />
                </a>
              )}
              {creator.tiktokUrl && (
                <a href={creator.tiktokUrl} target="_blank" rel="noreferrer" style={styles.socialIconLarge} title="TikTok">
                  <TikTokIcon size={22} />
                </a>
              )}
            </div>
          </div>

          {/* About me */}
          <div style={styles.section}>
            <h4 style={styles.sectionLabel}>About me</h4>
            <p style={styles.bioText}>{creator.bio}</p>
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            <span style={styles.tagPill}>{creator.niche}</span>
            {creator.city && <span style={styles.tagPill}>{creator.city}</span>}
          </div>

          {/* Social Stats + Audience side by side */}
          <div style={styles.statsGrid}>
            <div>
              <h4 style={styles.sectionLabel}>Social Stats</h4>
              <div style={styles.statsTable}>
                <div style={styles.statsTableCell}>
                  <span style={styles.statsTableLabel}>Followers</span>
                  <span style={styles.statsTableValue}>{formatFollowers(creator.followers)}</span>
                </div>
                {!isPreProgram && (
                  <div style={styles.statsTableCell}>
                    <span style={styles.statsTableLabel}>Engagement</span>
                    <span style={styles.statsTableValue}>~{formatEngagement(creator.engagement)}</span>
                  </div>
                )}
              </div>
            </div>
            {isPreProgram ? (
              <div>
                <h4 style={styles.sectionLabel}>Audience</h4>
                <div style={{ fontSize: 13, color: 'var(--color-text-tertiary)', fontStyle: 'italic', padding: '10px 0' }}>
                  Full audience data available after joining Creator Program
                </div>
              </div>
            ) : (
              <div>
                <h4 style={styles.sectionLabel}>Audience</h4>
                <div style={styles.statsTable}>
                  <div style={styles.statsTableCell}>
                    <span style={styles.statsTableLabel}>Location</span>
                    <span style={styles.statsTableValue}>{creator.demographics?.location || '—'}</span>
                  </div>
                  <div style={styles.statsTableCell}>
                    <span style={styles.statsTableLabel}>Gender</span>
                    <span style={styles.statsTableValue}>{creator.demographics?.gender || '—'}</span>
                  </div>
                  <div style={styles.statsTableCell}>
                    <span style={styles.statsTableLabel}>Age Range</span>
                    <span style={styles.statsTableValue}>{creator.demographics?.age || '—'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Match — editable */}
          <div style={styles.aiCard}>
            <div style={styles.aiHeader}>
              <Sparkles size={16} color="#AE94F9" />
              <span style={styles.aiTitle}>Why they're perfect for this campaign</span>
            </div>
            <div style={styles.aiReasons}>
              {aiReasons.map((reason, idx) => (
                <div key={idx} style={styles.aiReasonRow}>
                  <Check size={16} color="#AE94F9" style={{ flexShrink: 0, marginTop: 2 }} />
                  {editingIdx === idx ? (
                    <input
                      type="text"
                      value={reason}
                      onChange={(e) => handleReasonChange(idx, e.target.value)}
                      onBlur={() => setEditingIdx(null)}
                      onKeyDown={(e) => { if (e.key === 'Enter') setEditingIdx(null); }}
                      autoFocus
                      style={styles.aiInput}
                    />
                  ) : (
                    <span
                      style={styles.aiReasonText}
                      onClick={() => setEditingIdx(idx)}
                      title="Click to edit"
                    >
                      {reason || 'Click to add reason...'}
                    </span>
                  )}
                  <button
                    style={styles.aiRemoveBtn}
                    onClick={() => handleRemoveReason(idx)}
                    title="Remove"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button style={styles.aiAddBtn} onClick={handleAddReason}>
                <Plus size={14} /> Add reason
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div style={styles.actionRow}>
            <button
              style={styles.starBtn}
              onClick={onToggleTop3}
              title="Toggle Top 3"
            >
              <Star size={18} fill={isTop3 ? '#C68A19' : 'none'} color={isTop3 ? '#C68A19' : 'var(--color-text-tertiary)'} />
            </button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onInvite(creator.id)}>
              <Plus size={16} /> {isPreProgram ? 'Shortlist' : 'Assign to Campaign'}
            </button>
            <button className="btn btn-ghost" style={{ color: 'var(--color-danger)' }} onClick={() => onDeny(creator.id)}>
              Deny
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  // ─── Collapsed Row ───
  collapsedRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 'var(--space-4)',
    padding: '12px 20px',
    background: 'var(--color-bg-card)',
    outline: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    cursor: 'pointer',
    transition: 'background 120ms ease',
  },
  collapsedLeft: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: 1, minWidth: 0 },
  checkbox: { cursor: 'pointer', accentColor: 'var(--color-accent)', width: 16, height: 16 },
  collapsedInfo: { flex: 1, minWidth: 0 },
  collapsedNameRow: { display: 'flex', alignItems: 'center', gap: 4 },
  collapsedName: { fontSize: 14, fontWeight: 600 },
  collapsedMeta: { fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 1 },
  collapsedRight: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexShrink: 0 },
  nichePill: { fontSize: 12, padding: '2px 10px', borderRadius: 'var(--radius-full)', background: 'var(--color-neutral-light)', color: 'var(--color-text-secondary)', fontWeight: 500 },
  top3Badge: { display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 600, color: '#C68A19', background: '#FFF8EB', padding: '1px 6px', borderRadius: 'var(--radius-full)' },

  // ─── Social Links ───
  socialLinks: { display: 'flex', gap: 6 },
  socialIcon: { color: 'var(--color-text-secondary)', display: 'flex', padding: 4, borderRadius: 'var(--radius-sm)', transition: 'color 120ms' },
  socialLinksLarge: { display: 'flex', gap: 8 },
  socialIconLarge: {
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36, height: 36,
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--color-border)',
    transition: 'color 120ms, background 120ms',
  },

  // ─── Expanded Card ───
  expandedCard: {
    background: 'var(--color-bg-card)',
    outline: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
  },
  expandedHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 20px',
    cursor: 'pointer',
    borderBottom: '1px solid var(--color-border)',
    background: 'var(--color-bg-sidebar)',
  },
  expandedBody: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 0,
    alignItems: 'start',
  },

  // ─── Post Column (Left) ───
  postCol: {
    padding: 'var(--space-5)',
    borderRight: '1px solid var(--color-border)',
  },
  mainPostWrap: {
    position: 'relative',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
    background: '#000',
    aspectRatio: '3/4',
    maxHeight: 360,
    marginBottom: 'var(--space-3)',
  },
  mainPostImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  platformBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    background: 'rgba(255,255,255,0.9)',
    borderRadius: 'var(--radius-full)',
    width: 32,
    height: 32,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#333',
    zIndex: 2,
  },
  navArrow: {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255,255,255,0.8)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    width: 32,
    height: 32,
    fontSize: 20,
    fontWeight: 300,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#333',
    zIndex: 2,
  },
  engagementOverlay: {
    position: 'absolute',
    right: 12,
    bottom: 60,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    alignItems: 'flex-end',
  },
  engStat: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    color: '#fff',
    fontSize: 13,
    fontWeight: 600,
    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
  },
  selectedBadgeLarge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-accent)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 14,
    fontWeight: 700,
    zIndex: 2,
  },
  dotsRow: {
    display: 'flex',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 'var(--space-3)',
  },
  dot: {
    width: 8, height: 8,
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-border)',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
  },
  dotActive: {
    background: 'var(--color-accent)',
    width: 10, height: 10,
  },

  // ─── Thumbnail Grid ───
  thumbGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 6,
  },
  thumbWrap: {
    position: 'relative',
    aspectRatio: '1',
    cursor: 'pointer',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: 'var(--radius-sm)',
    display: 'block',
    cursor: 'pointer',
  },
  thumbNumber: {
    position: 'absolute',
    top: 3,
    right: 3,
    width: 18,
    height: 18,
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-accent)',
    color: '#fff',
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Info Column (Right) ───
  infoCol: {
    padding: 'var(--space-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  infoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 'var(--space-4)',
  },
  section: { marginBottom: 12 },
  sectionLabel: { fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 },
  bioText: { fontSize: 14, lineHeight: '22px', color: 'var(--color-text-secondary)', margin: 0 },
  tagPill: {
    fontSize: 13,
    padding: '4px 14px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    background: 'var(--color-bg-card)',
    fontWeight: 500,
  },

  // ─── Stats Tables ───
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 'var(--space-4)',
    marginBottom: 'var(--space-4)',
  },
  statsTable: {
    display: 'flex',
    background: 'var(--color-bg-sidebar)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  statsTableCell: {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 12px',
    flex: 1,
    borderRight: '1px solid var(--color-border)',
  },
  statsTableLabel: { fontSize: 11, color: 'var(--color-text-tertiary)', fontWeight: 500, marginBottom: 2 },
  statsTableValue: { fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' },

  // ─── AI Match Card ───
  aiCard: {
    background: 'linear-gradient(135deg, #F5F0FF 0%, #EBE4FF 100%)',
    border: '1px solid #D9CCFF',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-4)',
    marginBottom: 'var(--space-4)',
  },
  aiHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 'var(--space-3)',
  },
  aiTitle: { fontSize: 15, fontWeight: 700, color: '#7C5CC5' },
  aiReasons: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  aiReasonRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
  },
  aiReasonText: {
    fontSize: 14,
    lineHeight: '22px',
    color: 'var(--color-text-primary)',
    flex: 1,
    cursor: 'text',
    padding: '1px 0',
    borderBottom: '1px dashed transparent',
  },
  aiInput: {
    flex: 1,
    fontSize: 14,
    lineHeight: '22px',
    padding: '1px 6px',
    border: '1px solid #AE94F9',
    borderRadius: 'var(--radius-sm)',
    outline: 'none',
    fontFamily: 'inherit',
    background: '#fff',
  },
  aiRemoveBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-tertiary)',
    padding: 2,
    display: 'flex',
    borderRadius: 'var(--radius-sm)',
    flexShrink: 0,
    marginTop: 3,
    opacity: 0.5,
  },
  aiAddBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
    color: '#7C5CC5',
    padding: '4px 0',
    fontFamily: 'inherit',
  },

  // ─── Action Row ───
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    paddingTop: 'var(--space-2)',
  },
  starBtn: {
    background: 'none',
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
    padding: 8,
    display: 'flex',
    borderRadius: 'var(--radius-full)',
  },
};
