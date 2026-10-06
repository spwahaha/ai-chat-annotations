import { BaseAdapter } from './baseAdapter';

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

  matchesPage(url: URL): boolean {
    return url.hostname === 'chatgpt.com' || url.hostname === 'chat.openai.com';
  }

  getConversationId(): string {
    const match = location.pathname.match(/\/(?:c|uc|g\/[^/]+\/c)\/([^/?#]+)/);
    return match?.[1] ?? `${location.pathname}${location.search}`;
  }
}
