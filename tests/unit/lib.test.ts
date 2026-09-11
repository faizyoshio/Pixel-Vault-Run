import { expect, test } from 'vitest';
import { isPowerOfTwo } from '../../src/lib/utils';

test('isPowerOfTwo returns true for powers of two', () => {
  expect(isPowerOfTwo(8)).toBe(true);
  expect(isPowerOfTwo(16)).toBe(true);
  expect(isPowerOfTwo(1)).toBe(true);
});

test('isPowerOfTwo returns false for non-powers of two', () => {
  expect(isPowerOfTwo(10)).toBe(false);
  expect(isPowerOfTwo(0)).toBe(false);
  expect(isPowerOfTwo(-2)).toBe(false);
});