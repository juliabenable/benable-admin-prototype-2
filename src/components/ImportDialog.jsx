import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import Modal from './Modal';
import { useAppState } from '../hooks/useAppState';

export default function ImportDialog({ campaignId, campaignName, onClose }) {
  const { importCreators, addToast, logActivity } = useAppState();
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f || !f.name.endsWith('.csv')) {
      addToast('Please upload a .csv file', 'danger');
      return;
    }
    setFile(f);

    // Simulate CSV import
    setTimeout(() => {
      const mockImported = [
        { name: 'New Creator A', handle: '@newcreatorA', niche: 'Food', followers: 5200, engagement: 3.8, initials: 'NA', photo: null },
        { name: 'New Creator B', handle: '@newcreatorB', niche: 'Beauty', followers: 8900, engagement: 4.5, initials: 'NB', photo: null },
      ];
      const mockFailed = [
        { row: 4, reason: 'Benable ID not found' },
      ];

      importCreators(mockImported, campaignId);
      logActivity(`Imported ${mockImported.length} creators to ${campaignName}`, 'Kate');

      setResult({
        success: mockImported.length,
        failed: mockFailed,
      });
    }, 800);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  return (
    <Modal title={`Import Creators to ${campaignName}`} onClose={onClose} maxWidth={400}>
      {!result ? (
        <>
          <div
            style={{
              ...styles.dropzone,
              borderColor: isDragging ? 'var(--color-brand)' : 'var(--color-border)',
              background: isDragging ? 'var(--color-brand-light)' : 'var(--color-bg-secondary)',
            }}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={32} color="var(--color-text-tertiary)" />
            <p style={styles.dropText}>
              {file ? file.name : 'Drag and drop a CSV file here'}
            </p>
            <button className="btn btn-secondary btn-sm">Browse Files</button>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={e => handleFile(e.target.files[0])}
            />
          </div>
          <div style={styles.helpText}>
            <p style={styles.helpTitle}>Required CSV columns:</p>
            <ul style={styles.helpList}>
              <li><strong>benable_id</strong> — Benable user ID (required)</li>
              <li><strong>name</strong> — Creator name (optional)</li>
              <li><strong>notes</strong> — Initial notes (optional)</li>
              <li><strong>priority</strong> — Ranking number (optional)</li>
            </ul>
          </div>
        </>
      ) : (
        <div>
          <div style={styles.resultSuccess}>
            {result.success} creators imported successfully
          </div>
          {result.failed.length > 0 && (
            <div style={styles.resultFailed}>
              <p style={{ fontWeight: 500, marginBottom: 'var(--space-2)' }}>
                {result.failed.length} row{result.failed.length > 1 ? 's' : ''} failed:
              </p>
              {result.failed.map((f, i) => (
                <p key={i} style={styles.failedRow}>
                  Row {f.row}: {f.reason}
                </p>
              ))}
            </div>
          )}
          <div style={{ marginTop: 'var(--space-4)', textAlign: 'right' }}>
            <button className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      )}
    </Modal>
  );
}

const styles = {
  dropzone: {
    border: '2px dashed var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-8)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--space-3)',
    cursor: 'pointer',
    transition: 'border-color 150ms ease, background 150ms ease',
    marginBottom: 'var(--space-4)',
  },
  dropText: {
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    textAlign: 'center',
  },
  helpText: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
  },
  helpTitle: { fontWeight: 500, marginBottom: 'var(--space-1)' },
  helpList: { paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 2 },
  resultSuccess: {
    padding: 'var(--space-3)',
    background: 'var(--color-success-light)',
    color: 'var(--color-success-text)',
    borderRadius: 'var(--radius-md)',
    fontWeight: 500,
    marginBottom: 'var(--space-3)',
  },
  resultFailed: {
    padding: 'var(--space-3)',
    background: 'var(--color-danger-light)',
    color: 'var(--color-danger-text)',
    borderRadius: 'var(--radius-md)',
    fontSize: 13,
  },
  failedRow: { fontSize: 12, marginTop: 2 },
};
