import { useState, useMemo } from 'react';
import { Download, ChevronDown } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';
import { STAGE_MAP } from '../utils/stageConfig';
import { formatFollowers, formatEngagement } from '../utils/formatters';

export default function Spreadsheet() {
  const { creators, campaigns } = useAppState();
  const liveCampaigns = campaigns.filter(c => c.status === 'live');
  const [activeTab, setActiveTab] = useState(liveCampaigns[0]?.id || '');

  const activeCampaign = campaigns.find(c => c.id === activeTab);
  const campaignCreators = useMemo(() => {
    return creators
      .filter(c => c.campaignId === activeTab)
      .sort((a, b) => {
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return a.name.localeCompare(b.name);
      });
  }, [creators, activeTab]);

  const handleExport = () => {
    // Build CSV for all campaigns (each as a section)
    let csv = '';
    liveCampaigns.forEach((camp, i) => {
      const campCreators = creators.filter(c => c.campaignId === camp.id);
      if (i > 0) csv += '\n\n';
      csv += `${camp.brand || camp.name} — ${camp.name}\n`;
      csv += 'Name,Handle,Niche,Followers,Engagement,Stage,Days in Stage,Overdue,Email\n';
      campCreators.forEach(c => {
        const stage = STAGE_MAP[c.stage]?.label || c.stage;
        csv += `"${c.name}","${c.handle}","${c.niche}",${c.followers},${c.engagement}%,"${stage}",${c.daysInStage},${c.isOverdue ? 'Yes' : 'No'},"${c.email || ''}"\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `benable-campaigns-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (stage) => {
    const s = STAGE_MAP[stage];
    if (!s) return {};
    return { color: s.color, background: s.bg };
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Campaign Spreadsheet</h1>
        <button className="btn btn-primary" onClick={handleExport}>
          <Download size={16} /> Export CSV
        </button>
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
            <span>{camp.brand || camp.name}</span>
            <span style={styles.tabCount}>{creators.filter(c => c.campaignId === camp.id).length}</span>
          </button>
        ))}
      </div>

      {/* Campaign info bar */}
      {activeCampaign && (
        <div style={styles.infoBar}>
          <span style={styles.infoLabel}>{activeCampaign.name}</span>
          <span style={styles.infoDot}>·</span>
          <span style={styles.infoMeta}>Started {activeCampaign.createdAt}</span>
          <span style={styles.infoDot}>·</span>
          <span style={styles.infoMeta}>{campaignCreators.length} creators</span>
          <span style={styles.infoDot}>·</span>
          <span style={{ ...styles.infoMeta, color: 'var(--color-danger)' }}>
            {campaignCreators.filter(c => c.isOverdue).length} overdue
          </span>
        </div>
      )}

      {/* Spreadsheet table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th style={{ width: 40 }}>#</th>
              <th>Creator</th>
              <th>Handle</th>
              <th>Niche</th>
              <th>Followers</th>
              <th>Engagement</th>
              <th>Current Stage</th>
              <th>Days in Stage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {campaignCreators.map((creator, i) => {
              const stage = STAGE_MAP[creator.stage];
              return (
                <tr key={creator.id} style={creator.isOverdue ? { background: 'var(--color-danger-light)' } : {}}>
                  <td style={{ color: 'var(--color-text-tertiary)', fontSize: 12 }}>{i + 1}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {creator.photo ? (
                        <img src={creator.photo} alt="" style={styles.avatar} />
                      ) : (
                        <div style={styles.avatarPlaceholder}>{creator.initials}</div>
                      )}
                      <span style={{ fontWeight: 500 }}>{creator.name}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>{creator.handle}</td>
                  <td><span style={styles.nichePill}>{creator.niche}</span></td>
                  <td className="tabular-nums">{formatFollowers(creator.followers)}</td>
                  <td className="tabular-nums">{formatEngagement(creator.engagement)}</td>
                  <td>
                    <span style={{ ...styles.stagePill, ...getStatusColor(creator.stage) }}>
                      {stage?.label || creator.stage}
                    </span>
                  </td>
                  <td className="tabular-nums" style={{
                    color: creator.isOverdue ? 'var(--color-danger)' : creator.daysInStage >= 2 ? 'var(--color-warning-text)' : 'var(--color-text-secondary)',
                    fontWeight: creator.isOverdue ? 600 : 400,
                  }}>
                    {creator.daysInStage}d
                  </td>
                  <td>
                    {creator.isOverdue ? (
                      <span style={styles.overdueBadge}>Overdue</span>
                    ) : (
                      <span style={styles.onTrackBadge}>On Track</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {campaignCreators.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: 40, color: 'var(--color-text-tertiary)' }}>
                  No creators in this campaign yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Summary row */}
      {campaignCreators.length > 0 && (
        <div style={styles.summary}>
          <SummaryItem label="Total" value={campaignCreators.length} />
          <SummaryItem label="On Track" value={campaignCreators.filter(c => !c.isOverdue).length} color="var(--color-success)" />
          <SummaryItem label="Overdue" value={campaignCreators.filter(c => c.isOverdue).length} color="var(--color-danger)" />
          <SummaryItem label="Content Submitted" value={campaignCreators.filter(c => c.stage === 'content_submitted').length} color="var(--color-warning-text)" />
          <SummaryItem label="Completed" value={campaignCreators.filter(c => c.stage === 'completed').length} color="var(--color-success)" />
        </div>
      )}
    </div>
  );
}

function SummaryItem({ label, value, color }) {
  return (
    <div style={styles.summaryItem}>
      <span style={styles.summaryLabel}>{label}</span>
      <span style={{ ...styles.summaryValue, color: color || 'var(--color-text-primary)' }}>{value}</span>
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
    padding: '12px 20px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 500,
    marginBottom: -2,
    transition: 'all 150ms ease',
  },
  tabActive: {
    color: 'var(--color-accent)',
    borderBottomColor: 'var(--color-accent)',
    fontWeight: 600,
  },
  tabInactive: {
    color: 'var(--color-text-tertiary)',
    borderBottomColor: 'transparent',
  },
  tabLogo: {
    width: 24,
    height: 24,
    borderRadius: 'var(--radius-full)',
    objectFit: 'cover',
    border: '1px solid var(--color-border)',
  },
  tabCount: {
    fontSize: 12,
    fontWeight: 600,
    background: 'var(--color-bg-hover)',
    borderRadius: 'var(--radius-full)',
    padding: '0 6px',
    lineHeight: '18px',
    color: 'var(--color-text-secondary)',
  },
  infoBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 16px',
    background: 'var(--color-bg-sidebar)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--space-4)',
  },
  infoLabel: { fontSize: 14, fontWeight: 600 },
  infoDot: { color: 'var(--color-text-tertiary)' },
  infoMeta: { fontSize: 13, color: 'var(--color-text-secondary)' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-full)',
    objectFit: 'cover',
    border: '1px solid var(--color-border)',
  },
  avatarPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-bg-hover)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
  },
  nichePill: {
    fontSize: 12,
    padding: '1px 8px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-neutral-light)',
    color: 'var(--color-text-tertiary)',
  },
  stagePill: {
    fontSize: 12,
    fontWeight: 500,
    padding: '2px 10px',
    borderRadius: 'var(--radius-full)',
    whiteSpace: 'nowrap',
  },
  overdueBadge: {
    fontSize: 12,
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-danger-light)',
    color: 'var(--color-danger-text)',
  },
  onTrackBadge: {
    fontSize: 12,
    fontWeight: 500,
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-success-light)',
    color: 'var(--color-success-text)',
  },
  summary: {
    display: 'flex',
    gap: 'var(--space-6)',
    padding: 'var(--space-4) var(--space-5)',
    background: 'var(--color-bg-card)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--color-border)',
    marginTop: 'var(--space-4)',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 700,
    fontFeatureSettings: '"tnum"',
  },
};
