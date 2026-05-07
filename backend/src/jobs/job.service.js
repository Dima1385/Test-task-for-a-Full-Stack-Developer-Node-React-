const { v4: uuidv4 } = require('uuid');
const { insertJob, getJobById, updateJob } = require('../db/database');
const { runPipeline } = require('../pipeline/pipeline');
const wsServer = require('../websocket');

function createJob({ option, value }) {
  const id = uuidv4();
  const createdAt = new Date().toISOString();

  insertJob({ id, option, value, createdAt });

  // Run pipeline asynchronously — do not await here
  _processPipeline(id, option, value).catch((err) => {
    console.error(`Pipeline failed for job ${id}:`, err.message);
    updateJob(id, { status: 'failed', progress: 0 });
    wsServer.broadcast(id, { event: 'failed', jobId: id, progress: 0 });
  });

  return { id, status: 'queued', progress: 0, createdAt };
}

async function _processPipeline(id, option, value) {
  // queued → processing
  updateJob(id, { status: 'processing' });
  wsServer.broadcast(id, { event: 'processing', jobId: id, progress: 0 });

  const context = await runPipeline(
    { jobId: id, option, value },
    (progress) => {
      updateJob(id, { progress });
      wsServer.broadcast(id, { event: 'progress', jobId: id, progress });
    },
  );

  const result = JSON.stringify(context.result ?? null);
  updateJob(id, { status: 'done', progress: 100, result });
  wsServer.broadcast(id, { event: 'done', jobId: id, progress: 100, result: context.result });
}

function getJob(id) {
  const job = getJobById(id);
  if (!job) return null;

  return {
    id: job.id,
    status: job.status,
    progress: job.progress,
    option: job.option,
    value: job.value,
    result: job.result ? JSON.parse(job.result) : null,
    createdAt: job.createdAt,
  };
}

module.exports = { createJob, getJob };
