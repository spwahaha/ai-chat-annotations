import { describe, expect, it } from 'vitest';
import { createTextRange, findQuoteRange, normalizeSelectionText } from '../src/core/textRange';

describe('text range anchoring', () => {
  it('creates ranges across nested text nodes', () => {
    const root = document.createElement('div');
    root.innerHTML = 'Alpha <strong>selected</strong> passage omega';
    document.body.appendChild(root);
    expect(createTextRange(root, 6, 22)?.toString()).toBe('selected passage');
  });

  it('uses prefix and suffix context to re-anchor repeated words', () => {
    const root = document.createElement('div');
    root.textContent = 'first repeated words here; later repeated words there';
    document.body.appendChild(root);
    const range = findQuoteRange(root, 'repeated words', 'here; later ', ' there');
    expect(range?.toString()).toBe('repeated words');
    expect(range?.startOffset).toBe(root.textContent!.lastIndexOf('repeated words'));
  });

  it('normalizes copied whitespace without collapsing meaningful line breaks', () => {
    expect(normalizeSelectionText('  A\u00a0phrase \t\nnext  ')).toBe('A phrase\nnext');
  });
});
