import { useState } from 'react';

const OPTIONS = [
  { id: 'alpha',   label: 'Alpha Processing',   emoji: '😌' },
  { id: 'beta',    label: 'Beta Processing',     emoji: '🥳' },
  { id: 'gamma',   label: 'Gamma Processing',    emoji: '⚖️' },
  { id: 'delta',   label: 'Delta Processing',    emoji: '💚' },
  { id: 'epsilon', label: 'Epsilon Processing',  emoji: '🙂' },
];

export default function Screen1({ onContinue }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className="screen">
      <div className="screen__body">
        <h1 className="screen__title">What is your main goal?</h1>

        <div className="option-list">
          {OPTIONS.map((opt) => (
            <div
              key={opt.id}
              className={`option-card${selected === opt.id ? ' option-card--selected' : ''}`}
              onClick={() => setSelected(opt.id)}
              role="radio"
              aria-checked={selected === opt.id}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setSelected(opt.id)}
            >
              <span className="option-card__emoji">{opt.emoji}</span>
              <span className="option-card__label">{opt.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="screen__footer">
        <button
          className="btn-continue"
          disabled={!selected}
          onClick={() => onContinue(selected)}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
