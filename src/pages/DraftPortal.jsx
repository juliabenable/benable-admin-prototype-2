import { useState, useCallback, useMemo } from 'react';
import { ChevronUp, ChevronDown, Check, Image } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import Avatar from '../components/Avatar';
import { formatFollowers } from '../utils/formatters';
import { STAGE_MAP } from '../utils/stageConfig';

export default function DraftPortal() {
  const { creators, campaigns, addToast } = useAppState();
  const liveCampaigns = campaigns.filter(c => c.status === 'live');
  const [activeTab, setActiveTab] = useState(liveCampaigns[0]?.id || '');

  const activeCampaign = campaigns.find(c => c.id === activeTab);

  // Creators who accepted (past invited stages, not denied)
  const eligibleCreators = useMemo(() => {
    return creators.filter(c =>
      c.campaignId === activeTab &&
      !['not_in_program', 'invited_to_program', 'in_program', 'assigned_to_campaign', 'invited_to_campaign', 'declined_campaign', 'denied'].includes(c.stage)
    );
  }, [creators, activeTab]);

  const [portalOrders, setPortalOrders] = useState({});
  const [selectedPhotos, setSelectedPhotos] = useState({});

  // Get or init order for current campaign
  const getOrder = useCallback(() => {
    if (portalOrders[activeTab]) return portalOrders[activeTab];
    return eligibleCreators.map(c => c.id);
  }, [portalOrders, activeTab, eligibleCreators]);

  const setOrder = useCallback((newOrder) => {
    setPortalOrders(prev => ({ ...prev, [activeTab]: newOrder }));
  }, [activeTab]);

  const getPhotos = useCallback((creatorId) => {
    const key = `${activeTab}-${creatorId}`;
    if (selectedPhotos[key]) return selectedPhotos[key];
    const creator = creators.find(c => c.id === creatorId);
    return creator?.posts ? creator.posts.slice(0, 3).map(p => p.id) : [];
  }, [selectedPhotos, activeTab, creators]);

  const togglePhoto = useCallback((creatorId, postId) => {
    const key = `${activeTab}-${creatorId}`;
    setSelectedPhotos(prev => {
      const current = prev[key] || getPhotos(creatorId);
      if (current.includes(postId)) {
        return { ...prev, [key]: current.filter(id => id !== postId) };
      }
      return { ...prev, [key]: [...current, postId] };
    });
  }, [activeTab, getPhotos]);

  const moveCreator = useCallback((index, direction) => {
    const order = [...getOrder()];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= order.length) return;
    [order[index], order[newIndex]] = [order[newIndex], order[index]];
    setOrder(order);
  }, [getOrder, setOrder]);

  const orderedCreators = getOrder().map(id => eligibleCreators.find(c => c.id === id)).filter(Boolean);

  const handleSave = () => {
    addToast(`Portal draft saved for ${activeCampaign?.brand || activeCampaign?.name}. ${orderedCreators.length} creators in order.`);
  };

  const totalPhotos = orderedCreators.reduce((sum, c) => sum + getPhotos(c.id).length, 0);

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
            style={{
              ...styles.tab,
              ...(activeTab === camp.id ? styles.tabActive : styles.tabInactive),
            }}
            onClick={() => setActiveTab(camp.id)}
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
          <span>{orderedCreators.length} creators accepted</span>
          <span style={styles.dot}>·</span>
          <span>{totalPhotos} photos selected</span>
        </div>
      )}

      {orderedCreators.length === 0 ? (
        <div style={styles.emptyState}>
          No creators have accepted this campaign yet. Creators must reach "Accepted Campaign" stage or beyond to appear here.
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 60 }}>Order</th>
                <th>Creator</th>
                <th>Stage</th>
                <th>Photos</th>
                <th style={{ width: 80 }}>Move</th>
              </tr>
            </thead>
            <tbody>
              {orderedCreators.map((creator, index) => {
                const posts = creator.posts || [];
                const selected = getPhotos(creator.id);
                const stage = STAGE_MAP[creator.stage];

                return (
                  <tr key={creator.id}>
                    <td style={{ textAlign: 'center', fontWeight: 700, fontSize: 16, color: 'var(--color-accent)' }}>
                      {index + 1}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar initials={creator.initials} size={36} photo={creator.photo} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{creator.name}</div>
                          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                            {creator.handle} · {formatFollowers(creator.followers)} · {creator.niche}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ ...styles.stagePill, color: stage?.color, background: stage?.bg }}>
                        {stage?.label || creator.stage}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'nowrap' }}>
                        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginRight: 4 }}>
                          {selected.length}/{posts.length}
                        </span>
                        {posts.slice(0, 8).map(post => {
                          const isSelected = selected.includes(post.id);
                          return (
                            <div
                              key={post.id}
                              style={{
                                ...styles.thumb,
                                outline: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                                opacity: isSelected ? 1 : 0.4,
                              }}
                              onClick={() => togglePhoto(creator.id, post.id)}
                            >
                              <img src={post.image} alt="" style={styles.thumbImg} />
                              {isSelected && (
                                <div style={styles.thumbCheck}>
                                  <Check size={10} color="#fff" />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button
                          style={styles.moveBtn}
                          onClick={() => moveCreator(index, -1)}
                          disabled={index === 0}
                          title="Move up"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          style={styles.moveBtn}
                          onClick={() => moveCreator(index, 1)}
                          disabled={index === orderedCreators.length - 1}
                          title="Move down"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
  tabActive: {
    color: 'var(--color-accent)',
    borderBottomColor: 'var(--color-accent)',
    fontWeight: 600,
  },
  tabInactive: {
    color: 'var(--color-text-tertiary)',
  },
  tabLogo: {
    width: 22,
    height: 22,
    borderRadius: 'var(--radius-full)',
    objectFit: 'cover',
    border: '1px solid var(--color-border)',
  },
  infoBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    background: 'var(--color-bg-sidebar)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--space-4)',
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  dot: { color: 'var(--color-text-tertiary)' },
  emptyState: {
    textAlign: 'center',
    padding: 'var(--space-10)',
    color: 'var(--color-text-secondary)',
    fontSize: 14,
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
  },
  stagePill: {
    fontSize: 12,
    fontWeight: 500,
    padding: '2px 10px',
    borderRadius: 'var(--radius-full)',
    whiteSpace: 'nowrap',
  },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 4,
    overflow: 'hidden',
    cursor: 'pointer',
    position: 'relative',
    flexShrink: 0,
  },
  thumbImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  thumbCheck: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moveBtn: {
    background: 'none',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    padding: 2,
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
  },
};
