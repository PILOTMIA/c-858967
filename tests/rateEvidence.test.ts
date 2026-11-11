import { expect, test } from 'bun:test';
import { latestRate, basisPointChange } from '../src/lib/rateEvidence';
test('failed and missing rate observations never become estimated yields', () => {
  expect(latestRate([])).toBeNull();
  expect(latestRate([{ date: '2026-11-10', value: '.' }])).toBeNull();
});
test('percentage-point yield differences convert to basis points', () => {
  expect(basisPointChange(4.5, 4.4)).toBe(10);
});
test('rate selection uses the provider observation date', () => {
  expect(latestRate([{ date: '2026-11-09', value: '4.4' }, { date: '2026-11-10', value: '4.5' }])).toEqual({ value: 4.5, date: '2026-11-10', previous: 4.4 });
});