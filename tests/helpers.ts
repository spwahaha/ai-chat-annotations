import type { SelectedReference } from '../src/types';

export function reference(overrides: Partial<SelectedReference> = {}): SelectedReference {
  const sourceElement = document.createElement('article');
  const text = document.createTextNode(overrides.text ?? 'A selected passage');
  sourceElement.appendChild(text);
  document.body.appendChild(sourceElement);
  const range = document.createRange();
  range.selectNodeContents(text);
  return {
    id: crypto.randomUUID(),
    provider: 'chatgpt',
    conversationId: 'conversation',
    sourceMessageId: 'message-1',
    sourceMessageIndex: 0,
    text: text.data,
    prefix: '',
    suffix: '',
    comment: '',
    order: 1,
    createdAt: Date.now(),
    sourceElement,
    range,
    ...overrides,
  };
}

export function selectText(element: HTMLElement, text: string): void {
  const node = [...element.childNodes].find((candidate) => candidate.textContent?.includes(text));
  if (!node || node.nodeType !== Node.TEXT_NODE) throw new Error(`Text node not found: ${text}`);
  const start = node.textContent!.indexOf(text);
  const range = document.createRange();
  range.setStart(node, start);
  range.setEnd(node, start + text.length);
  const selection = window.getSelection()!;
  selection.removeAllRanges();
  selection.addRange(range);
}

export async function tick(ms = 0): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
