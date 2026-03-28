import { useState, useCallback, useMemo } from 'react';
import { ChevronUp, ChevronDown, Check, Eye, EyeOff, ChevronRight, Plus, X, Sparkles } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import Avatar from '../components/Avatar';
import { formatFollowers } from '../utils/formatters';

export default function DraftPortal() {
  const { creators, campaigns, addToast } = useAppState();
  const liveCampaigns = campaigns.filter(c => c.status === 'live');
  const [activeTab, setActiveTab] = useState(liveCampaigns[0]?.id || '');
  const activeCampaign = campaigns.find(c => c.id === activeTab);

  // Creators in program AND assigned to this campaign
  const eligibleCreators = useMemo(() => {
    return creators.filter(c => {
      const campaignIds = c.campaignIds || (c.campaignId ? [c.campaignId] : []);
      return campaignIds.includes(activeTab) && ['in_program', 'invited_to_program', 'not_in_program'].includes(c.stage);
    });
  }, [creators, activeTab]);

  const [portalOrders, setPortalOrders] = useState({});
  const [selectedPhotos, setSelectedPhotos] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [visibility, setVisibility] = useState({});
  const [editingReasons, setEditingReasons] = useState({});
  const [customReasons, setCustomReasons] = useState({});
  const [newReason, setNewReason] = useState('');

  // Order management
  const getOrder = useCallback(() => {
    if (portalOrders[activeTab]) return portalOrders[activeTab];
    return eligibleCreators.map(c => c.id);
  }, [portalOrders, activeTab, eligibleCreators]);

  const setOrder = useCallback((newOrder) => {
    setPortalOrders(prev => ({ ...prev, [activeTab]: newOrder }));
  }, [activeTab]);

  // Photo selection — ordered (first click = #1, second = #2, etc.)
  const getPhotos = useCallback((creatorId) => {
    const key = `${activeTab}-${creatorId}`;
    return selectedPhotos[key] || [];
  }, [selectedPhotos, activeTab]);

  const togglePhoto = useCallback((creatorId, postId) => {
    const key = `${activeTab}-${creatorId}`;
    setSelectedPhotos(prev => {
      const current = prev[key] || [];
      if (current.includes(postId)) {
        return { ...prev, [key]: current.filter(id => id !== postId) };
      }
      return { ...prev, [key]: [...current, postId] };
    });
  }, [activeTab]);

  // Visibility toggle
  const isVisible = useCallback((creatorId) => {
    const key = `${activeTab}-${creatorId}`;
    return visibility[key] !== false; // default visible
  }, [visibility, activeTab]);

  const toggleVisibility = useCallback((creatorId) => {
    const key = `${activeTab}-${creatorId}`;
    setVisibility(prev => ({ ...prev, [key]: !isVisible(creatorId) }));
  }, [activeTab, isVisible]);

  // Reorder
  const moveCreator = useCallback((index, direction) => {
    const order = [...getOrder()];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= order.length) return;
    [order[index], order[newIndex]] = [order[newIndex], order[index]];
    setOrder(order);
  }, [getOrder, setOrder]);

  const handleOrderInput = useCallback((index, newPos) => {
    const num = parseInt(newPos, 10);
    if (isNaN(num) || num < 1) return;
    const order = [...getOrder()];
    const target = Math.min(num, order.length) - 1;
    const [item] = order.splice(index, 1);
    order.splice(target, 0, item);
    setOrder(order);
  }, [getOrder, setOrder]);

  // AI reasons
  const getReasons = useCallback((creatorId) => {
    const key = `${activeTab}-${creatorId}`;
    if (customReasons[key]) return customReasons[key];
    const creator = creators.find(c => c.id === creatorId);
    return creator?.aiMatchReasons || [];
  }, [customReasons, activeTab, creators]);

  const removeReason = useCallback((creatorId, index) => {
    const key = `${activeTab}-${creatorId}`;
    const current = [...getReasons(creatorId)];
    current.splice(index, 1);
    setCustomReasons(prev => ({ ...prev, [key]: current }));
  }, [activeTab, getReasons]);

  const addReason = useCallback((creatorId) => {
    if (!newReason.trim()) return;
    const key = `${activeTab}-${creatorId}`;
    const current = [...getReasons(creatorId)];
    current.push(newReason.trim());
    setCustomReasons(prev => ({ ...prev, [key]: current }));
    setNewReason('');
  }, [activeTab, getReasons, newReason]);

  const orderedCreators = getOrder().map(id => eligibleCreators.find(c => c.id === id)).filter(Boolean);

  const handleSave = () => {
    addToast(`Portal draft saved for ${activeCampaign?.brand || activeCampaign?.name}. ${orderedCreators.length} creators.`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Draft Portal</h1>
        {orderedCreators.length > 0 && (
          <button className="btn btn-primary" onClick={handleSave}>
            <Check size={16} /> Save Draft
          </button>
        )}
      </div>

      {/* Brand tabs */}
      <div style={styles.tabBar}>
        {liveCampaigns.map(camp => (
          <button
            key={camp.id}
            style={{ ...styles.tab, ...(activeTab === camp.id ? styles.tabActive : styles.tabInactive) }}
            onClick={() => { setActiveTab(camp.id); setExpandedId(null); }}
          >
            {camp.logo && <img src={camp.logo} alt="" style={styles.tabLogo} />}
            {camp.brand || camp.name}
          </button>
        ))}
      </div>

      {/* Info bar */}
      {activeCampaign && (
        <div style={styles.infoBar}>
          <span>{activeCampaign.name}</span>
          <span style={styles.dot}>·</span>
          <span>{orderedCreators.length} creators</span>
          <span style={styles.dot}>·</span>
          <span>{orderedCreators.filter(c => getPhotos(c.id).length > 0).length} with photos selected</span>
        </div>
      )}

      {orderedCreators.length === 0 ? (
        <div style={styles.emptyState}>
          No creators assigned to this campaign yet. Go to Creator Program → select creators → assign to campaign.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {orderedCreators.map((creator, index) => {
            const posts = creator.posts || [];
            const selected = getPhotos(creator.id);
            const visible = isVisible(creator.id);
            const isExpanded = expandedId === creator.id;
            const reasons = getReasons(creator.id);
            const hasPhotos = selected.length > 0;

            return (
              <div key={creator.id} style={{ ...styles.row, opacity: visible ? 1 : 0.5 }}>
                {/* Main row */}
                <div
                  style={styles.mainRow}
                  onClick={() => setExpandedId(isExpanded ? null : creator.id)}
                >
                  {/* Order number input */}
                  <input
                    type="text"
                    value={index + 1}
                    onClick={e => e.stopPropagation()}
                    onChange={e => handleOrderInput(index, e.target.value)}
                    style={styles.orderInput}
                  />

                  {/* Expand arrow */}
                  <ChevronRight size={16} style={{ color: 'var(--color-text-tertiary)', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 150ms', flexShrink: 0 }} />

                  {/* Creator info */}
                  <Avatar initials={creator.initials} size={40} photo={creator.photo} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{creator.name}</span>
                      {/* Social links */}
                      {creator.igUrl && (
                        <a href={creator.igUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={styles.socialLink} title="Instagram">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="#E1306C" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="#E1306C" strokeWidth="2"/><circle cx="18" cy="6" r="1.5" fill="#E1306C"/></svg>
                        </a>
                      )}
                      {creator.tiktokUrl && (
                        <a href={creator.tiktokUrl} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={styles.socialLink} title="TikTok">
                          <svg width="14" height="16" viewBox="0 0 14 16" fill="none"><path d="M10 0.5C10 2.71 11.79 4.5 14 4.5V7C12.17 7 10.5 6.26 9.25 5.1V11C9.25 13.76 7.01 16 4.25 16C1.49 16 -0.75 13.76 -0.75 11C-0.75 8.24 1.49 6 4.25 6V8.5C2.87 8.5 1.75 9.62 1.75 11C1.75 12.38 2.87 13.5 4.25 13.5C5.63 13.5 6.75 12.38 6.75 11V0.5H10Z" fill="#010101" transform="translate(0.5, 0)"/></svg>
                        </a>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                      {creator.handle} · {formatFollowers(creator.followers)}
                    </div>
                  </div>

                  {/* Photo check indicator */}
                  {hasPhotos && (
                    <span style={styles.photoCheck}>
                      <Check size={12} color="#fff" />
                      <span>{selected.length}</span>
                    </span>
                  )}

                  {/* Visibility toggle */}
                  <button
                    style={styles.visBtn}
                    onClick={e => { e.stopPropagation(); toggleVisibility(creator.id); }}
                    title={visible ? 'Hide from portal' : 'Show in portal'}
                  >
                    {visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>

                  {/* Move buttons */}
                  <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
                    <button style={styles.moveBtn} onClick={() => moveCreator(index, -1)} disabled={index === 0}><ChevronUp size={14} /></button>
                    <button style={styles.moveBtn} onClick={() => moveCreator(index, 1)} disabled={index === orderedCreators.length - 1}><ChevronDown size={14} /></button>
                  </div>
                </div>

                {/* Expanded panel */}
                {isExpanded && (
                  <div style={styles.expandedPanel}>
                    <div style={styles.expandedGrid}>
                      {/* Left: Post tiles */}
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-secondary)' }}>
                          Select photos ({selected.length} selected)
                        </div>
                        <div style={styles.postGrid}>
                          {posts.slice(0, 9).map(post => {
                            const selIndex = selected.indexOf(post.id);
                            const isSelected = selIndex >= 0;
                            return (
                              <div
                                key={post.id}
                                style={{
                                  ...styles.postTile,
                                  outline: isSelected ? '3px solid #7C3AED' : '1px solid var(--color-border)',
                                }}
                                onClick={() => togglePhoto(creator.id, post.id)}
                              >
                                <img src={post.image} alt="" style={styles.postImg} />
                                {isSelected && (
                                  <div style={styles.postBadge}>{selIndex + 1}</div>
                                )}
                                {/* Platform icon */}
                                <div style={styles.platformIcon}>
                                  {post.platform === 'tiktok' ? '▶' : '📷'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: AI reasons + info */}
                      <div>
                        <div style={styles.reasonsCard}>
                          <div style={styles.reasonsHeader}>
                            <Sparkles size={16} color="#7C3AED" />
                            <span style={{ fontWeight: 600, color: '#7C3AED' }}>Why they're perfect for this campaign</span>
                          </div>
                          {reasons.map((reason, ri) => (
                            <div key={ri} style={styles.reasonRow}>
                              <Check size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: 1 }} />
                              <span style={{ flex: 1, fontSize: 13 }}>{reason}</span>
                              <button style={styles.reasonRemove} onClick={() => removeReason(creator.id, ri)}>×</button>
                            </div>
                          ))}
                          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                            <input
                              type="text"
                              value={newReason}
                              onChange={e => setNewReason(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && addReason(creator.id)}
                              placeholder="Add reason"
                              style={styles.reasonInput}
                            />
                            <button
                              style={styles.reasonAddBtn}
                              onClick={() => addReason(creator.id)}
                              disabled={!newReason.trim()}
                            >
                              <Plus size={14} /> Add
                            </button>
                          </div>
                        </div>

                        {/* Social stats */}
                        <div style={styles.statsRow}>
                          <div style={styles.statBox}>
                            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Followers</div>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>{formatFollowers(creator.followers)}</div>
                          </div>
                          <div style={styles.statBox}>
                            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Engagement</div>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>{creator.engagement}%</div>
                          </div>
                          <div style={styles.statBox}>
                            <div style={{ fontSize: 11, color: 'var(--color-text-tertiary)' }}>Niche</div>
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{creator.niche}</div>
                          </div>
                        </div>
                      </div>
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
  infoBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 16px', background: 'var(--color-bg-sidebar)', borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--space-4)', fontSize: 13, color: 'var(--color-text-secondary)',
  },
  dot: { color: 'var(--color-text-tertiary)' },
  emptyState: {
    textAlign: 'center', padding: 'var(--space-10)', color: 'var(--color-text-secondary)',
    fontSize: 14, background: 'var(--color-bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)',
  },
  row: {
    background: 'var(--color-bg-card)',
    borderBottom: '1px solid var(--color-border)',
  },
  mainRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    cursor: 'pointer',
  },
  orderInput: {
    width: 32,
    height: 28,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: 700,
    fontFamily: 'inherit',
    border: '1px solid var(--color-border)',
    borderRadius: 4,
    outline: 'none',
    color: 'var(--color-accent)',
    background: 'var(--color-bg-page)',
    flexShrink: 0,
  },
  socialLink: {
    display: 'inline-flex',
    alignItems: 'center',
    opacity: 0.7,
  },
  photoCheck: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '2px 8px',
    borderRadius: 12,
    background: '#22C55E',
    color: '#fff',
    fontSize: 11,
    fontWeight: 600,
    flexShrink: 0,
  },
  visBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-tertiary)',
    padding: 4,
    flexShrink: 0,
  },
  moveBtn: {
    background: 'none',
    border: '1px solid var(--color-border)',
    borderRadius: 3,
    cursor: 'pointer',
    padding: 2,
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
  },
  expandedPanel: {
    padding: '0 12px 16px 54px',
    borderTop: '1px solid var(--color-border)',
    background: '#FAFAFA',
  },
  expandedGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 20,
    paddingTop: 16,
  },
  postGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  postTile: {
    aspectRatio: '4/5',
    borderRadius: 6,
    overflow: 'hidden',
    cursor: 'pointer',
    position: 'relative',
    background: '#eee',
  },
  postImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  postBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: '50%',
    background: '#7C3AED',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 700,
  },
  platformIcon: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    fontSize: 12,
    background: 'rgba(255,255,255,0.85)',
    borderRadius: 4,
    padding: '1px 4px',
    lineHeight: 1,
  },
  reasonsCard: {
    padding: 16,
    background: '#F3F0FF',
    borderRadius: 8,
    border: '1px solid #E9E3FF',
    marginBottom: 12,
  },
  reasonsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
    fontSize: 14,
  },
  reasonRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    padding: '4px 0',
  },
  reasonRemove: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-tertiary)',
    fontSize: 16,
    padding: 0,
    lineHeight: 1,
    flexShrink: 0,
  },
  reasonInput: {
    flex: 1,
    padding: '4px 8px',
    fontSize: 12,
    fontFamily: 'inherit',
    border: '1px solid #D4CCF0',
    borderRadius: 4,
    outline: 'none',
    background: '#fff',
  },
  reasonAddBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 3,
    padding: '4px 10px',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'inherit',
    background: '#7C3AED',
    color: '#fff',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  statsRow: {
    display: 'flex',
    gap: 8,
  },
  statBox: {
    flex: 1,
    padding: '10px 12px',
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 6,
  },
};
