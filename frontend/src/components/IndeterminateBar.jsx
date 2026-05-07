/**
 * Indeterminate (без %) progress bar для HTTP-режиму.
 * Показує, що робота триває, без відображення конкретного відсотка.
 */
export default function IndeterminateBar() {
  return (
    <div className="indet-track" role="progressbar" aria-label="Processing…">
      <div className="indet-fill" />
    </div>
  );
}
