import { useState } from 'react';
import { useAppState } from '../hooks/useAppState';
import { STAGE_TRANSITION_LABELS, formatTimeLimit } from '../utils/stageConfig';

export default function Settings() {
  const { settings, setSettings, addToast } = useAppState();
  const [timeLimits, setTimeLimits] = useState({ ...settings.timeLimits });
  const [nudgeDelay, setNudgeDelay] = useState(settings.nudgeDelay);
  const [escalationDelay, setEscalationDelay] = useState(settings.escalationDelay);

  const handleTimeLimitChange = (stageKey, value) => {
    const num = value === '' ? null : parseInt(value, 10);
    setTimeLimits(prev => ({ ...prev, [stageKey]: isNaN(num) ? null : num }));
  };

  const handleSaveTimeLimits = () => {
    setSettings(prev => ({ ...prev, timeLimits }));
    addToast('Stage time limits saved');
  };

  const handleSaveNudge = () => {
    setSettings(prev => ({ ...prev, nudgeDelay, escalationDelay }));
    addToast('Nudge settings saved');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
      </div>

      {/* Stage Time Limits */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Stage Time Limits</h2>
        <p style={styles.sectionDesc}>
          Set the default time limit for each pipeline stage. Creators exceeding these limits will be flagged for attention.
        </p>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Stage Transition</th>
                <th>Default Time Limit</th>
                <th>Per-Campaign Override</th>
              </tr>
            </thead>
            <tbody>
              {STAGE_TRANSITION_LABELS.map(({ from, label }) => (
                <tr key={from}>
                  <td style={{ fontWeight: 500 }}>{label}</td>
                  <td>
                    <div style={styles.inputRow}>
                      <input
                        type="number"
                        value={timeLimits[from] ?? ''}
                        onChange={e => handleTimeLimitChange(from, e.target.value)}
                        style={styles.numberInput}
                        min={0}
                        placeholder="No limit"
                      />
                      <span style={styles.inputSuffix}>hours</span>
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={() => addToast('Per-campaign overrides coming soon', 'info')}>
                      Configure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={styles.saveRow}>
          <button className="btn btn-primary" onClick={handleSaveTimeLimits}>Save Changes</button>
        </div>
      </div>

      {/* Automated Nudge Settings */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Automated Nudge Settings</h2>
        <div style={styles.nudgeFields}>
          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>First auto-nudge after:</label>
            <div style={styles.inputRow}>
              <input
                type="number"
                value={nudgeDelay}
                onChange={e => setNudgeDelay(parseInt(e.target.value, 10) || 0)}
                style={styles.numberInput}
                min={0}
              />
              <span style={styles.inputSuffix}>hours past time limit</span>
            </div>
            <span style={styles.helpText}>Default: 0 (nudge immediately when limit is exceeded)</span>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Escalate to manual follow-up after:</label>
            <div style={styles.inputRow}>
              <input
                type="number"
                value={escalationDelay}
                onChange={e => setEscalationDelay(parseInt(e.target.value, 10) || 0)}
                style={styles.numberInput}
                min={0}
              />
              <span style={styles.inputSuffix}>hours past first nudge</span>
            </div>
            <span style={styles.helpText}>Default: 24 hours</span>
          </div>
        </div>
        <div style={styles.saveRow}>
          <button className="btn btn-primary" onClick={handleSaveNudge}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  section: {
    marginBottom: 'var(--space-8)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 600,
    lineHeight: '28px',
    marginBottom: 'var(--space-1)',
  },
  sectionDesc: {
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--space-4)',
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
  },
  numberInput: {
    width: 100,
    height: 32,
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'inherit',
    padding: '4px 8px',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    outline: 'none',
  },
  inputSuffix: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  saveRow: {
    marginTop: 'var(--space-4)',
  },
  nudgeFields: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-5)',
    background: 'var(--color-bg-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-5)',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-2)',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: 500,
  },
  helpText: {
    fontSize: 12,
    color: 'var(--color-text-tertiary)',
  },
};
