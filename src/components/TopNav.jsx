import { NavLink } from 'react-router-dom';
import { Folders, Eye, FileSpreadsheet } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin/campaigns', label: 'Campaigns', icon: Folders, end: false },
  { to: '/admin/review', label: 'Review Queue', icon: Eye },
  { to: '/admin/spreadsheet', label: 'Spreadsheet', icon: FileSpreadsheet },
];

export default function TopNav() {
  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <div style={styles.logo}>
          <span style={styles.logoText}>Benable</span>
          <span style={styles.adminBadge}>Admin</span>
        </div>
        <div style={styles.links}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                ...styles.link,
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                borderBottom: isActive ? '2px solid var(--color-accent)' : '2px solid transparent',
                fontWeight: isActive ? 600 : 500,
              })}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </div>
        {/* spacer to balance layout */}
        <div style={{ width: 32 }} />
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: 'var(--color-bg-page)',
    borderBottom: '1px solid var(--color-border)',
    height: 56,
    position: 'sticky',
    top: 0,
    zIndex: 'var(--z-sticky)',
  },
  inner: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '0 var(--space-8) 0 var(--space-4)',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-8)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    flexShrink: 0,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--color-text-primary)',
    letterSpacing: '-0.5px',
  },
  adminBadge: {
    fontSize: 10,
    fontWeight: 600,
    color: 'var(--color-accent)',
    background: 'var(--color-accent-light)',
    padding: '2px 6px',
    borderRadius: 'var(--radius-sm)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-6)',
    height: '100%',
    flex: 1,
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    textDecoration: 'none',
    fontSize: 14,
    lineHeight: '22px',
    height: '100%',
    paddingTop: 2,
    transition: 'color 150ms ease',
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-full)',
    background: 'var(--color-bg-hover)',
    color: 'var(--color-text-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 13,
    fontWeight: 600,
    flexShrink: 0,
    border: '1px solid var(--color-border)',
  },
};
