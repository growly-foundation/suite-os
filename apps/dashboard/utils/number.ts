/**
 * Utility functions for converting and formatting blockchain token balances
 */

/**
 * Helper function to convert hex string to decimal bigint
 * @param hex - Hex string to convert (e.g., "0x1a2b3c")
 * @returns Decimal bigint representation
 */
export const hexToDecimal = (hex: string): bigint => {
  if (!hex || hex === '0x') return BigInt(0);
  return BigInt(hex);
};
