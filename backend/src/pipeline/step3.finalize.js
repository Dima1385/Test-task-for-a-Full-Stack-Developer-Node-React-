/**
 * Step 3 — Finalize
 * Simulates result aggregation / persistence logic (66 → 100 %)
 */
async function stepFinalize(context) {
  await delay(1000);
  context.finalized = true;
  context.result = {
    option: context.option,
    inputValue: context.value,
    output: context.output,
    processedAt: new Date().toISOString(),
  };
  return context;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = stepFinalize;
