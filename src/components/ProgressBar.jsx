import { PHASES, STAGES } from '../utils/stageConfig';

export default function ProgressBar({ creators, showLabels = false }) {
  const total = creators.length;
  if (total === 0) return null;

  const phaseCounts = {};
  PHASES.forEach(p => { phaseCounts[p.key] = 0; });
  creators.forEach(c => {
    const stage = STAGES.find(s => s.key === c.stage);
    if (stage) phaseCounts[stage.phase]++;
  });

  return (
    <div>
      <div style={{
        display: 'flex',
        height: 8,
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        background: 'var(--color-bg-hover)',
        width: '100%',
      }}>
        {PHASES.map(phase => {
          const pct = (phaseCounts[phase.key] / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={phase.key}
              title={`${phase.label}: ${phaseCounts[phase.key]}`}
              style={{
                width: `${pct}%`,
                background: phase.color,
                minWidth: pct > 0 ? 4 : 0,
              }}
            />
          );
        })}
      </div>
      {showLabels && (
        <div style={{
          display: 'flex',
          gap: 'var(--space-4)',
          marginTop: 6,
        }}>
          {PHASES.map(phase => {
            if (phaseCounts[phase.key] === 0) return null;
            return (
              <span key={phase.key} style={{
                fontSize: 12,
                color: 'var(--color-text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <span style={{ width: 8, height: 8, borderRadius: 'var(--radius-full)', background: phase.color, display: 'inline-block' }} />
                {phase.label} {phaseCounts[phase.key]}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
