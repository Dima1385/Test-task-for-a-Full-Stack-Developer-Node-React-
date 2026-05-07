/**
 * Step 2 — Transform
 * Simulates data transformation logic (33 → 66 %)
 */
async function stepTransform(context) {
  await delay(1400);
  context.transformed = true;
  context.output = context.value * 2;
  return context;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = stepTransform;
