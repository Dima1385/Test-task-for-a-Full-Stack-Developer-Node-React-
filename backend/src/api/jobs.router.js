const { Router } = require('express');
const { createJob, getJob } = require('../jobs/job.service');

const router = Router();

router.post('/', (req, res) => {
  const { option, value } = req.body;

  if (!option || typeof option !== 'string') {
    return res.status(400).json({ error: 'option is required and must be a string' });
  }

  const numValue = Number(value);
  if (!Number.isFinite(numValue) || numValue <= 0) {
    return res.status(400).json({ error: 'value must be a positive number' });
  }

  const job = createJob({ option, value: numValue });
  res.status(201).json(job);
});

router.get('/:id', (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  res.json(job);
});

module.exports = router;
