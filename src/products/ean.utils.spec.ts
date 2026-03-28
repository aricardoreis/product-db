import { isValidEAN } from './ean.utils';

describe('isValidEAN', () => {
  describe('valid EAN-13 codes', () => {
    it.each([
      '4006381333931', // Nivea
      '7891000315507', // Nescafé (Brazilian)
      '7891024134900', // Brazilian product
      '5901234123457', // Example from GS1 spec
    ])('should return true for %s', (code) => {
      expect(isValidEAN(code)).toBe(true);
    });
  });

  describe('valid EAN-8 codes', () => {
    it.each([
      '96385074',
      '55123457',
    ])('should return true for %s', (code) => {
      expect(isValidEAN(code)).toBe(true);
    });
  });

  describe('invalid checksum', () => {
    it.each([
      '4006381333932', // last digit off by 1
      '7891000315500', // wrong check digit
      '96385075',      // EAN-8 wrong check digit
    ])('should return false for %s (bad checksum)', (code) => {
      expect(isValidEAN(code)).toBe(false);
    });
  });

  describe('wrong length', () => {
    it.each([
      '123',           // too short
      '123456789',     // 9 digits
      '12345678901',   // 11 digits
      '12345678901234', // 14 digits
    ])('should return false for %s (wrong length)', (code) => {
      expect(isValidEAN(code)).toBe(false);
    });
  });

  describe('non-numeric input', () => {
    it.each([
      'ABCDEFGHIJKLM', // letters, 13 chars
      '400638133393A',  // trailing letter
      '9638507!',       // special char
      '',               // empty
    ])('should return false for %s (non-numeric)', (code) => {
      expect(isValidEAN(code)).toBe(false);
    });
  });

  describe('store-internal codes (not real EANs)', () => {
    it('should reject a 13-digit store code with invalid checksum', () => {
      expect(isValidEAN('0000000012345')).toBe(false);
    });

    it('should reject an 8-digit store code with invalid checksum', () => {
      expect(isValidEAN('00001234')).toBe(false);
    });
  });
});
