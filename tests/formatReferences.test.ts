import { describe, expect, it } from 'vitest';
import { formatReferences, hasFormattedReferences } from '../src/core/formatReferences';
import { reference } from './helpers';

describe('formatReferences', () => {
  it('formats ordered multiline quotes and optional notes', () => {
    const output = formatReferences([
      reference({ text: 'First line\nSecond line', comment: 'Explain the distinction.' }),
      reference({ text: 'Another passage', comment: '' }),
    ]);

    expect(output).toContain('Referenced passages from earlier responses:');
    expect(output).toContain('[1]\n> First line\n> Second line');
    expect(output).toContain('Note: Explain the distinction.');
    expect(output).toContain('[2]\n> Another passage');
    expect(hasFormattedReferences(output)).toBe(true);
  });
});
