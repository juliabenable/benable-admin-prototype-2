import { useState, useMemo } from 'react';
import { Check, Send, CheckCircle, AlertTriangle, Play, Image, Sparkles } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import Avatar from '../components/Avatar';
import { formatFollowers, formatEngagement, formatDateTime } from '../utils/formatters';
import { STAGE_MAP } from '../utils/stageConfig';

export default function ReviewQueue() {
  const { creators, campaigns, approveContent, addToast } = useAppState();
  const [feedbackText, setFeedbackText] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const reviewItems = useMemo(() => {
    return creators.filter(c => c.stage === 'content_submitted' && c.contentSubmission);
  }, [creators]);

  const handleApprove = (creatorId) => {
    approveContent(creatorId);
    setExpandedId(null);
  };

  const handleSendFeedback = (creatorId) => {
    if (!feedbackText.trim()) return;
    addToast(`Feedback sent to ${creators.find(c => c.id === creatorId)?.name}`, 'info');
    setFeedbackText('');
    setExpandedId(null);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Review Queue</h1>
        <div style={styles.statusCounts}>
          <span style={styles.countPill}>{reviewItems.length} Pending</span>
        </div>
      </div>

      {reviewItems.length === 0 ? (
        <div style={styles.emptyState}>
          <CheckCircle size={32} color="var(--color-success)" />
          <p>No content to review — nice work!</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Creator</th>
                <th>Campaign</th>
                <th>Type</th>
                <th>Submitted</th>
                <th>AI Check</th>
                <th>Caption Preview</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviewItems.map(creator => {
                const sub = creator.contentSubmission;
                const camp = campaigns.find(c => c.id === creator.campaignId);
                const isExpanded = expandedId === creator.id;

                return (
                  <tr key={creator.id} style={sub.aiReview === 'flagged' ? { background: 'var(--color-warning-light)' } : {}}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar initials={creator.initials} size={32} photo={creator.photo} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{creator.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{creator.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {camp?.brand || camp?.name}
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                        {sub.type === 'video' ? <Play size={14} /> : <Image size={14} />}
                        {sub.type === 'video' ? 'Video' : 'Photo'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {formatDateTime(sub.submittedAt)}
                    </td>
                    <td>
                      <span style={{
                        ...styles.aiBadge,
                        background: sub.aiReview === 'ok' ? 'var(--color-success-light)' : 'var(--color-warning-light)',
                        color: sub.aiReview === 'ok' ? 'var(--color-success-text)' : 'var(--color-warning-text)',
                      }}>
                        {sub.aiReview === 'ok' ? 'OK' : 'Flagged'}
                      </span>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-secondary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sub.caption?.substring(0, 60)}...
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ background: '#3D8B5E', border: 'none' }}
                          onClick={() => handleApprove(creator.id)}
                        >
                          <Check size={12} /> Accept
                        </button>
                        <select
                          style={styles.actionSelect}
                          defaultValue=""
                          onChange={e => {
                            if (e.target.value === 'feedback') {
                              setExpandedId(isExpanded ? null : creator.id);
                            }
                            e.target.value = '';
                          }}
                        >
                          <option value="" disabled>Select</option>
                          <option value="feedback">Send Feedback</option>
                        </select>
                        <button
                          className="btn btn-sm"
                          style={{ background: '#ef4444', color: '#fff', border: 'none' }}
                          onClick={() => {
                            addToast(`${creator.name} rejected`, 'danger');
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Expanded feedback area */}
          {expandedId && (() => {
            const creator = reviewItems.find(c => c.id === expandedId);
            if (!creator) return null;
            const sub = creator.contentSubmission;
            return (
              <div style={styles.feedbackPanel}>
                <div style={styles.feedbackHeader}>
                  <strong>Feedback for {creator.name}</strong>
                  <button className="btn btn-ghost btn-sm" onClick={() => setExpandedId(null)}>Close</button>
                </div>

                {/* AI flag warning */}
                {sub.aiReview === 'flagged' && (
                  <div style={styles.aiWarning}>
                    <AlertTriangle size={14} />
                    <span>{sub.aiNotes || 'AI flagged potential issues with caption.'}</span>
                  </div>
                )}

                {/* Caption */}
                <div style={styles.captionBox}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-tertiary)', marginBottom: 4 }}>CAPTION</div>
                  <p style={{ fontSize: 13, lineHeight: '20px', whiteSpace: 'pre-wrap' }}>{sub.caption}</p>
                </div>

                <textarea
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  placeholder="Write feedback for the creator..."
                  style={styles.feedbackTextarea}
                />
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSendFeedback(creator.id)}
                    disabled={!feedbackText.trim()}
                  >
                    <Send size={14} /> Send Feedback
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

const styles = {
  statusCounts: { display: 'flex', gap: 8 },
  countPill: {
    fontSize: 13,
    fontWeight: 500,
    padding: '4px 12px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-warning-light)',
    color: 'var(--color-warning-text)',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
    padding: 'var(--space-10)',
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 14,
  },
  aiBadge: {
    fontSize: 12,
    fontWeight: 600,
    padding: '2px 10px',
    borderRadius: 'var(--radius-full)',
  },
  actionSelect: {
    height: 30,
    fontSize: 13,
    padding: '2px 6px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
  },
  feedbackPanel: {
    padding: 'var(--space-4)',
    borderTop: '2px solid var(--color-accent)',
    background: 'var(--color-bg-sidebar)',
  },
  feedbackHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--space-3)',
  },
  aiWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    background: 'var(--color-warning-light)',
    color: 'var(--color-warning-text)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--space-3)',
    fontSize: 13,
  },
  captionBox: {
    padding: 'var(--space-3)',
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--space-3)',
  },
  feedbackTextarea: {
    width: '100%',
    minHeight: 60,
    fontSize: 13,
    fontFamily: 'inherit',
    padding: 'var(--space-2) var(--space-3)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    outline: 'none',
    marginBottom: 'var(--space-3)',
    resize: 'vertical',
  },
};
