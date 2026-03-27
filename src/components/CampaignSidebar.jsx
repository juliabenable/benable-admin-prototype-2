import { useState } from 'react';
import { MoreHorizontal, Archive, RotateCcw, ChevronRight } from 'lucide-react';
import { useAppState } from '../hooks/useAppState';

export default function CampaignSidebar({ activeCampaignId, onSelect }) {
  const { campaigns, creators, archiveCampaign, unarchiveCampaign } = useAppState();
  const liveCampaigns = campaigns.filter(c => c.status === 'live');
  const archivedCampaigns = campaigns.filter(c => c.status === 'archived');
  const [menuOpen, setMenuOpen] = useState(null);
  const [archivedOpen, setArchivedOpen] = useState(false);

  const handleArchive = (e, campId) => {
    e.stopPropagation();
    archiveCampaign(campId);
    setMenuOpen(null);
  };

  const handleUnarchive = (e, campId) => {
    e.stopPropagation();
    unarchiveCampaign(campId);
    setMenuOpen(null);
  };

  const renderCampaignItem = (camp, isArchived = false) => {
    const count = creators.filter(c => c.campaignId === camp.id).length;
    const isActive = camp.id === activeCampaignId;
    const isMenuOpen = menuOpen === camp.id;

    return (
      <div key={camp.id} style={{ position: 'relative' }}>
        <button
          onClick={() => onSelect(camp.id)}
          style={{
            ...styles.item,
            background: isActive ? 'var(--color-accent-light)' : 'transparent',
            borderLeft: isActive ? '3px solid var(--color-accent)' : '3px solid transparent',
            opacity: isArchived ? 0.7 : 1,
          }}
        >
          {camp.logo ? (
            <img src={camp.logo} alt="" style={styles.itemLogo} />
          ) : (
            <div style={styles.itemIcon}>{(camp.brand || camp.name)[0]}</div>
          )}
          <div style={styles.itemText}>
            <span style={{ ...styles.itemName, color: isActive ? 'var(--color-accent)' : 'var(--color-text-primary)' }}>{camp.brand || camp.name}</span>
            <span style={styles.itemCount}>{count} creators</span>
          </div>
          <div
            style={styles.moreBtn}
            onClick={e => { e.stopPropagation(); setMenuOpen(isMenuOpen ? null : camp.id); }}
          >
            <MoreHorizontal size={14} />
          </div>
        </button>

        {isMenuOpen && (
          <>
            <div style={styles.menuBackdrop} onClick={() => setMenuOpen(null)} />
            <div style={styles.menu}>
              {isArchived ? (
                <button style={styles.menuItem} onClick={e => handleUnarchive(e, camp.id)}>
                  <RotateCcw size={13} /> Restore Campaign
                </button>
              ) : (
                <button style={styles.menuItem} onClick={e => handleArchive(e, camp.id)}>
                  <Archive size={13} /> Archive Campaign
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Campaigns</span>
      </div>

      <div style={styles.section}>
        <span style={styles.sectionLabel}>Live</span>
        {liveCampaigns.map(camp => renderCampaignItem(camp))}
      </div>

      {/* Archived section — always visible, collapsed by default */}
      <div style={styles.section}>
        <button style={styles.archivedToggle} onClick={() => setArchivedOpen(!archivedOpen)}>
          <ChevronRight size={12} style={{ transform: archivedOpen ? 'rotate(90deg)' : 'none', transition: 'transform 150ms ease' }} />
          <span style={styles.sectionLabel}>Archived</span>
          {archivedCampaigns.length > 0 && (
            <span style={styles.archivedCount}>{archivedCampaigns.length}</span>
          )}
        </button>
        {archivedOpen && archivedCampaigns.length > 0 && (
          archivedCampaigns.map(camp => renderCampaignItem(camp, true))
        )}
        {archivedOpen && archivedCampaigns.length === 0 && (
          <div style={styles.emptyArchived}>No archived campaigns</div>
        )}
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 240,
    background: 'var(--color-bg-sidebar)',
    borderRight: '1px solid var(--color-border)',
    height: 'calc(100vh - 56px)',
    position: 'sticky',
    top: 56,
    overflowY: 'auto',
    flexShrink: 0,
  },
  header: {
    padding: '20px 16px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  section: {
    padding: '0 8px 16px',
  },
  sectionLabel: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '8px 8px 4px',
  },
  archivedToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: '4px 4px',
    width: '100%',
  },
  archivedCount: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--color-text-tertiary)',
    background: 'var(--color-bg-hover)',
    borderRadius: 'var(--radius-full)',
    padding: '0 6px',
    lineHeight: '18px',
    marginLeft: 'auto',
  },
  emptyArchived: {
    fontSize: 12,
    color: 'var(--color-text-tertiary)',
    padding: '8px 16px',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '10px 12px',
    borderTop: 'none',
    borderRight: 'none',
    borderBottom: 'none',
    borderLeft: '3px solid transparent',
    background: 'transparent',
    cursor: 'pointer',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'background 100ms ease',
  },
  itemIcon: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-bg-hover)',
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
    fontWeight: 600,
    flexShrink: 0,
  },
  itemLogo: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-full)',
    objectFit: 'cover',
    flexShrink: 0,
    border: '1px solid var(--color-border)',
  },
  itemText: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  itemCount: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  moreBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: 'var(--radius-sm)',
    color: 'var(--color-text-tertiary)',
    flexShrink: 0,
    cursor: 'pointer',
    transition: 'background 100ms ease',
  },
  menuBackdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 99,
  },
  menu: {
    position: 'absolute',
    right: 8,
    top: '100%',
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
    padding: 4,
    zIndex: 100,
    minWidth: 160,
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '8px 12px',
    background: 'none',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text-primary)',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textAlign: 'left',
    transition: 'background 100ms ease',
  },
};
