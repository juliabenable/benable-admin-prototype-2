import { useState, useCallback } from 'react';
import { GripVertical, Image, Check, X, ChevronUp, ChevronDown, Eye } from 'lucide-react';
import Modal from './Modal';
import Avatar from './Avatar';
import { useAppState } from '../hooks/useAppState';
import { formatFollowers, formatEngagement } from '../utils/formatters';

export default function DraftPortalForm({ campaignId, campaignName, onClose }) {
  const { creators, setCreators, addToast } = useAppState();

  // Get creators who have accepted the campaign (accepted_campaign and beyond, not denied)
  const eligibleCreators = creators.filter(c =>
    c.campaignId === campaignId &&
    !['not_in_program', 'invited_to_program', 'in_program', 'assigned_to_campaign', 'invited_to_campaign', 'declined_campaign', 'denied'].includes(c.stage)
  );

  const [portalOrder, setPortalOrder] = useState(eligibleCreators.map(c => c.id));
  const [selectedPhotos, setSelectedPhotos] = useState(() => {
    const initial = {};
    eligibleCreators.forEach(c => {
      // Default: first 3 posts selected
      initial[c.id] = c.posts ? c.posts.slice(0, 3).map(p => p.id) : [];
    });
    return initial;
  });
  const [previewCreatorId, setPreviewCreatorId] = useState(null);
  const [savedState, setSavedState] = useState(null);

  const moveCreator = useCallback((index, direction) => {
    setPortalOrder(prev => {
      const next = [...prev];
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= next.length) return prev;
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
  }, []);

  const togglePhoto = useCallback((creatorId, postId) => {
    setSelectedPhotos(prev => {
      const current = prev[creatorId] || [];
      if (current.includes(postId)) {
        return { ...prev, [creatorId]: current.filter(id => id !== postId) };
      }
      return { ...prev, [creatorId]: [...current, postId] };
    });
  }, []);

  const handleSave = () => {
    setSavedState({ order: [...portalOrder], photos: { ...selectedPhotos } });
    addToast(`Portal draft saved for ${campaignName}. ${portalOrder.length} creators in order.`);
  };

  const orderedCreators = portalOrder.map(id => eligibleCreators.find(c => c.id === id)).filter(Boolean);

  return (
    <Modal title={`Draft Portal — ${campaignName}`} onClose={onClose} maxWidth={800}>
      <p style={styles.description}>
        Choose which photos to feature and set the order creators appear in the brand portal.
        Drag or use arrows to reorder.
      </p>

      {orderedCreators.length === 0 ? (
        <div style={styles.emptyState}>
          <p>No creators have accepted this campaign yet.</p>
          <p style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>
            Creators must reach "Accepted Campaign" stage or beyond to appear here.
          </p>
        </div>
      ) : (
        <div style={styles.creatorList}>
          {orderedCreators.map((creator, index) => {
            const posts = creator.posts || [];
            const selected = selectedPhotos[creator.id] || [];
            const isPreview = previewCreatorId === creator.id;

            return (
              <div key={creator.id} style={styles.creatorRow}>
                {/* Order controls */}
                <div style={styles.orderCol}>
                  <span style={styles.orderNum}>{index + 1}</span>
                  <div style={styles.arrows}>
                    <button
                      style={styles.arrowBtn}
                      onClick={() => moveCreator(index, -1)}
                      disabled={index === 0}
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      style={styles.arrowBtn}
                      onClick={() => moveCreator(index, 1)}
                      disabled={index === orderedCreators.length - 1}
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>

                {/* Creator info */}
                <div style={styles.creatorInfo}>
                  <Avatar initials={creator.initials} size={40} photo={creator.photo} />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{creator.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {creator.handle} · {formatFollowers(creator.followers)} · {creator.niche}
                    </div>
                  </div>
                </div>

                {/* Photo selection */}
                <div style={styles.photosCol}>
                  <div style={styles.photoLabel}>
                    <Image size={12} />
                    <span>{selected.length} / {posts.length} photos selected</span>
                  </div>
                  <div style={styles.photoGrid}>
                    {posts.slice(0, 8).map(post => {
                      const isSelected = selected.includes(post.id);
                      return (
                        <div
                          key={post.id}
                          style={{
                            ...styles.photoThumb,
                            outline: isSelected ? '2px solid var(--color-accent)' : '1px solid var(--color-border)',
                            opacity: isSelected ? 1 : 0.5,
                          }}
                          onClick={() => togglePhoto(creator.id, post.id)}
                        >
                          <img src={post.image} alt="" style={styles.photoImg} />
                          {isSelected && (
                            <div style={styles.photoCheck}>
                              <Check size={12} color="#fff" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {orderedCreators.length > 0 && (
        <div style={styles.footer}>
          <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
            {orderedCreators.length} creators · {Object.values(selectedPhotos).reduce((sum, arr) => sum + arr.length, 0)} photos selected
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave}>
              <Check size={16} /> Save Draft
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

const styles = {
  description: {
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    lineHeight: '22px',
    marginBottom: 'var(--space-5)',
  },
  emptyState: {
    textAlign: 'center',
    padding: 'var(--space-8)',
    color: 'var(--color-text-secondary)',
    fontSize: 14,
  },
  creatorList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-3)',
  },
  creatorRow: {
    display: 'flex',
    gap: 'var(--space-4)',
    padding: 'var(--space-4)',
    background: 'var(--color-bg-sidebar)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    alignItems: 'flex-start',
  },
  orderCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    flexShrink: 0,
    width: 40,
  },
  orderNum: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--color-accent)',
    fontFeatureSettings: '"tnum"',
  },
  arrows: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  arrowBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 2,
    color: 'var(--color-text-tertiary)',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  creatorInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    flex: '0 0 200px',
    minWidth: 0,
  },
  photosCol: {
    flex: 1,
    minWidth: 0,
  },
  photoLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: 12,
    color: 'var(--color-text-tertiary)',
    marginBottom: 'var(--space-2)',
  },
  photoGrid: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  photoThumb: {
    width: 52,
    height: 52,
    borderRadius: 'var(--radius-md)',
    overflow: 'hidden',
    cursor: 'pointer',
    position: 'relative',
    transition: 'outline 100ms ease, opacity 100ms ease',
  },
  photoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  photoCheck: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 18,
    height: 18,
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'var(--space-5)',
    paddingTop: 'var(--space-4)',
    borderTop: '1px solid var(--color-border)',
  },
};
