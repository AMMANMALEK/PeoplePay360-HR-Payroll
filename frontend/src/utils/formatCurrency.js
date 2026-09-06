export function formatINR(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  const formatted = Math.abs(num).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  return `${num < 0 ? '-' : ''}₹${formatted}`;
}

export function formatINRCompact(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  const thousands = num / 1000;
  return `₹${thousands.toLocaleString('en-IN', { maximumFractionDigits: 0 })}k`;
}

