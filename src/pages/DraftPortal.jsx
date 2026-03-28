import { useState, useCallback, useMemo, useRef } from 'react';
import { Check, ChevronRight, Plus, X, Sparkles, Heart, MessageCircle, Share2, Search, Eye as EyeIcon } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import Avatar from '../components/Avatar';
import { formatFollowers } from '../utils/formatters';

// Format large numbers compactly
function fmtNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
}

// Platform label
function platformLabel(post) {
  if (post.platform === 'tiktok') return 'TikTok';
  // For IG, differentiate reel vs post based on type or aspect ratio
  if (post.type === 'reel' || post.type === 'video') return 'IG Reel';
  return 'IG Post';
}

export default function DraftPortal() {
  const { creators, setCreators, campaigns, addToast } = useAppState();
  const liveCampaigns = campaigns.filter(c => c.status === 'live');
  const [activeTab, setActiveTab] = useState(liveCampaigns[0]?.id || '');
  const activeCampaign = campaigns.find(c => c.id === activeTab);

  // Creators in program AND assigned to this campaign, OR invited to this campaign
  const eligibleCreators = useMemo(() => {
    return creators.filter(c => {
      const campaignIds = c.campaignIds || (c.campaignId ? [c.campaignId] : []);
      const inProgram = campaignIds.includes(activeTab) && ['in_program', 'invited_to_program', 'not_in_program'].includes(c.stage);
      const invitedToCampaign = c.campaignId === activeTab && c.stage === 'invited_to_campaign';
      return inProgram || invitedToCampaign;
    });
  }, [creators, activeTab]);

  const [portalOrders, setPortalOrders] = useState({});
  const [selectedPhotos, setSelectedPhotos] = useState({});
  const [expandedId, setExpandedId] = useState(null);
  const [visibility, setVisibility] = useState({}); // default = invisible (must opt-in)
  const [checkedIds, setCheckedIds] = useState(new Set());
  const [customReasons, setCustomReasons] = useState({});
  const [editingReasonIdx, setEditingReasonIdx] = useState(null);
  const [editingReasonText, setEditingReasonText] = useState('');
  const [newReason, setNewReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [visFilter, setVisFilter] = useState('all'); // 'all' | 'visible' | 'hidden'

  // Order management
  const getOrder = useCallback(() => {
    if (portalOrders[activeTab]) return portalOrders[activeTab];
    return eligibleCreators.map(c => c.id);
  }, [portalOrders, activeTab, eligibleCreators]);

  const setOrder = useCallback((newOrder) => {
    setPortalOrders(prev => ({ ...prev, [activeTab]: newOrder }));
  }, [activeTab]);

  // Photo selection — ordered
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

  // Visibility toggle — default invisible, must opt-in (invited creators default visible)
  const isVisible = useCallback((creatorId) => {
    const key = `${activeTab}-${creatorId}`;
    if (visibility[key] !== undefined) return visibility[key];
    // Invited creators are visible by default
    const creator = creators.find(c => c.id === creatorId);
    return creator?.stage === 'invited_to_campaign';
  }, [visibility, activeTab, creators]);

  const toggleVisibility = useCallback((creatorId) => {
    const key = `${activeTab}-${creatorId}`;
    setVisibility(prev => ({ ...prev, [key]: !isVisible(creatorId) }));
  }, [activeTab, isVisible]);

  // Multi-select
  const toggleChecked = useCallback((creatorId) => {
    setCheckedIds(prev => {
      const next = new Set(prev);
      if (next.has(creatorId)) next.delete(creatorId);
      else next.add(creatorId);
      return next;
    });
  }, []);

  // toggleAllChecked will be defined after orderedCreators, use a ref pattern
  const toggleAllCheckedFn = useCallback((filteredIds) => {
    if (checkedIds.size > 0 && [...checkedIds].every(id => filteredIds.includes(id)) && checkedIds.size === filteredIds.length) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(filteredIds));
    }
  }, [checkedIds]);

  const bulkSetVisibility = useCallback((makeVisible) => {
    setVisibility(prev => {
      const next = { ...prev };
      checkedIds.forEach(id => {
        next[`${activeTab}-${id}`] = makeVisible;
      });
      return next;
    });
    setCheckedIds(new Set());
  }, [checkedIds, activeTab]);

  const [editingOrderIdx, setEditingOrderIdx] = useState(null);
  const [editingOrderValue, setEditingOrderValue] = useState('');

  const commitOrder = useCallback((index, newPos) => {
    const num = parseInt(newPos, 10);
    if (isNaN(num) || num < 1) return;
    const order = [...getOrder()];
    const target = Math.min(num, order.length) - 1;
    if (target === index) return;
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

  const updateReason = useCallback((creatorId, index, newText) => {
    const key = `${activeTab}-${creatorId}`;
    const current = [...getReasons(creatorId)];
    current[index] = newText;
    setCustomReasons(prev => ({ ...prev, [key]: current }));
  }, [activeTab, getReasons]);

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

  const startEditReason = (creatorId, index, text) => {
    setEditingReasonIdx({ creatorId, index });
    setEditingReasonText(text);
  };

  const saveEditReason = () => {
    if (editingReasonIdx && editingReasonText.trim()) {
      updateReason(editingReasonIdx.creatorId, editingReasonIdx.index, editingReasonText.trim());
    }
    setEditingReasonIdx(null);
    setEditingReasonText('');
  };

  const allOrderedCreators = getOrder().map(id => eligibleCreators.find(c => c.id === id)).filter(Boolean);

  // Apply search and visibility filter
  const orderedCreators = useMemo(() => {
    let list = allOrderedCreators;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c => c.name.toLowerCase().includes(q) || c.handle.toLowerCase().includes(q));
    }
    if (visFilter === 'visible') {
      list = list.filter(c => isVisible(c.id));
    } else if (visFilter === 'hidden') {
      list = list.filter(c => !isVisible(c.id));
    }
    return list;
  }, [allOrderedCreators, searchQuery, visFilter, isVisible]);

  const bulkRemoveFromCampaign = useCallback(() => {
    const count = checkedIds.size;
    setCreators(prev => prev.map(c => {
      if (!checkedIds.has(c.id)) return c;
      const campaignIds = (c.campaignIds || []).filter(id => id !== activeTab);
      return {
        ...c,
        campaignId: c.campaignId === activeTab ? null : c.campaignId,
        campaignIds,
        stage: c.stage === 'invited_to_campaign' ? 'in_program' : c.stage,
      };
    }));
    setExpandedId(null);
    setCheckedIds(new Set());
    addToast(`${count} creator${count > 1 ? 's' : ''} removed from ${activeCampaign?.brand || activeCampaign?.name}`);
  }, [checkedIds, setCreators, activeTab, activeCampaign, addToast]);

  const handleSave = () => {
    addToast(`Portal draft saved for ${activeCampaign?.brand || activeCampaign?.name}. ${orderedCreators.length} creators.`);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Campaign Pre-selection</h1>
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

      {/* Search / filter / select-all header */}
      <div style={styles.headerBar}>
        <input
          type="checkbox"
          checked={orderedCreators.length > 0 && checkedIds.size === orderedCreators.length}
          onChange={() => toggleAllCheckedFn(orderedCreators.map(c => c.id))}
          style={{ ...styles.checkbox, marginRight: 4 }}
        />
        <div style={styles.searchWrap}>
          <Search size={14} color="#9CA3AF" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search creators..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <select value={visFilter} onChange={e => setVisFilter(e.target.value)} style={styles.visFilterSelect}>
          <option value="all">All</option>
          <option value="visible">Visible to brand</option>
          <option value="hidden">Hidden from brand</option>
        </select>
        <span style={styles.countLabel}>{orderedCreators.length} creators</span>
      </div>

      {/* Column headers */}
      <div style={styles.columnHeader}>
        <div style={{ width: 18, flexShrink: 0 }} />
        <div style={{ width: 40, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>Creator</div>
        <div style={{ width: 60, flexShrink: 0, textAlign: 'center' }}>Photos</div>
        <div style={{ width: 50, flexShrink: 0, textAlign: 'center' }}>Visible</div>
        <div style={{ width: 40, flexShrink: 0, textAlign: 'center' }}>Order</div>
        <div style={{ width: 18, flexShrink: 0 }} />
      </div>

      {orderedCreators.length === 0 ? (
        <div style={styles.emptyState}>
          {eligibleCreators.length === 0
            ? 'No creators assigned to this campaign yet. Go to Creator Program → select creators → assign to campaign.'
            : 'No creators match your search or filter.'}
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
            const demos = creator.demographics || {};

            return (
              <div key={creator.id} style={styles.row}>
                {/* Main row */}
                <div
                  style={{ ...styles.mainRow, ...(isExpanded ? styles.mainRowExpanded : {}) }}
                  onClick={() => setExpandedId(isExpanded ? null : creator.id)}
                >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={checkedIds.has(creator.id)}
                    onChange={() => toggleChecked(creator.id)}
                    onClick={e => e.stopPropagation()}
                    style={styles.checkbox}
                  />

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

                  {/* Invited badge */}
                  {creator.stage === 'invited_to_campaign' && (
                    <span style={styles.invitedBadge}>Invited</span>
                  )}

                  {/* Photo check indicator */}
                  {hasPhotos && (
                    <span style={styles.photoCheck}>
                      <Check size={12} color="#fff" />
                      <span>{selected.length}</span>
                    </span>
                  )}

                  {/* Visibility toggle switch */}
                  <div
                    onClick={e => { e.stopPropagation(); toggleVisibility(creator.id); }}
                    style={{ ...styles.toggleTrack, background: visible ? '#22C55E' : '#D1D5DB' }}
                    title={visible ? 'Visible to brand' : 'Hidden from brand'}
                  >
                    <div style={{ ...styles.toggleThumb, transform: visible ? 'translateX(16px)' : 'translateX(0)' }} />
                  </div>

                  {/* Order input */}
                  <div style={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingOrderIdx === index ? editingOrderValue : index + 1}
                      onFocus={() => { setEditingOrderIdx(index); setEditingOrderValue(String(index + 1)); }}
                      onChange={e => setEditingOrderValue(e.target.value.replace(/[^0-9]/g, ''))}
                      onBlur={() => { commitOrder(index, editingOrderValue); setEditingOrderIdx(null); }}
                      onKeyDown={e => { if (e.key === 'Enter') { e.target.blur(); } }}
                      style={styles.orderInput}
                    />
                  </div>

                  {/* Expand arrow — far right */}
                  <ChevronRight size={18} style={{ color: 'var(--color-text-tertiary)', transform: isExpanded ? 'rotate(90deg)' : 'none', transition: 'transform 150ms', flexShrink: 0 }} />
                </div>

                {/* Expanded drawer */}
                {isExpanded && (
                  <div style={styles.expandedPanel}>
                    <div style={styles.drawerContent}>
                      {/* Left: Post tiles */}
                      <div style={styles.postsSection}>
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
                                {/* Platform label */}
                                <div style={styles.platformLabel}>
                                  {platformLabel(post)}
                                </div>
                                {/* Stats overlay */}
                                <div style={styles.statsOverlay}>
                                  <span style={styles.statItem}><Heart size={10} fill="#fff" color="#fff" /> {fmtNum(post.likes)}</span>
                                  <span style={styles.statItem}><MessageCircle size={10} fill="#fff" color="#fff" /> {fmtNum(post.comments)}</span>
                                  {post.shares && <span style={styles.statItem}><Share2 size={10} color="#fff" /> {fmtNum(post.shares)}</span>}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Right: Creator info card */}
                      <div style={styles.infoSection}>
                        {/* About me */}
                        {creator.bio && (
                          <div style={{ marginBottom: 16 }}>
                            <div style={styles.sectionLabel}>About me</div>
                            <div style={{ fontSize: 13, color: 'var(--color-text-primary)', lineHeight: 1.5 }}>{creator.bio}</div>
                          </div>
                        )}

                        {/* Niche tags */}
                        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
                          <span style={styles.nicheTag}>{creator.niche}</span>
                        </div>

                        {/* Social Stats */}
                        <div style={{ marginBottom: 16 }}>
                          <div style={styles.sectionLabel}>Social Stats</div>
                          <div style={styles.statsRow}>
                            <div style={styles.statBox}>
                              <div style={styles.statBoxLabel}>Followers</div>
                              <div style={styles.statBoxValue}>{formatFollowers(creator.followers)}</div>
                            </div>
                            <div style={styles.statBox}>
                              <div style={styles.statBoxLabel}>Engagement</div>
                              <div style={styles.statBoxValue}>~{creator.engagement}%</div>
                            </div>
                          </div>
                        </div>

                        {/* Audience */}
                        {demos.location && (
                          <div style={{ marginBottom: 16 }}>
                            <div style={styles.sectionLabel}>Audience</div>
                            <div style={styles.statsRow}>
                              <div style={styles.statBox}>
                                <div style={styles.statBoxLabel}>Location</div>
                                <div style={styles.statBoxValue}>{demos.location}</div>
                              </div>
                              <div style={styles.statBox}>
                                <div style={styles.statBoxLabel}>Gender</div>
                                <div style={styles.statBoxValue}>{demos.gender}</div>
                              </div>
                              <div style={styles.statBox}>
                                <div style={styles.statBoxLabel}>Age Range</div>
                                <div style={styles.statBoxValue}>{demos.age}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* AI Reasons — inline editable */}
                        <div style={styles.reasonsCard}>
                          <div style={styles.reasonsHeader}>
                            <Sparkles size={16} color="#7C3AED" />
                            <span style={{ fontWeight: 600, color: '#7C3AED' }}>Why they're perfect for this campaign</span>
                          </div>
                          {reasons.map((reason, ri) => {
                            const isEditingThis = editingReasonIdx?.creatorId === creator.id && editingReasonIdx?.index === ri;
                            return (
                              <div key={ri} style={styles.reasonRow}>
                                <Check size={14} color="#7C3AED" style={{ flexShrink: 0, marginTop: 3 }} />
                                {isEditingThis ? (
                                  <input
                                    autoFocus
                                    type="text"
                                    value={editingReasonText}
                                    onChange={e => setEditingReasonText(e.target.value)}
                                    onBlur={saveEditReason}
                                    onKeyDown={e => { if (e.key === 'Enter') saveEditReason(); if (e.key === 'Escape') setEditingReasonIdx(null); }}
                                    style={styles.reasonEditInput}
                                  />
                                ) : (
                                  <span
                                    style={{ flex: 1, fontSize: 13, cursor: 'text', padding: '2px 0', borderBottom: '1px dashed transparent' }}
                                    onClick={e => { e.stopPropagation(); startEditReason(creator.id, ri, reason); }}
                                    onMouseEnter={e => e.currentTarget.style.borderBottomColor = '#D4CCF0'}
                                    onMouseLeave={e => e.currentTarget.style.borderBottomColor = 'transparent'}
                                    title="Click to edit"
                                  >
                                    {reason}
                                  </span>
                                )}
                                <button style={styles.reasonRemove} onClick={() => removeReason(creator.id, ri)}>×</button>
                              </div>
                            );
                          })}
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
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Bulk action bar */}
      {checkedIds.size > 0 && (
        <div style={styles.bulkBar}>
          <span style={{ fontSize: 13, color: '#fff' }}>{checkedIds.size} selected</span>
          <button style={styles.bulkBtn} onClick={() => { setCheckedIds(new Set()); }}>Deselect All</button>
          <button style={styles.bulkBtnGreen} onClick={() => bulkSetVisibility(true)}>
            <EyeIcon size={14} /> Make Visible
          </button>
          <button style={styles.bulkBtnMuted} onClick={() => bulkSetVisibility(false)}>
            Hide from Brand
          </button>
          <button style={styles.bulkBtnDanger} onClick={bulkRemoveFromCampaign}>
            <X size={14} /> Remove from Campaign
          </button>
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
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '8px 12px',
    background: 'var(--color-bg-sidebar)',
    borderBottom: '1px solid var(--color-border)',
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
  },
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    background: 'var(--color-bg-card)',
    borderBottom: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
  },
  searchInput: {
    width: '100%',
    padding: '6px 10px 6px 30px',
    fontSize: 13,
    fontFamily: 'inherit',
    border: '1px solid var(--color-border)',
    borderRadius: 6,
    outline: 'none',
    background: 'var(--color-bg-page)',
  },
  visFilterSelect: {
    height: 32,
    fontSize: 12,
    padding: '2px 6px',
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    background: 'var(--color-bg-card)',
  },
  countLabel: {
    fontSize: 12,
    color: 'var(--color-text-tertiary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
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
  mainRowExpanded: {
    background: '#F8F6FF',
    borderBottom: 'none',
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
  },
  socialLink: {
    display: 'inline-flex',
    alignItems: 'center',
    opacity: 0.7,
  },
  removeBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    padding: 0,
    border: '1px solid var(--color-border)',
    background: 'var(--color-bg-page)',
    cursor: 'pointer',
    color: '#94A3B8',
    borderRadius: 5,
    flexShrink: 0,
    transition: 'color 150ms, background 150ms, border-color 150ms',
  },
  invitedBadge: {
    fontSize: 11,
    fontWeight: 500,
    padding: '3px 8px',
    borderRadius: 4,
    color: '#92400E',
    backgroundColor: '#FEF3C7',
    whiteSpace: 'nowrap',
    flexShrink: 0,
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
  checkbox: {
    width: 16,
    height: 16,
    cursor: 'pointer',
    flexShrink: 0,
    accentColor: '#7C3AED',
  },
  toggleTrack: {
    width: 36,
    height: 20,
    borderRadius: 10,
    cursor: 'pointer',
    flexShrink: 0,
    position: 'relative',
    transition: 'background 150ms',
  },
  toggleThumb: {
    width: 16,
    height: 16,
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute',
    top: 2,
    left: 2,
    transition: 'transform 150ms',
    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
  },
  expandedPanel: {
    borderLeft: '3px solid #7C3AED',
    marginLeft: 12,
    background: '#FAFAFA',
    borderBottom: '1px solid var(--color-border)',
  },
  drawerContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 24,
    padding: '16px 16px 16px 20px',
  },
  postsSection: {},
  infoSection: {},
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
  platformLabel: {
    position: 'absolute',
    top: 5,
    left: 5,
    fontSize: 9,
    fontWeight: 600,
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    borderRadius: 3,
    padding: '2px 5px',
    lineHeight: 1,
    letterSpacing: '0.2px',
  },
  statsOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    gap: 6,
    padding: '16px 5px 4px',
    background: 'linear-gradient(transparent, rgba(0,0,0,0.55))',
    justifyContent: 'center',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    fontSize: 9,
    color: '#fff',
    fontWeight: 600,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  nicheTag: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--color-text-secondary)',
    padding: '4px 10px',
    background: 'var(--color-bg-page)',
    border: '1px solid var(--color-border)',
    borderRadius: 20,
  },
  statsRow: {
    display: 'flex',
    gap: 8,
  },
  statBox: {
    flex: 1,
    padding: '8px 12px',
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 6,
  },
  statBoxLabel: {
    fontSize: 11,
    color: 'var(--color-text-tertiary)',
    marginBottom: 2,
  },
  statBoxValue: {
    fontSize: 14,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
  },
  reasonsCard: {
    padding: 16,
    background: '#F3F0FF',
    borderRadius: 8,
    border: '1px solid #E9E3FF',
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
  reasonEditInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'inherit',
    padding: '2px 6px',
    border: '1px solid #7C3AED',
    borderRadius: 4,
    outline: 'none',
    background: '#fff',
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
  bulkBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 24px',
    background: '#1E1E2E',
    zIndex: 100,
    justifyContent: 'center',
    boxShadow: '0 -2px 8px rgba(0,0,0,0.15)',
  },
  bulkBtn: {
    background: 'none',
    border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  bulkBtnGreen: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: '#22C55E',
    border: 'none',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  bulkBtnMuted: {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  bulkBtnDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: '#DC2626',
    border: 'none',
    color: '#fff',
    padding: '6px 14px',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
};
