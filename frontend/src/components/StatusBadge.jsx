const STATUS_LABELS = {
  idle:       'Idle',
  connecting: 'Connecting',
  queued:     'Queued',
  processing: 'Processing',
  done:       'Done',
  failed:     'Failed',
};

const PULSE_STATUSES = new Set(['connecting', 'queued', 'processing']);

export default function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] ?? status;
  const pulse = PULSE_STATUSES.has(status);

  return (
    <span className={`status-badge status-badge--${status}`}>
      <span className={`status-dot${pulse ? ' status-dot--pulse' : ''}`} />
      {label}
    </span>
  );
}
