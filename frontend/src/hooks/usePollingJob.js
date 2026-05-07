import { useEffect, useRef, useCallback, useState } from 'react';
import { createJob, fetchJob } from '../services/api';

const POLL_INTERVAL_MS = 1000;
// Fraction of remaining gap to close per animation frame (~60 fps)
const LERP_SPEED = 0.06;

const INITIAL_STATE = {
  status: 'idle',
  progress: 0,
  result: null,
  error: null,
};

export function usePollingJob() {
  const [state, setState] = useState(INITIAL_STATE);

  const pollTimerRef      = useRef(null);
  const rafRef            = useRef(null);
  const isActiveRef       = useRef(false);   // true while polling is running
  const displayRef        = useRef(0);       // current animated value
  const targetRef         = useRef(0);       // latest value from DB

  // ── Animation loop — keeps running until isActiveRef becomes false ──
  const startLoop = useCallback(() => {
    if (rafRef.current) return; // already running

    const tick = () => {
      if (!isActiveRef.current) {
        rafRef.current = null;
        return;
      }

      const diff = targetRef.current - displayRef.current;
      if (Math.abs(diff) > 0.15) {
        displayRef.current += diff * LERP_SPEED;
      } else {
        displayRef.current = targetRef.current;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const stopLoop = useCallback(() => {
    isActiveRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const start = useCallback(async (payload) => {
    stopPolling();
    stopLoop();
    displayRef.current = 0;
    targetRef.current  = 0;
    setState({ ...INITIAL_STATE, status: 'connecting' });

    let job;
    try {
      job = await createJob(payload);
    } catch (err) {
      setState((s) => ({ ...s, status: 'failed', error: err.message }));
      return;
    }

    setState((s) => ({ ...s, status: 'queued' }));
    isActiveRef.current = true;
    startLoop();

    pollTimerRef.current = setInterval(async () => {
      try {
        const data = await fetchJob(job.id);
        targetRef.current = data.progress;

        setState((s) => ({ ...s, status: data.status, progress: data.progress }));

        if (data.status === 'done' || data.status === 'failed') {
          stopPolling();
          stopLoop();
          setState((s) => ({
            ...s,
            status:   data.status,
            progress: data.progress,
            result:   data.result ?? null,
            error:    data.status === 'failed' ? 'Pipeline failed on server' : null,
          }));
        }
      } catch (err) {
        stopPolling();
        stopLoop();
        setState((s) => ({ ...s, status: 'failed', error: err.message }));
      }
    }, POLL_INTERVAL_MS);
  }, [stopPolling, stopLoop, startLoop]);

  const reset = useCallback(() => {
    stopPolling();
    stopLoop();
    displayRef.current = 0;
    targetRef.current  = 0;
    setState(INITIAL_STATE);
  }, [stopPolling, stopLoop]);

  useEffect(() => () => { stopPolling(); stopLoop(); }, [stopPolling, stopLoop]);

  return { ...state, start, reset };
}
