import { describe, expect, it, vi } from 'vitest';
import { ReferenceStore } from '../src/core/referenceStore';
import { reference } from './helpers';

describe('ReferenceStore', () => {
  it('numbers, removes, comments, deduplicates, and isolates conversations', () => {
    const store = new ReferenceStore('chatgpt:a');
    const listener = vi.fn();
    store.subscribe(listener);
    const one = reference({ id: 'one', sourceMessageId: 'm1', text: 'One', prefix: 'first ' });
    const two = reference({ id: 'two', sourceMessageId: 'm2', text: 'Two' });

    expect(store.add(one)).toBe(true);
    expect(store.add(reference({ sourceMessageId: 'm1', text: 'One', prefix: 'first ' }))).toBe(false);
    expect(store.add(reference({ id: 'same-words-elsewhere', sourceMessageId: 'm1', text: 'One', prefix: 'later ' }))).toBe(true);
    expect(store.add(two)).toBe(true);
    store.updateComment('two', 'A note');
    expect(store.getAll().map((item) => [item.order, item.comment])).toEqual([
      [1, ''],
      [2, ''],
      [3, 'A note'],
    ]);

    store.remove('one');
    expect(store.getAll()[0].order).toBe(1);
    store.setConversation('chatgpt:b');
    expect(store.getAll()).toEqual([]);
    store.setConversation('chatgpt:a');
    expect(store.getAll().map((item) => item.id)).toEqual(['same-words-elsewhere', 'two']);
    expect(listener).toHaveBeenCalled();
  });

  it('enforces the per-question reference limit', () => {
    const store = new ReferenceStore('chatgpt:limit');
    for (let index = 0; index < 20; index += 1) {
      expect(store.add(reference({ id: `ref-${index}`, text: `Passage ${index}`, sourceMessageIndex: index }))).toBe(true);
    }
    expect(store.add(reference({ id: 'overflow', text: 'One too many', sourceMessageIndex: 21 }))).toBe(false);
    expect(store.getAll()).toHaveLength(20);
  });
});
