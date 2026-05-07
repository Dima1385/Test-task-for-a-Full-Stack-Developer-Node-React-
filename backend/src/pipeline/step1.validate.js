/**
 * Step 1 — Validate
 * Simulates input validation logic (0 → 33 %)
 */
async function stepValidate(context) {
  await delay(1200);
  context.validated = true;
  return context;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = stepValidate;
