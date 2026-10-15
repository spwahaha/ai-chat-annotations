import { BaseAdapter } from './baseAdapter';
import type { SelectedReference } from '../types';

function elementForNode(node: Node | null): HTMLElement | null {
  if (!node) return null;
  return node instanceof HTMLElement ? node : node.parentElement;
}

export class ChatGPTAdapter extends BaseAdapter {
  readonly id = 'chatgpt' as const;
  readonly displayName = 'ChatGPT';

  protected readonly responseSelectors = [
    '[data-message-role="assistant"]',
    '[data-message-author-role="assistant"]',
    '[data-role="assistant"]',
    '[data-message-author="assistant"]',
    '[data-testid="assistant-message"]',
    '[data-testid="assistant-turn"]',
    'article[data-testid^="conversation-turn"] [data-message-author-role="assistant"]',
    // Some account-specific ChatGPT variants omit role attributes while
    // retaining the rendered Markdown response surface. User messages use a
    // separate bubble, making this the safest structural fallback.
    'main .markdown',
    'main [class~="markdown"]',
    'main [class*="markdown-"]',
  ];

  protected readonly composerSelectors = [
    'textarea[data-mobile-composer-prompt]',
    '[data-composer-editor-host] textarea[name="prompt"]',
    '#prompt-textarea',
    'form [contenteditable="true"][role="textbox"]',
    'form div[contenteditable="true"]',
    'form textarea',
  ];

  protected readonly sendSelectors = [
    'button[data-composer-submit]',
    'button[data-testid="send-button"]',
    'button[aria-label="Send prompt"]',
    'button[aria-label*="Send"]',
  ];

  getSelectedReference(selection: Selection): SelectedReference | null {
    const strictMatch = super.getSelectedReference(selection);
    if (strictMatch) return strictMatch;
    if (!this.hasNativeSelectionAction() || selection.isCollapsed || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const commonNode = range.commonAncestorContainer;
    const commonElement = elementForNode(commonNode);
    if (!commonElement) return null;
    if (commonElement.closest('form, #prompt-textarea, [data-composer-editor-host]')) return null;

    const sourceElement = commonElement.closest<HTMLElement>(
      'p, li, pre, blockquote, h1, h2, h3, h4, h5, h6, [data-message-id], main',
    );
    if (!sourceElement) return null;

    const anchorElement = elementForNode(selection.anchorNode);
    const focusElement = elementForNode(selection.focusNode);
    if (!anchorElement || !focusElement || !sourceElement.contains(anchorElement) || !sourceElement.contains(focusElement)) {
      return null;
    }

    return this.createSelectedReference(selection, sourceElement);
  }

  private hasNativeSelectionAction(): boolean {
    if (document.querySelector(
      '[popover][style*="targeted-action-selection"], [data-selection-tooltip="true"]',
    )) return true;

    // The native action has changed classes several times and some variants
    // render it as a role=button element. Its label is the stable, visible
    // contract and is only consulted while the browser has a live selection.
    return [...document.querySelectorAll<HTMLElement>('button, [role="button"]')]
      .some((button) => button.textContent?.replace(/\s+/g, ' ').trim().toLowerCase() === 'ask chatgpt');
  }

  matchesPage(url: URL): boolean {
    return url.hostname === 'chatgpt.com' || url.hostname === 'chat.openai.com';
  }

  getConversationId(): string {
    const match = location.pathname.match(/\/(?:c|uc|g\/[^/]+\/c)\/([^/?#]+)/);
    return match?.[1] ?? `${location.pathname}${location.search}`;
  }
}
