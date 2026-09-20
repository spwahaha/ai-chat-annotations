import { afterEach } from 'vitest';

class MockHighlight {
  readonly ranges: Range[];
  constructor(...ranges: Range[]) {
    this.ranges = ranges;
  }
}

const registry = new Map<string, unknown>();
Object.defineProperty(globalThis, 'Highlight', { value: MockHighlight, configurable: true });
if (!globalThis.CSS) {
  Object.defineProperty(globalThis, 'CSS', { value: {}, configurable: true });
}
Object.defineProperty(CSS, 'highlights', {
  value: {
    set: (name: string, value: unknown) => registry.set(name, value),
    delete: (name: string) => registry.delete(name),
  },
  configurable: true,
});

Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  value: () => undefined,
  configurable: true,
});

Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
  value: () => ({
    x: 100,
    y: 100,
    top: 100,
    right: 260,
    bottom: 120,
    left: 100,
    width: 160,
    height: 20,
    toJSON: () => ({}),
  }),
  configurable: true,
});

afterEach(() => {
  document.body.replaceChildren();
  document.head.replaceChildren();
  registry.clear();
  window.getSelection()?.removeAllRanges();
});
