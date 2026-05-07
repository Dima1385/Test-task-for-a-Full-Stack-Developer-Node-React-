export default function Header({ step, totalSteps = 3, onBack, hideProgress = false }) {
  const progress = hideProgress ? 0 : (step / totalSteps) * 100;
  const backHidden = step <= 1 || hideProgress;

  return (
    <header className="header">
      <button
        className={`header__back${backHidden ? ' header__back--hidden' : ''}`}
        onClick={onBack}
        aria-label="Go back"
      >
        ‹
      </button>
      <div className="header__progress-track">
        {!hideProgress && (
          <div
            className="header__progress-fill"
            style={{ width: `${progress}%` }}
          />
        )}
      </div>
    </header>
  );
}
