import { useState, useMemo, useRef } from 'react';
import { Upload, Check } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import Avatar from '../components/Avatar';
import { formatFollowers } from '../utils/formatters';

const PROGRAM_STAGES = [
  { key: 'not_in_program', label: 'Not in Creator Program', color: '#6B7280', bg: '#F3F4F6' },
  { key: 'invited_to_program', label: 'Invited to Creator Program', color: '#4A7FC7', bg: '#EBF1FA' },
  { key: 'in_program', label: 'In Creator Program', color: '#3D8B5E', bg: '#EDF7F0' },
];

const STAGE_LABELS = Object.fromEntries(PROGRAM_STAGES.map(s => [s.key, s]));

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

    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return { name, handle: handle.startsWith('@') ? handle : `@${handle}`, followers, niche, email, city, platform, initials };
  });
}

export default function CreatorProgram() {
  const { creators, setCreators, addToast } = useAppState();
  const fileRef = useRef(null);
  const [selected, setSelected] = useState(new Set());

  // Only show creators in program-level stages (not assigned to any campaign yet, or in program stages)
  const programCreators = useMemo(() => {
    return creators.filter(c => ['not_in_program', 'invited_to_program', 'in_program'].includes(c.stage));
  }, [creators]);

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

  // Counts per status
  const counts = useMemo(() => {
    const c = { not_in_program: 0, invited_to_program: 0, in_program: 0 };
    programCreators.forEach(cr => { if (c[cr.stage] !== undefined) c[cr.stage]++; });
    return c;
  }, [programCreators]);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Creator Program</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>
            <Upload size={16} /> Upload CSV
          </button>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileUpload} />
        </div>
      </div>

      {/* Status counts */}
      <div style={styles.statusBar}>
        {PROGRAM_STAGES.map(s => (
          <div key={s.key} style={{ ...styles.statusBox, borderColor: s.color }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{counts[s.key]}</span>
            <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div style={styles.bulkBar}>
          <span>Selected rows: {selected.size}</span>
          <button className="btn btn-primary btn-sm" onClick={() => bulkChangeStatus('invited_to_program')}>
            <Check size={14} /> Invite to Program
          </button>
          <button className="btn btn-sm" style={{ background: '#3D8B5E', color: '#fff', border: 'none' }} onClick={() => bulkChangeStatus('in_program')}>
            <Check size={14} /> Mark In Program
          </button>
        </div>
      )}

      {programCreators.length === 0 ? (
        <div style={styles.emptyState}>
          <Upload size={32} color="var(--color-text-tertiary)" />
          <p>No creators yet. Upload a CSV to get started.</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)' }}>
            CSV should have columns: name, handle, followers, niche, email, city
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={selected.size === programCreators.length && programCreators.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                <th>Creator</th>
                <th>Followers</th>
                <th>Niche</th>
                <th>Email</th>
                <th>Status</th>
                <th>Select to change</th>
              </tr>
            </thead>
            <tbody>
              {programCreators.map(creator => {
                const stageInfo = STAGE_LABELS[creator.stage];
                return (
                  <tr key={creator.id} style={selected.has(creator.id) ? { background: 'var(--color-accent-light)' } : {}}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(creator.id)}
                        onChange={() => toggleSelect(creator.id)}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Avatar initials={creator.initials} size={32} photo={creator.photo} />
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{creator.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{creator.handle}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13 }}>{formatFollowers(creator.followers)}</td>
                    <td style={{ fontSize: 13 }}>{creator.niche || '—'}</td>
                    <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{creator.email || '—'}</td>
                    <td>
                      <span style={{
                        fontSize: 12,
                        fontWeight: 500,
                        padding: '3px 10px',
                        borderRadius: 'var(--radius-full)',
                        color: stageInfo?.color,
                        background: stageInfo?.bg,
                        whiteSpace: 'nowrap',
                      }}>
                        {stageInfo?.label}
                      </span>
                    </td>
                    <td>
                      <select
                        value={creator.stage}
                        onChange={e => changeOneStatus(creator.id, e.target.value)}
                        style={styles.statusSelect}
                      >
                        {PROGRAM_STAGES.map(s => (
                          <option key={s.key} value={s.key}>{s.label}</option>
                        ))}
                      </select>
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
  statusBar: {
    display: 'flex',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-4)',
  },
  statusBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 24px',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid',
    background: 'var(--color-bg-card)',
    flex: 1,
    textAlign: 'center',
  },
  bulkBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    background: 'var(--color-accent-light)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--space-4)',
    fontSize: 14,
    fontWeight: 500,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    padding: 'var(--space-10)',
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 14,
    textAlign: 'center',
  },
  statusSelect: {
    height: 30,
    fontSize: 13,
    padding: '2px 6px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
};
