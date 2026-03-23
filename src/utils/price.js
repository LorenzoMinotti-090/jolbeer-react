const numberFormatter = new Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatEur(value) {
  const numericValue = Number(value) || 0;
  return `€ ${numberFormatter.format(numericValue)}`;
}
