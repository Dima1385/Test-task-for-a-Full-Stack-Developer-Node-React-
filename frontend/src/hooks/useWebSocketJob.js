import { useEffect, useRef, useCallback, useState } from 'react';
import { createJob, WS_BASE_URL } from '../services/api';

const INITIAL_STATE = {
  status: 'idle',   // idle | connecting | queued | processing | done | failed
  progress: 0,
  result: null,
  error: null,
};

export function useWebSocketJob() {
  const [state, setState] = useState(INITIAL_STATE);
  const wsRef = useRef(null);

  const closeSocket = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.onmessage = null;
      wsRef.current.onerror = null;
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const start = useCallback(async (payload) => {
    closeSocket();
    setState({ ...INITIAL_STATE, status: 'connecting' });

    let job;
    try {
      job = await createJob(payload);
    } catch (err) {
      setState((s) => ({ ...s, status: 'failed', error: err.message }));
      return;
    }

    setState((s) => ({ ...s, status: 'queued', progress: 0 }));

    const ws = new WebSocket(`${WS_BASE_URL}?jobId=${job.id}`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      let msg;
      try { msg = JSON.parse(event.data); } catch { return; }

      if (msg.event === 'processing') {
        setState((s) => ({ ...s, status: 'processing' }));
      } else if (msg.event === 'progress') {
        setState((s) => ({ ...s, status: 'processing', progress: msg.progress }));
      } else if (msg.event === 'done') {
        setState({ status: 'done', progress: 100, result: msg.result ?? null, error: null });
        closeSocket();
      } else if (msg.event === 'failed') {
        setState((s) => ({ ...s, status: 'failed', error: 'Pipeline failed on server' }));
        closeSocket();
      }
    };

    ws.onerror = () => {
      setState((s) => ({ ...s, status: 'failed', error: 'WebSocket connection error' }));
      closeSocket();
    };
  }, [closeSocket]);

  const reset = useCallback(() => {
    closeSocket();
    setState(INITIAL_STATE);
  }, [closeSocket]);

  useEffect(() => () => closeSocket(), [closeSocket]);

  return { ...state, start, reset };
}
