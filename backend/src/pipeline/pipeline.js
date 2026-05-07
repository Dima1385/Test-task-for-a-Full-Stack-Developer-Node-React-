const stepValidate = require('./step1.validate');
const stepTransform = require('./step2.transform');
const stepFinalize = require('./step3.finalize');

/**
 * Ordered list of pipeline steps.
 * To add a new step: create a new file and append it here.
 * Each entry: { fn: AsyncFunction, progressStart: number, progressEnd: number }
 */
const STEPS = [
  { fn: stepValidate,  progressStart: 0,  progressEnd: 33  },
  { fn: stepTransform, progressStart: 33, progressEnd: 66  },
  { fn: stepFinalize,  progressStart: 66, progressEnd: 100 },
];

/**
 * Run the full pipeline for a job.
 *
 * @param {object} initialContext  - { jobId, option, value }
 * @param {Function} onProgress    - (progress: number) => void
 * @returns {Promise<object>}      - final context after all steps
 */
async function runPipeline(initialContext, onProgress) {
  let context = { ...initialContext };

  for (const step of STEPS) {
    onProgress(step.progressStart);
    context = await step.fn(context);
    onProgress(step.progressEnd);
  }

  return context;
}

module.exports = { runPipeline };
