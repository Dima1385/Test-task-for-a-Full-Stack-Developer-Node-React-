const SIZE = 188;
const STROKE = 12;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function CircularProgress({ value, showPercent = true }) {
  const clamped = Math.max(0, Math.min(100, value ?? 0));
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;

  return (
    <div className="circular-progress">
      <svg
        className="circular-progress__svg"
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
      >
        <circle
          className="circular-progress__track"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
        />
        <circle
          className="circular-progress__fill"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
        />
      </svg>

      {showPercent && (
        <div className="circular-progress__label" aria-label={`${Math.round(clamped)}%`}>
          {Math.round(clamped)}%
        </div>
      )}
    </div>
  );
}
