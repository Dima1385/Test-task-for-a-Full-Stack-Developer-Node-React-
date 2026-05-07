/**
 * @param {object}  props
 * @param {number}  props.value   - progress value 0-100
 * @param {boolean} [props.showPercent=true] - whether to render the numeric label
 * @param {boolean} [props.done]  - use done colour
 */
export default function ProgressBar({ value, showPercent = true, done = false }) {
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="progress-section">
      <div className="progress-header">
        <span className="progress-label">Progress</span>
        {showPercent && (
          <span className="progress-pct">{Math.round(clamped)}%</span>
        )}
      </div>
      <div className="progress-track">
        <div
          className={`progress-fill${done ? ' progress-fill--done' : ''}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
