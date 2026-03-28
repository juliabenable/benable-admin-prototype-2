import { useState, useMemo, useRef } from 'react';
import { Upload, Check, Send, Plus, X, Search, Mail } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import Avatar from '../components/Avatar';
import { formatFollowers } from '../utils/formatters';

const PROGRAM_STAGES = [
  { key: 'not_in_program', label: 'Not in Creator Program', color: '#6B7280', bg: '#F3F4F6' },
  { key: 'invited_to_program', label: 'Invited to Creator Program', color: '#92400E', bg: '#FEF3C7' },
  { key: 'in_program', label: 'In Creator Program', color: '#166534', bg: '#DCFCE7' },
];

const STAGE_LABELS = Object.fromEntries(PROGRAM_STAGES.map(s => [s.key, s]));

const PLATFORM_ICONS = {
  ig: { label: 'Instagram', icon: '📸' },
  tiktok: { label: 'TikTok', icon: '🎵' },
  both: { label: 'IG + TikTok', icon: '📸🎵' },
  youtube: { label: 'YouTube', icon: '▶️' },
};

function generateBenableId() {
  return Math.floor(Math.random() * 999000 + 1000);
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = vals[i] || ''; });

    const name = row.name || row.creator || `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unknown';
    const handle = row.handle || row.username || row.instagram || '';
    const followers = parseInt(row.followers || '0', 10);
    const niche = row.niche || row.category || '';
    const email = row.email || '';
    const city = row.city || row.location || '';
    const platform = row.platform || 'ig';
    const benableId = parseInt(row.benable_id || row['benable id'] || '0', 10) || generateBenableId();

    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return { name, handle: handle.startsWith('@') ? handle : `@${handle}`, followers, niche, email, city, platform, initials, benableId };
  });
}

export default function CreatorProgram() {
  const { creators, setCreators, campaigns, addToast } = useAppState();
  const fileRef = useRef(null);
  const [selected, setSelected] = useState(new Set());
  const [assignCampaign, setAssignCampaign] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', benableId: '' });
  const liveCampaigns = campaigns.filter(c => c.status === 'live');

  // Only show creators in program-level stages
  const programCreators = useMemo(() => {
    let list = creators.filter(c => ['not_in_program', 'invited_to_program', 'in_program'].includes(c.stage));

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.handle.toLowerCase().includes(q) ||
        (c.benableId && String(c.benableId).includes(q))
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter(c => c.stage === statusFilter);
    }

    if (sortBy === 'az') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'za') {
      list = [...list].sort((a, b) => b.name.localeCompare(a.name));
    }

    return list;
  }, [creators, searchQuery, statusFilter, sortBy]);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const parsed = parseCSV(ev.target.result);
      if (parsed.length === 0) {
        addToast('No valid rows found in CSV', 'danger');
        return;
      }
      const newCreators = parsed.map((c, i) => ({
        ...c,
        id: `c_prog_${Date.now()}_${i}`,
        campaignId: null,
        stage: 'not_in_program',
        daysInStage: 0,
        isOverdue: false,
        notes: [],
        emails: [],
        posts: [],
        campaignsCompleted: 0,
        usedBefore: false,
        shopMyLtk: 'unknown',
        flaggedBefore: false,
        dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        engagement: (Math.random() * 4 + 1).toFixed(1),
        avgViews: Math.floor(Math.random() * 30000) + 5000,
        avgLikes: Math.floor(Math.random() * 5000) + 500,
        photo: null,
      }));
      setCreators(prev => [...prev, ...newCreators]);
      addToast(`${newCreators.length} creators uploaded`);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddCreator = () => {
    if (!addForm.name.trim()) return;
    const initials = addForm.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const newCreator = {
      id: `c_add_${Date.now()}`,
      name: addForm.name.trim(),
      handle: '',
      benableId: addForm.benableId.trim() || generateBenableId(),
      followers: 0,
      niche: '',
      email: '',
      city: '',
      platform: 'ig',
      initials,
      campaignId: null,
      stage: 'not_in_program',
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      daysInStage: 0,
      isOverdue: false,
      notes: [],
      emails: [],
      posts: [],
      campaignsCompleted: 0,
      usedBefore: false,
      shopMyLtk: 'unknown',
      flaggedBefore: false,
      engagement: 0,
      avgViews: 0,
      avgLikes: 0,
      photo: null,
    };
    setCreators(prev => [...prev, newCreator]);
    addToast(`${addForm.name} added`);
    setAddForm({ name: '', benableId: '' });
    setShowAddModal(false);
  };

  const toggleSelect = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === programCreators.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(programCreators.map(c => c.id)));
    }
  };

  const bulkChangeStatus = (newStage) => {
    if (selected.size === 0) return;
    const label = STAGE_LABELS[newStage]?.label || newStage;
    setCreators(prev => prev.map(c =>
      selected.has(c.id) ? { ...c, stage: newStage, daysInStage: 0, isOverdue: false } : c
    ));
    addToast(`${selected.size} creators → ${label}`);
    setSelected(new Set());
  };

  const changeOneStatus = (creatorId, newStage) => {
    setCreators(prev => prev.map(c =>
      c.id === creatorId ? { ...c, stage: newStage, daysInStage: 0, isOverdue: false } : c
    ));
    const creator = creators.find(c => c.id === creatorId);
    addToast(`${creator?.name} → ${STAGE_LABELS[newStage]?.label}`);
  };

  const bulkAssignCampaign = () => {
    if (selected.size === 0 || !assignCampaign) return;
    const camp = campaigns.find(c => c.id === assignCampaign);
    setCreators(prev => prev.map(c => {
      if (!selected.has(c.id)) return c;
      const existing = c.campaignIds || (c.campaignId ? [c.campaignId] : []);
      if (existing.includes(assignCampaign)) return c;
      return { ...c, campaignIds: [...existing, assignCampaign], campaignId: assignCampaign };
    }));
    addToast(`${selected.size} creators assigned to ${camp?.brand || camp?.name}`);
    setSelected(new Set());
    setAssignCampaign('');
  };

  const removeFromCampaign = (creatorId, campId) => {
    setCreators(prev => prev.map(c => {
      if (c.id !== creatorId) return c;
      const existing = c.campaignIds || (c.campaignId ? [c.campaignId] : []);
      const updated = existing.filter(id => id !== campId);
      return { ...c, campaignIds: updated, campaignId: updated[0] || null };
    }));
    const camp = campaigns.find(c => c.id === campId);
    addToast(`Removed from ${camp?.brand || camp?.name}`);
  };

  const totalCount = creators.filter(c => ['not_in_program', 'invited_to_program', 'in_program'].includes(c.stage)).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Creator Program</h1>
      </div>

      {/* Upload Creators tile */}
      <div style={styles.uploadTile}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 12px 0' }}>Upload Creators</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button style={styles.chooseFileBtn} onClick={() => fileRef.current?.click()}>
                Choose File
              </button>
              <span style={{ fontSize: 13, color: 'var(--color-text-tertiary)' }}>No file chosen</span>
              <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
            </div>
            <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 8, marginBottom: 0 }}>
              CSV format: Name, Social Handle, Platform, Follower Count
            </p>
          </div>
          <button style={styles.addCreatorBtn} onClick={() => setShowAddModal(true)}>
            <Plus size={16} /> Add Creator
          </button>
        </div>
      </div>

      {/* Combined card: search + table */}
      <div style={styles.card}>
        {/* Search & Filter bar */}
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
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={styles.filterSelect}>
            <option value="all">All Status</option>
            {PROGRAM_STAGES.map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={styles.filterSelect}>
            <option value="newest">Newest First</option>
            <option value="az">A → Z</option>
            <option value="za">Z → A</option>
          </select>
          <span style={styles.countBadge}>All Creators {totalCount}</span>
        </div>

        {/* Table */}
        {programCreators.length === 0 ? (
          <div style={styles.emptyState}>
            <p>No creators match your filters.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={styles.theadRow}>
                <th style={styles.th}>
                  <input
                    type="checkbox"
                    checked={selected.size === programCreators.length && programCreators.length > 0}
                    onChange={toggleAll}
                    style={{ accentColor: '#3B82F6' }}
                  />
                </th>
                <th style={styles.th}>CREATOR</th>
                <th style={styles.th}>STATUS</th>
                <th style={styles.th}>CAMPAIGN</th>
                <th style={{ ...styles.th, textAlign: 'right', paddingRight: 6 }}>DAYS</th>
                <th style={{ ...styles.th, textAlign: 'right', paddingLeft: 6 }}>DATE ADDED</th>
              </tr>
            </thead>
            <tbody>
              {programCreators.map(creator => {
                const stageInfo = STAGE_LABELS[creator.stage];
                const platInfo = PLATFORM_ICONS[creator.platform] || PLATFORM_ICONS.ig;
                const campIds = creator.campaignIds || (creator.campaignId ? [creator.campaignId] : []);
                return (
                  <tr key={creator.id} style={{ ...styles.tbodyRow, ...(selected.has(creator.id) ? { background: '#F5F3FF' } : {}) }}>
                    <td style={styles.td}>
                      <input
                        type="checkbox"
                        checked={selected.has(creator.id)}
                        onChange={() => toggleSelect(creator.id)}
                        style={{ accentColor: '#3B82F6' }}
                      />
                    </td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar initials={creator.initials} size={34} photo={creator.photo} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>{creator.name}</span>
                            {creator.email && (
                              <button
                                style={styles.emailBtn}
                                title={creator.email}
                                onClick={() => {
                                  navigator.clipboard.writeText(creator.email);
                                  addToast(`Copied ${creator.email}`);
                                }}
                              >
                                <Mail size={12} />
                              </button>
                            )}
                          </div>
                          <div style={{ fontSize: 12, color: '#94A3B8' }}>
                            {creator.handle}
                            {creator.followers ? ` · ${formatFollowers(creator.followers)}` : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <select
                        value={creator.stage}
                        onChange={e => changeOneStatus(creator.id, e.target.value)}
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          padding: '3px 6px',
                          borderRadius: 4,
                          color: stageInfo?.color,
                          backgroundColor: stageInfo?.bg,
                          border: `1px solid ${stageInfo?.bg}`,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          appearance: 'none',
                          WebkitAppearance: 'none',
                          paddingRight: 18,
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='${encodeURIComponent(stageInfo?.color || '#666')}' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 4px center',
                        }}
                      >
                        {PROGRAM_STAGES.map(s => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={styles.td}>
                      {campIds.length === 0 ? (
                        <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>—</span>
                      ) : (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                          {campIds.map(cid => {
                            const camp = campaigns.find(c => c.id === cid);
                            if (!camp) return null;
                            return (
                              <span key={cid} style={styles.campaignTag}>
                                {camp.logo && <img src={camp.logo} alt="" style={{ width: 14, height: 14, borderRadius: '50%', objectFit: 'cover' }} />}
                                {camp.brand || camp.name}
                                <button
                                  style={styles.campaignRemove}
                                  onClick={() => removeFromCampaign(creator.id, cid)}
                                  title="Remove"
                                >×</button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td style={{ ...styles.td, fontSize: 12, textAlign: 'right', paddingRight: 6, color: creator.stage === 'invited_to_program' && creator.daysInStage > 2 ? '#DC2626' : '#94A3B8', fontWeight: creator.stage === 'invited_to_program' && creator.daysInStage > 2 ? 600 : 400, whiteSpace: 'nowrap' }}>
                      {creator.daysInStage != null ? `${creator.daysInStage}d` : '—'}
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', paddingLeft: 6, fontSize: 12, color: '#94A3B8', whiteSpace: 'nowrap' }}>
                      {creator.dateAdded || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Creator Modal */}
      {showAddModal && (
        <div style={styles.overlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Add Creator</h2>
              <button style={styles.closeBtn} onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                placeholder="Emma Rodriguez"
                value={addForm.name}
                onChange={e => setAddForm(prev => ({ ...prev, name: e.target.value }))}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Benable ID</label>
              <input
                type="text"
                placeholder="e.g. 12345 (optional, auto-generated if blank)"
                value={addForm.benableId}
                onChange={e => setAddForm(prev => ({ ...prev, benableId: e.target.value }))}
                style={styles.input}
              />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 24 }}>
              <button style={styles.cancelBtn} onClick={() => setShowAddModal(false)}>Cancel</button>
              <button style={styles.submitBtn} onClick={handleAddCreator} disabled={!addForm.name.trim()}>
                Add Creator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fixed bottom action bar */}
      {selected.size > 0 && (
        <div style={styles.bottomBar}>
          <span style={{ fontWeight: 600 }}>{selected.size} selected</span>
          <button style={styles.bottomBtn} onClick={() => setSelected(new Set())}>
            Deselect All
          </button>
          <button
            style={{ ...styles.bottomBtn, background: '#F59E0B', color: '#fff' }}
            onClick={() => bulkChangeStatus('invited_to_program')}
          >
            Mark as Invited
          </button>
          <button
            style={{ ...styles.bottomBtn, background: '#22C55E', color: '#fff' }}
            onClick={() => bulkChangeStatus('in_program')}
          >
            Mark as In Program
          </button>
          <div style={styles.bottomDivider} />
          <select
            value={assignCampaign}
            onChange={e => setAssignCampaign(e.target.value)}
            style={{ ...styles.filterSelect, background: '#fff' }}
          >
            <option value="">Select campaign...</option>
            {liveCampaigns.map(c => (
              <option key={c.id} value={c.id}>{c.brand || c.name}</option>
            ))}
          </select>
          <button
            style={{ ...styles.bottomBtn, background: assignCampaign ? '#7C3AED' : '#9CA3AF', color: '#fff' }}
            onClick={bulkAssignCampaign}
            disabled={!assignCampaign}
          >
            <Send size={14} /> Assign to Campaign
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  uploadTile: {
    padding: '20px 24px',
    background: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: 12,
    marginBottom: 16,
  },
  chooseFileBtn: {
    padding: '8px 20px',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'inherit',
    background: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: 8,
    cursor: 'pointer',
    color: '#334155',
  },
  addCreatorBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'inherit',
    background: '#3B82F6',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
  },
  card: {
    background: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '16px 20px',
    borderBottom: '1px solid #E2E8F0',
    background: '#FAFBFC',
  },
  searchWrap: {
    position: 'relative',
    flex: 1,
  },
  searchInput: {
    width: '100%',
    padding: '9px 12px 9px 38px',
    fontSize: 14,
    fontFamily: 'inherit',
    border: '1px solid #E2E8F0',
    borderRadius: 8,
    outline: 'none',
    background: '#fff',
    color: '#334155',
  },
  filterSelect: {
    height: 38,
    fontSize: 13,
    padding: '4px 12px',
    borderRadius: 8,
    border: '1px solid #E2E8F0',
    cursor: 'pointer',
    fontFamily: 'inherit',
    background: '#fff',
    color: '#334155',
  },
  countBadge: {
    fontSize: 13,
    fontWeight: 500,
    padding: '7px 16px',
    borderRadius: 8,
    background: '#F1F5F9',
    color: '#64748B',
    whiteSpace: 'nowrap',
    border: 'none',
  },
  theadRow: {
    borderBottom: '1px solid #E2E8F0',
    background: '#F8FAFC',
  },
  th: {
    padding: '10px 14px',
    fontSize: 11,
    fontWeight: 600,
    color: '#94A3B8',
    textAlign: 'left',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
    textTransform: 'uppercase',
  },
  tbodyRow: {
    borderBottom: '1px solid #F1F5F9',
  },
  td: {
    padding: '12px 14px',
    verticalAlign: 'middle',
  },
  emailBtn: {
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
  campaignTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    fontWeight: 500,
    padding: '3px 10px',
    borderRadius: 6,
    background: '#EFF6FF',
    color: '#3B82F6',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
  },
  campaignRemove: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#93C5FD',
    fontSize: 14,
    fontWeight: 700,
    padding: '0 0 0 2px',
    lineHeight: 1,
    fontFamily: 'inherit',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 'var(--space-10)',
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 24px',
    background: '#1E293B',
    color: '#fff',
    fontSize: 14,
    zIndex: 900,
    boxShadow: '0 -4px 20px rgba(0,0,0,0.12)',
    borderTop: '1px solid #334155',
  },
  bottomBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'inherit',
    background: '#334155',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
  bottomDivider: {
    width: 1,
    height: 24,
    background: '#475569',
    flexShrink: 0,
  },
  // Modal styles
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: 8,
    padding: '32px',
    width: 440,
    maxWidth: '90vw',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--color-text-tertiary)',
    padding: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 6,
    color: 'var(--color-text-primary)',
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: 14,
    fontFamily: 'inherit',
    border: '1px solid #E5E7EB',
    borderRadius: 8,
    outline: 'none',
    background: '#FAFAFA',
  },
  cancelBtn: {
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 500,
    fontFamily: 'inherit',
    background: 'none',
    border: '1px solid var(--color-border)',
    borderRadius: 8,
    cursor: 'pointer',
    color: 'var(--color-text-primary)',
  },
  submitBtn: {
    padding: '10px 24px',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'inherit',
    background: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  },
};
