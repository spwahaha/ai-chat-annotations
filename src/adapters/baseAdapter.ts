import type {
  ComposerHandle,
  ProviderAdapter,
  ProviderId,
  SelectedReference,
} from '../types';
import { findQuoteRange, normalizeSelectionText } from '../core/textRange';

function randomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `ref-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function isHTMLElement(node: Node | null): node is HTMLElement {
  return node instanceof HTMLElement;
}

function elementForNode(node: Node | null): HTMLElement | null {
  if (!node) return null;
  return isHTMLElement(node) ? node : node.parentElement;
}

function visible(element: Element): boolean {
  const html = element as HTMLElement;
  if (html.hidden || html.getAttribute('aria-hidden') === 'true') return false;
  const style = getComputedStyle(html);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

function escapeAttribute(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export abstract class BaseAdapter implements ProviderAdapter {
  abstract readonly id: ProviderId;
  abstract readonly displayName: string;
  protected abstract readonly responseSelectors: string[];
  protected abstract readonly composerSelectors: string[];
  protected abstract readonly sendSelectors: string[];

  abstract matchesPage(url: URL): boolean;
  abstract getConversationId(): string;

  getResponseElements(): HTMLElement[] {
    const seen = new Set<HTMLElement>();
    const results: HTMLElement[] = [];
    for (const selector of this.responseSelectors) {
      for (const element of document.querySelectorAll<HTMLElement>(selector)) {
        const nestedInKnownResponse = results.some((response) => response.contains(element));
        if (!seen.has(element) && !nestedInKnownResponse && visible(element)) {
          seen.add(element);
          results.push(element);
        }
      }
    }
    return results;
  }

  protected findResponseForNode(node: Node | null): HTMLElement | null {
    const element = elementForNode(node);
    if (!element) return null;
    for (const selector of this.responseSelectors) {
      const response = element.closest<HTMLElement>(selector);
      if (response) return response;
    }
    return null;
  }

  getSelectedReference(selection: Selection): SelectedReference | null {
    if (selection.isCollapsed || selection.rangeCount === 0) return null;
    const sourceElement = this.findResponseForNode(selection.anchorNode);
    const focusElement = this.findResponseForNode(selection.focusNode);
    if (!sourceElement || sourceElement !== focusElement) return null;

    const text = normalizeSelectionText(selection.toString());
    if (text.length < 2 || text.length > 4_000) return null;

    const range = selection.getRangeAt(0).cloneRange();
    const beforeRange = document.createRange();
    beforeRange.selectNodeContents(sourceElement);
    try {
      beforeRange.setEnd(range.startContainer, range.startOffset);
    } catch {
      return null;
    }

    const messageText = sourceElement.textContent ?? '';
    const startOffset = beforeRange.toString().length;
    const prefix = messageText.slice(Math.max(0, startOffset - 48), startOffset);
    const suffix = messageText.slice(startOffset + text.length, startOffset + text.length + 48);
    const sourceMessageId = (
      sourceElement.getAttribute('data-message-id') ??
      sourceElement.getAttribute('data-testid') ??
      sourceElement.id
    ) || null;
    const sourceMessageIndex = this.getResponseElements().indexOf(sourceElement);

    return {
      id: randomId(),
      provider: this.id,
      conversationId: this.getConversationId(),
      sourceMessageId,
      sourceMessageIndex,
      text,
      prefix,
      suffix,
      comment: '',
      order: 0,
      createdAt: Date.now(),
      sourceElement,
      range,
    };
  }

  findSourceElement(reference: SelectedReference): HTMLElement | null {
    if (reference.sourceElement.isConnected) return reference.sourceElement;
    const matchesQuote = (element: HTMLElement | null): element is HTMLElement => Boolean(
      element && findQuoteRange(element, reference.text, reference.prefix, reference.suffix),
    );
    if (reference.sourceMessageId) {
      const escaped = escapeAttribute(reference.sourceMessageId);
      const byId = document.querySelector<HTMLElement>(
        `[data-message-id="${escaped}"], [data-testid="${escaped}"], [id="${escaped}"]`,
      );
      if (matchesQuote(byId)) return byId;
    }
    const responses = this.getResponseElements();
    const byIndex = responses[reference.sourceMessageIndex] ?? null;
    if (matchesQuote(byIndex)) return byIndex;
    return responses.find(matchesQuote) ?? null;
  }

  locateComposer(): ComposerHandle | null {
    let element: HTMLElement | null = null;
    for (const selector of this.composerSelectors) {
      const candidates = [...document.querySelectorAll<HTMLElement>(selector)];
      element = candidates.find(visible) ?? null;
      if (element) break;
    }
    if (!element) return null;

    const scope = element.closest('form') ?? element.parentElement?.parentElement ?? document;
    let sendButton: HTMLElement | null = null;
    for (const selector of this.sendSelectors) {
      const candidates = [...scope.querySelectorAll<HTMLElement>(selector)];
      sendButton = candidates.find((candidate) => visible(candidate) && !candidate.hasAttribute('disabled')) ?? null;
      if (sendButton) break;
    }
    if (!sendButton) {
      for (const selector of this.sendSelectors) {
        sendButton = [...document.querySelectorAll<HTMLElement>(selector)].find(visible) ?? null;
        if (sendButton) break;
      }
    }
    return { element, sendButton };
  }

  isSendControl(target: EventTarget | null): boolean {
    const element = target instanceof Element ? target : null;
    if (!element) return false;
    const composer = this.locateComposer();
    if (!composer?.sendButton) return false;
    return element === composer.sendButton || composer.sendButton.contains(element);
  }

  shouldSubmitOnKeydown(event: KeyboardEvent): boolean {
    if (event.key !== 'Enter' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey || event.isComposing) {
      return false;
    }
    const composer = this.locateComposer()?.element;
    return Boolean(composer && event.target instanceof Node && composer.contains(event.target));
  }

  readComposerText(element = this.locateComposer()?.element): string {
    if (!element) return '';
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) return element.value;
    return element.innerText || element.textContent || '';
  }

  appendToComposer(text: string): boolean {
    const composer = this.locateComposer()?.element;
    if (!composer) return false;
    const current = this.readComposerText(composer);
    const insertion = current.trim() ? text : text.trimStart();
    const insertedSuccessfully = (): boolean => {
      const expected = insertion.replace(/\s+/g, ' ').trim();
      const actual = this.readComposerText(composer).replace(/\s+/g, ' ').trim();
      return expected.length > 0 && actual.includes(expected.slice(0, Math.min(80, expected.length)));
    };

    if (composer instanceof HTMLTextAreaElement || composer instanceof HTMLInputElement) {
      const prototype = composer instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;
      const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
      setter?.call(composer, current + insertion);
      composer.dispatchEvent(new Event('input', { bubbles: true }));
      composer.focus();
      composer.setSelectionRange(composer.value.length, composer.value.length);
      return insertedSuccessfully();
    }

    composer.focus();
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(composer);
    range.collapse(false);
    selection?.removeAllRanges();
    selection?.addRange(range);

    let inserted = false;
    try {
      inserted = typeof document.execCommand === 'function' && document.execCommand('insertText', false, insertion);
    } catch {
      inserted = false;
    }

    if (!inserted) {
      range.insertNode(document.createTextNode(insertion));
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    const event = typeof InputEvent === 'function'
      ? new InputEvent('input', { bubbles: true, data: insertion, inputType: 'insertText' })
      : new Event('input', { bubbles: true });
    composer.dispatchEvent(event);
    return insertedSuccessfully();
  }
}
