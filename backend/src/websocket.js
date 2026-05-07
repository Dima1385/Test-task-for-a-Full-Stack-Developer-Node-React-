const { WebSocketServer } = require('ws');
const url = require('url');

/** @type {Map<string, Set<import('ws').WebSocket>>} jobId → connected clients */
const subscriptions = new Map();

function createWebSocketServer(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws, req) => {
    const { query } = url.parse(req.url, true);
    const jobId = query.jobId;

    if (!jobId) {
      ws.close(1008, 'jobId query param is required');
      return;
    }

    // Subscribe this socket to the job
    if (!subscriptions.has(jobId)) subscriptions.set(jobId, new Set());
    subscriptions.get(jobId).add(ws);

    // Send current job state immediately so the client never misses queued/processing
    // (pipeline may have started before WS connection was established)
    const { getJobById } = require('./db/database');
    const job = getJobById(jobId);
    if (job) {
      const payload = { event: job.status, jobId, progress: job.progress };
      if (job.status === 'done' && job.result) {
        try { payload.result = JSON.parse(job.result); } catch { /* ignore */ }
      }
      ws.send(JSON.stringify(payload));
    }

    ws.on('close', () => {
      const sockets = subscriptions.get(jobId);
      if (sockets) {
        sockets.delete(ws);
        if (sockets.size === 0) subscriptions.delete(jobId);
      }
    });

    ws.on('error', (err) => {
      console.error(`WebSocket error for job ${jobId}:`, err.message);
    });
  });

  return wss;
}

/**
 * Broadcast a message to all sockets subscribed to a specific job.
 * @param {string} jobId
 * @param {object} payload
 */
function broadcast(jobId, payload) {
  const sockets = subscriptions.get(jobId);
  if (!sockets || sockets.size === 0) return;

  const data = JSON.stringify(payload);
  sockets.forEach((ws) => {
    if (ws.readyState === 1 /* OPEN */) ws.send(data);
  });
}

module.exports = { createWebSocketServer, broadcast };
