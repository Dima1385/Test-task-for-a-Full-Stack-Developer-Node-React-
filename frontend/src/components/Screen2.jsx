import { useState } from 'react';

const UNIT_CONFIG = {
  lbs: { min: 22,  max: 485 },
  kg:  { min: 10,  max: 220 },
};

const UNITS = ['lbs', 'kg'];

export default function Screen2({ option, onContinue }) {
  const [unit, setUnit]     = useState('lbs');
  const [raw, setRaw]       = useState('');
  const [touched, setTouched] = useState(false);

  const numVal  = Number(raw);
  const { min, max } = UNIT_CONFIG[unit];
  const hasValue  = raw.trim() !== '' && Number.isFinite(numVal);
  const isValid   = hasValue && numVal >= min && numVal <= max;
  const showError = touched && hasValue && !isValid;

  // Auto-size the input width so the value+unit group stays centered
  const inputWidth = raw ? `${String(raw).length + 0.5}ch` : '5ch';

  function handleUnitChange(u) {
    setUnit(u);
    setRaw('');
    setTouched(false);
  }

  function handleChange(e) {
    setRaw(e.target.value);
    setTouched(true);
  }

  return (
    <div className="screen">
      <div className="screen__body">
        <h1 className="screen__title">Enter a numeric value</h1>

        <div className="unit-toggle">
          {UNITS.map((u) => (
            <button
              key={u}
              className={`unit-toggle__btn${unit === u ? ' unit-toggle__btn--active' : ''}`}
              onClick={() => handleUnitChange(u)}
            >
              {u}
            </button>
          ))}
        </div>

        <div className="value-input-wrapper">
          <div className={`value-input-row${showError ? ' value-input-row--error' : ''}`}>
            <input
              type="number"
              className="value-input"
              style={{ width: inputWidth }}
              value={raw}
              onChange={handleChange}
              onBlur={() => setTouched(true)}
              placeholder="Value"
              min={min}
              max={max}
              step="any"
              autoFocus
            />
            <span className="value-input-unit">{unit}</span>
          </div>

          <p className={`value-hint${showError ? ' value-hint--error' : ''}`}>
            Please enter a value between{' '}
            <strong>{min} {unit}</strong> and <strong>{max} {unit}</strong>
          </p>

          {isValid && (
            <div className="insight-card">
              <div className="insight-card__header">
                <span>⚡</span>
                <span>Goal: Process with {option}</span>
              </div>
              <p className="insight-card__body">
                Your value will be processed through the pipeline in a few seconds.
                We'll show live progress as each step completes.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="screen__footer">
        <button
          className="btn-continue"
          disabled={!isValid}
          onClick={() => isValid && onContinue(numVal)}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
