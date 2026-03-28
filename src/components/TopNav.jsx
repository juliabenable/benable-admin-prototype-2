import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/admin/creator-program', label: 'Creators' },
  { to: '/admin/draft-portal', label: 'Campaign Preselection' },
  { to: '/admin/campaigns', label: 'Campaigns', end: false },
];

export default function TopNav() {
  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <div style={styles.links}>
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              style={({ isActive }) => ({
                ...styles.link,
                color: isActive ? '#1E40AF' : '#6B7280',
                borderBottom: isActive ? '2px solid #1E40AF' : '2px solid transparent',
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: '#fff',
    borderBottom: '1px solid #E5E7EB',
    height: 48,
    position: 'sticky',
    top: 0,
    zIndex: 'var(--z-sticky)',
  },
  inner: {
    maxWidth: 1400,
    margin: '0 auto',
    padding: '0 var(--space-6)',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-8)',
    height: '100%',
  },
  link: {
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    fontSize: 14,
    lineHeight: '22px',
    height: '100%',
    paddingTop: 2,
    transition: 'color 150ms ease',
  },
};
