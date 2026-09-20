export function normalizeSelectionText(text: string): string {
  return text.replace(/\u00a0/g, ' ').replace(/[ \t]+\n/g, '\n').trim();
}

export function createTextRange(root: HTMLElement, start: number, end: number): Range | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let offset = 0;
  let startNode: Text | null = null;
  let endNode: Text | null = null;
  let startOffset = 0;
  let endOffset = 0;

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const nextOffset = offset + node.data.length;
    if (!startNode && start >= offset && start <= nextOffset) {
      startNode = node;
      startOffset = Math.min(start - offset, node.data.length);
    }
    if (end >= offset && end <= nextOffset) {
      endNode = node;
      endOffset = Math.min(end - offset, node.data.length);
      break;
    }
    offset = nextOffset;
  }

  if (!startNode || !endNode) return null;
  const range = document.createRange();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range;
}

export function findQuoteRange(
  root: HTMLElement,
  text: string,
  prefix = '',
  suffix = '',
): Range | null {
  const content = root.textContent ?? '';
  const occurrences: number[] = [];
  let from = 0;
  while (from <= content.length) {
    const index = content.indexOf(text, from);
    if (index < 0) break;
    occurrences.push(index);
    from = index + Math.max(1, text.length);
  }
  if (occurrences.length === 0) return null;

  const best = occurrences.find((index) => {
    const before = content.slice(Math.max(0, index - prefix.length), index);
    const after = content.slice(index + text.length, index + text.length + suffix.length);
    return (!prefix || before.endsWith(prefix)) && (!suffix || after.startsWith(suffix));
  }) ?? occurrences[0];

  return createTextRange(root, best, best + text.length);
}
