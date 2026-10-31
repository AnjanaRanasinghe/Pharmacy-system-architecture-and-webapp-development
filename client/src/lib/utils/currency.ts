export function formatCurrency(amount: number) {
  return `Rs. ${formatNumber(amount)}`;
}

// Same formatting as formatCurrency but without the "Rs." prefix, for tables where
// the currency is already named once in the column header rather than repeated in
// every cell.
export function formatNumber(amount: number) {
  return amount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}