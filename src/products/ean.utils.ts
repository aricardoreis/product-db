/**
 * EAN (European Article Number) checksum validation.
 *
 * Replaces the old length-only check with proper EAN-13 / EAN-8
 * checksum verification per GS1 specification.
 */

/**
 * Validates an EAN-8 or EAN-13 barcode using the standard
 * GS1 check-digit algorithm.
 *
 * The algorithm:
 *  1. All characters must be digits.
 *  2. Length must be exactly 8 or 13.
 *  3. Starting from the rightmost digit (check digit), alternate
 *     multipliers of 1 and 3 are applied left-to-right, and the
 *     weighted sum must be divisible by 10.
 */
export function isValidEAN(code: string): boolean {
  if (!/^\d{8}$|^\d{13}$/.test(code)) {
    return false;
  }

  const digits = code.split('').map(Number);
  const sum = digits.reduce((acc, digit, i) => {
    // For EAN-13: positions 0,2,4,6,8,10,12 → weight 1; 1,3,5,7,9,11 → weight 3
    // For EAN-8:  positions 0,2,4,6 → weight 3; 1,3,5,7 → weight 1
    // Generalised: last digit index is even-length dependent, but the
    // standard rule is: from the right, odd positions get weight 1,
    // even positions get weight 3.  Equivalently, when iterating
    // left-to-right the weight pattern depends on total length.
    const weight = (code.length - 1 - i) % 2 === 0 ? 1 : 3;
    return acc + digit * weight;
  }, 0);

  return sum % 10 === 0;
}
