export function formatCurrency(amount: number) {
  return `Rs. ${amount.toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}