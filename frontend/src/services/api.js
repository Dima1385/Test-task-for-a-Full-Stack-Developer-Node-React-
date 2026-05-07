const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

// http:// → ws://   |   https:// → wss://
export const WS_BASE_URL = BASE_URL.replace(/^http/, 'ws');

export async function createJob(payload) {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchJob(id) {
  const res = await fetch(`${BASE_URL}/jobs/${id}`);

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  return res.json();
}
