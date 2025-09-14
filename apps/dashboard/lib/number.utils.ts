// Helper to format amount with 2 significant non-zero digits after decimal
export function formatAssetValue(amount: number, digits = 2): string {
  if (amount === 0 || amount === null || amount === undefined) return '0';

  // Convert scientific notation to regular decimal string
  let amountStr: string;
  if (Math.abs(amount) < 1e-6 || Math.abs(amount) >= 1e21) {
    // Use toFixed to avoid scientific notation for very small or very large numbers
    amountStr = amount.toFixed(20);
  } else {
    amountStr = amount.toString();
  }

  const [intPart, decPart] = amountStr.split('.');

  if (!decPart) return parseInt(intPart ?? '0')?.toLocaleString() ?? '0';

  // Find the first non-zero digit position
  let firstNonZeroIndex = -1;
  for (let i = 0; i < decPart.length; i++) {
    if (decPart[i] !== '0') {
      firstNonZeroIndex = i;
      break;
    }
  }

  if (firstNonZeroIndex === -1) return '0';

  // Take from first non-zero digit to first non-zero digit + 1 more digit
  const significantDigits = Math.min(firstNonZeroIndex + digits, decPart.length);
  const formattedDecimal = decPart.substring(0, significantDigits);

  // Remove trailing zeros
  const trimmedDecimal = formattedDecimal.replace(/0+$/, '');

  return `${parseInt(intPart ?? '0')?.toLocaleString()}.${trimmedDecimal}`;
}
