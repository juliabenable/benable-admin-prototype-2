import { useState, useMemo } from 'react';
import { Search, Send, BadgeCheck, Eye as EyeIcon } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import StatusBadge, { DaysBadge } from '../components/StatusBadge';
import Avatar from '../components/Avatar';
import CreatorModal from '../components/CreatorModal';
import NudgeDialog from '../components/NudgeDialog';
import { STAGES, STAGE_MAP, KANBAN_STAGES } from '../utils/stageConfig';
import { formatFollowers, formatEngagement } from '../utils/formatters';

export default function Creators() {
  const { creators, campaigns } = useAppState();
  const [search, setSearch] = useState('');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [nudgeCreator, setNudgeCreator] = useState(null);

  const filtered = useMemo(() => {
    let list = [...creators];
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.handle.toLowerCase().includes(search.toLowerCase()));
    if (campaignFilter !== 'all') list = list.filter(c => c.campaignId === campaignFilter);
    if (statusFilter !== 'all') list = list.filter(c => c.stage === statusFilter);
    // Sort overdue first
    list.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return b.daysInStage - a.daysInStage;
    });
    return list;
  }, [creators, search, campaignFilter, statusFilter]);

  const hasActiveFilters = search || campaignFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Creator Database</h1>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <div style={styles.searchWrap}>
          <Search size={16} color="var(--color-text-tertiary)" />
          <input
            type="search"
            placeholder="Search by name or handle..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 14, flex: 1, background: 'transparent' }}
          />
        </div>
        <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)} style={styles.filterSelect}>
          <option value="all">All Campaigns</option>
          {campaigns.map(c => <option key={c.id} value={c.id}>{c.brand || c.name} — {c.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={styles.filterSelect}>
          <option value="all">All Stages</option>
          {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        {hasActiveFilters && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setCampaignFilter('all'); setStatusFilter('all'); }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Card-style rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {filtered.map(creator => {
          const camp = campaigns.find(c => c.id === creator.campaignId);
          return (
            <div key={creator.id} style={{
              ...styles.listRow,
              ...(creator.isOverdue ? { boxShadow: 'inset 4px 0 0 var(--color-danger)', background: 'var(--color-danger-light)' } : {}),
            }}>
              <div style={styles.listLeft}>
                <Avatar initials={creator.initials} size={48} photo={creator.photo} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={styles.listName} onClick={() => setSelectedCreator(creator)}>{creator.name}</span>
                    <BadgeCheck size={14} color="#5B8EC9" />
                  </div>
                  <div style={styles.listMeta}>
                    {creator.handle} · {formatFollowers(creator.followers)} · {formatEngagement(creator.engagement)} eng
                  </div>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={styles.nichePill}>{creator.niche}</span>
                    <span style={styles.campaignTag}>{camp?.brand || camp?.name}</span>
                    {creator.usedBefore && <span style={styles.usedBadge}>Used Before ({creator.campaignsCompleted})</span>}
                  </div>
                </div>
              </div>
              <div style={styles.listMiddle}>
                <StatusBadge stage={creator.stage} />
                <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{STAGE_MAP[creator.stage]?.helperText}</span>
                <DaysBadge days={creator.daysInStage} isOverdue={creator.isOverdue} />
              </div>
              <div style={styles.listRight}>
                {creator.isOverdue && (
                  <button className="btn btn-primary btn-sm" onClick={() => setNudgeCreator(creator)}>
                    <Send size={12} /> Nudge
                  </button>
                )}
                <button className="btn btn-outlined btn-sm" onClick={() => setSelectedCreator(creator)}>
                  <EyeIcon size={12} /> Preview
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedCreator && <CreatorModal creator={selectedCreator} onClose={() => setSelectedCreator(null)} />}
      {nudgeCreator && <NudgeDialog creator={nudgeCreator} campaign={campaigns.find(c => c.id === nudgeCreator.campaignId)} onClose={() => setNudgeCreator(null)} />}
    </div>
  );
}

const styles = {
  filterBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-3)',
    marginBottom: 'var(--space-4)',
    padding: 'var(--space-3) var(--space-4)',
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    flexWrap: 'wrap',
  },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flex: '1 1 200px', minWidth: 200 },
  filterSelect: { height: 32, fontSize: 13, padding: '4px 8px' },
  listRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-4)',
    padding: '14px 20px',
    background: 'var(--color-bg-card)',
    outline: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    transition: 'box-shadow 150ms ease',
  },
  listLeft: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: '1 1 40%', minWidth: 0 },
  listName: { fontSize: 14, fontWeight: 500, color: 'var(--color-accent)', cursor: 'pointer' },
  listMeta: { fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 1, marginBottom: 4 },
  nichePill: { fontSize: 12, padding: '1px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-neutral-light)', color: 'var(--color-text-tertiary)' },
  campaignTag: { fontSize: 12, fontWeight: 500, padding: '1px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-bg-hover)', color: 'var(--color-text-secondary)' },
  usedBadge: { fontSize: 11, fontWeight: 500, padding: '1px 6px', borderRadius: 'var(--radius-full)', background: 'var(--color-info-light)', color: 'var(--color-info-text)' },
  listMiddle: { display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flex: '0 0 auto', minWidth: 0 },
  listRight: { display: 'flex', gap: 'var(--space-2)', flex: '0 0 auto' },
};
