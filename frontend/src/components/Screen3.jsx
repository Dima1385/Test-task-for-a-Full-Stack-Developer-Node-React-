import { useState } from 'react';
import CircularProgress from './CircularProgress';
import IndeterminateBar from './IndeterminateBar';
import { useWebSocketJob } from '../hooks/useWebSocketJob';
import { usePollingJob } from '../hooks/usePollingJob';

const MODE_NONE = 'none';
const MODE_WS   = 'websocket';
const MODE_HTTP = 'http';

const LAUNCH_OPTIONS = [
  {
    id: MODE_WS,
    emoji: '⚡',
    label: 'WebSocket',
    desc: 'Real-time progress updates',
  },
  {
    id: MODE_HTTP,
    emoji: '🔄',
    label: 'HTTP Polling',
    desc: 'Smooth interpolated progress',
  },
];

const REVIEW = {
  stars: 5,
  text: '"The processing pipeline is incredibly fast. Results appeared in seconds!"',
  name: 'Alex',
};

export default function Screen3({ option, value, onReset, onProcessingChange }) {
  const [mode, setMode] = useState(MODE_NONE);

  const ws   = useWebSocketJob();
  const http = usePollingJob();

  const job = mode === MODE_WS ? ws : mode === MODE_HTTP ? http : null;

  const isIdle       = !job || job.status === 'idle';
  const isProcessing = job && job.status !== 'idle' && job.status !== 'done' && job.status !== 'failed';
  const isDone       = job?.status === 'done';
  const isFailed     = job?.status === 'failed';

  function handleLaunch(selectedMode) {
    setMode(selectedMode);
    onProcessingChange(true);

    const hooks = selectedMode === MODE_WS ? ws : http;
    hooks.start({ option, value });
  }

  function handleReset() {
    ws.reset();
    http.reset();
    setMode(MODE_NONE);
    onProcessingChange(false);
    onReset();
  }

  const progressValue = mode === MODE_HTTP
    ? (job?.displayProgress ?? 0)
    : (job?.progress ?? 0);

  // ── Mode selection ──────────────────────────────────
  if (isIdle) {
    return (
      <div className="screen">
        <div className="screen__body">
          <h1 className="screen__title">
            Choose <em>launch</em> method
          </h1>

          <div className="option-list">
            {LAUNCH_OPTIONS.map((opt) => (
              <div
                key={opt.id}
                className="option-card"
                onClick={() => handleLaunch(opt.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleLaunch(opt.id)}
              >
                <span className="option-card__emoji">{opt.emoji}</span>
                <div>
                  <div className="option-card__label">{opt.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                    {opt.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="screen__footer" />
      </div>
    );
  }

  // ── Processing / Done / Failed ──────────────────────
  return (
    <div className="processing-screen">

      {/* WebSocket — кільцевий прогрес із % */}
      {mode === MODE_WS && (
        <CircularProgress value={job?.progress ?? 0} showPercent />
      )}

      {/* HTTP — indeterminate бар (без %) */}
      {mode === MODE_HTTP && isProcessing && (
        <IndeterminateBar />
      )}

      {/* HTTP done — показати заповнений бар */}
      {mode === MODE_HTTP && isDone && (
        <div className="indet-track" style={{ marginBottom: 36 }}>
          <div style={{
            height: '100%',
            width: '100%',
            background: 'var(--primary)',
            borderRadius: 99,
            transition: 'width 400ms',
          }} />
        </div>
      )}

      {(isProcessing) && (
        <>
          <p className="processing-title">Creating something good for you...</p>
          <p className="processing-subtitle">
            This will only take a moment — your job is almost ready.
          </p>
          <ReviewCard />
        </>
      )}

      {isDone && (
        <>
          <p className="processing-title">Processing complete!</p>
          <p className="processing-subtitle">
            Your job finished successfully. Here are the results.
          </p>

          {job.result && (
            <div className="result-card">
              <p className="result-card__title">Result</p>
              {[
                { key: 'Option',       val: job.result.option },
                { key: 'Input',        val: job.result.inputValue },
                { key: 'Output',       val: job.result.output },
                { key: 'Processed at', val: new Date(job.result.processedAt).toLocaleTimeString() },
              ].map(({ key, val }) => (
                <div key={key} className="result-row">
                  <span className="result-row__key">{key}</span>
                  <span className="result-row__val">{String(val ?? '—')}</span>
                </div>
              ))}
            </div>
          )}

          <button className="btn-continue" onClick={handleReset}>
            Reset
          </button>
        </>
      )}

      {isFailed && (
        <>
          <p className="processing-error">{job.error ?? 'An error occurred during processing.'}</p>
          <button className="btn-reset" onClick={handleReset}>
            Try again
          </button>
        </>
      )}
    </div>
  );
}

function ReviewCard() {
  return (
    <div className="review-card">
      <div className="review-card__stars">
        {Array.from({ length: REVIEW.stars }, (_, i) => (
          <span key={i} className="review-card__star">★</span>
        ))}
      </div>
      <div className="review-card__row">
        <p className="review-card__text">{REVIEW.text}</p>
        <span className="review-card__name">{REVIEW.name}</span>
      </div>
    </div>
  );
}
