const express = require('express');
const cors = require('cors');
const jobsRouter = require('./api/jobs.router');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/jobs', jobsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

module.exports = app;
