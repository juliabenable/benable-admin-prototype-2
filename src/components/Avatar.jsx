export default function Avatar({ initials, size = 32, photo = null }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        style={{
          width: size,
          height: size,
          borderRadius: 'var(--radius-full)',
          border: '2px solid var(--color-border)',
          objectFit: 'cover',
        }}
      />
    );
  }

  const fontSize = size <= 24 ? 10 : size <= 32 ? 12 : size <= 48 ? 16 : 20;

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 'var(--radius-full)',
      background: 'var(--color-accent-light)',
      color: 'var(--color-accent)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize,
      fontWeight: 600,
      flexShrink: 0,
      border: '2px solid var(--color-border)',
    }}>
      {initials}
    </div>
  );
}

export function BrandAvatar({ initial, size = 40, photo = null }) {
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        style={{
          width: size,
          height: size,
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--color-border)',
          objectFit: 'cover',
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: 'var(--radius-full)',
      background: 'var(--color-bg-hover)',
      color: 'var(--color-text-secondary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: size * 0.4,
      fontWeight: 600,
      flexShrink: 0,
      border: '1px solid var(--color-border)',
    }}>
      {initial}
    </div>
  );
}
