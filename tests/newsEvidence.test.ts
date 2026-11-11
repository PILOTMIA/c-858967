import { expect, test } from 'bun:test';
import { currentNewsTimestamp } from '../supabase/functions/_shared/newsEvidence';
const now = Date.parse('2026-11-11T07:21:00Z');
test('undated and future news cannot be treated as current', () => {
  expect(currentNewsTimestamp('', now)).toBeNull();
  expect(currentNewsTimestamp('2026-11-12T00:00:00Z', now)).toBeNull();
});
test('news older than 72 hours is excluded, dated recent news is preserved', () => {
  expect(currentNewsTimestamp('2026-11-08T07:20:00Z', now)).toBeNull();
  expect(currentNewsTimestamp('2026-11-11T06:37:08Z', now)).toBe('2026-11-11T06:37:08.000Z');
});