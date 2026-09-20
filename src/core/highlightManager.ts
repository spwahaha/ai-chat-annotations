import type { ProviderAdapter, SelectedReference } from '../types';
import { findQuoteRange } from './textRange';

type HighlightConstructor = new (...ranges: Range[]) => unknown;

export class HighlightManager {
  private readonly name = 'mrq-pending-reference';
  private references: SelectedReference[] = [];

  constructor(private readonly adapter: ProviderAdapter) {}

  update(references: SelectedReference[]): void {
    this.references = references;
    this.refresh();
  }

  refresh(): void {
    const ranges: Range[] = [];
    for (const reference of this.references) {
      if (!reference.range.startContainer.isConnected) {
        const source = this.adapter.findSourceElement(reference);
        if (source) {
          const range = findQuoteRange(source, reference.text, reference.prefix, reference.suffix);
          if (range) {
            reference.sourceElement = source;
            reference.range = range;
          }
        }
      }
      if (reference.range.startContainer.isConnected) ranges.push(reference.range);
    }

    const css = CSS as typeof CSS & {
      highlights?: { set(name: string, value: unknown): void; delete(name: string): void };
    };
    const HighlightClass = (globalThis as typeof globalThis & { Highlight?: HighlightConstructor }).Highlight;
    if (!css.highlights || !HighlightClass) return;
    if (ranges.length === 0) {
      css.highlights.delete(this.name);
      return;
    }
    css.highlights.set(this.name, new HighlightClass(...ranges));
  }

  clear(): void {
    const css = CSS as typeof CSS & { highlights?: { delete(name: string): void } };
    css.highlights?.delete(this.name);
    this.references = [];
  }
}
