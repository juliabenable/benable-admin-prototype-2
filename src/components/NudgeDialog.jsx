import { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import Modal from './Modal';
import { useAppState } from '../hooks/useAppState';
import { getTemplatesForStage, fillTemplate } from '../data/emailTemplates';
import { STAGES } from '../utils/stageConfig';
import { formatDateTime } from '../utils/formatters';

export default function NudgeDialog({ creator, campaign, onClose }) {
  const { addToast, addEmail, logActivity } = useAppState();

  // Step dropdown — defaults to creator's current stage
  const [selectedStep, setSelectedStep] = useState(creator.stage);
  const templates = getTemplatesForStage(selectedStep);
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0]?.key || '');
  const [emailBody, setEmailBody] = useState('');
  const [subject, setSubject] = useState('');

  const templateData = {
    creatorName: creator.name.split(' ')[0],
    campaignName: campaign?.name || 'Campaign',
  };

  // When step changes, update templates
  useEffect(() => {
    const newTemplates = getTemplatesForStage(selectedStep);
    setSelectedTemplate(newTemplates[0]?.key || '');
  }, [selectedStep]);

  useEffect(() => {
    const allTemplates = getTemplatesForStage(selectedStep);
    const tpl = allTemplates.find(t => t.key === selectedTemplate);
    if (tpl) {
      setEmailBody(fillTemplate(tpl.body, templateData));
      setSubject(fillTemplate(tpl.subject, templateData));
    }
  }, [selectedTemplate, selectedStep]);

  const handleSend = () => {
    const stepLabel = STAGES.find(s => s.key === selectedStep)?.label || selectedStep;
    addEmail(creator.id, subject, 'nudge');
    logActivity(`Sent nudge to ${creator.name} for step "${stepLabel}": "${subject}"`, 'Kate', creator.id);
    addToast(`Nudge sent to ${creator.name} for: ${stepLabel}`);
    onClose();
  };

  const lastEmail = creator.emails[0];

  // Nudge-relevant stages (exclude terminal states)
  const nudgeStages = STAGES.filter(s =>
    !['completed', 'denied', 'content_approved', 'posted'].includes(s.key)
  );

  return (
    <Modal title={`Send Nudge to ${creator.name}`} onClose={onClose} maxWidth={520}>
      {lastEmail && (
        <div style={styles.lastEmail}>
          <span style={styles.lastEmailLabel}>Last email sent:</span>
          <span style={styles.lastEmailText}>{lastEmail.subject} — {formatDateTime(lastEmail.date)}</span>
        </div>
      )}

      {/* Step dropdown */}
      <div style={styles.field}>
        <label style={styles.label}>Which step is this nudge for?</label>
        <select value={selectedStep} onChange={e => setSelectedStep(e.target.value)} style={{ width: '100%' }}>
          {nudgeStages.map(s => (
            <option key={s.key} value={s.key}>
              {s.label}{s.key === creator.stage ? ' (current)' : ''}
            </option>
          ))}
        </select>
        <span style={styles.helperText}>
          Current stage: {STAGES.find(s => s.key === creator.stage)?.label}
        </span>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Template</label>
        <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)} style={{ width: '100%' }}>
          {getTemplatesForStage(selectedStep).map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Subject</label>
        <input type="text" value={subject} onChange={e => setSubject(e.target.value)} style={{ width: '100%' }} />
      </div>
      <div style={styles.field}>
        <label style={styles.label}>Email</label>
        <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)} style={{ width: '100%', minHeight: 200 }} />
      </div>
      <div style={styles.sendingFrom}>Sending from: <strong>collabs@benable.com</strong></div>
      <div style={styles.actions}>
        <button className="btn btn-primary" onClick={handleSend}><Send size={16} /> Send Nudge</button>
        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  );
}

const styles = {
  lastEmail: { padding: 'var(--space-3)', background: 'var(--color-info-light)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' },
  lastEmailLabel: { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-info-text)', marginBottom: 2 },
  lastEmailText: { fontSize: 13, color: 'var(--color-info-text)' },
  field: { marginBottom: 'var(--space-4)' },
  label: { display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' },
  helperText: { display: 'block', fontSize: 12, color: 'var(--color-text-tertiary)', marginTop: 4, fontStyle: 'italic' },
  sendingFrom: { fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' },
  actions: { display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' },
};
