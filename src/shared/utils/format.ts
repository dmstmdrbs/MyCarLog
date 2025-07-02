export function formatNumber(value?: number) {
  if (typeof value !== 'number' || isNaN(value)) return '0';
  return value.toLocaleString();
}
