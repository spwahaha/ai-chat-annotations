import { BaseAdapter } from './baseAdapter';

export class ChatGPTAdapter extends BaseAdapter {
  readonly id = 'chatgpt' as const;
  readonly displayName = 'ChatGPT';

  protected readonly responseSelectors = [
    '[data-message-role="assistant"]',
    '[data-message-author-role="assistant"]',
    'article[data-testid^="conversation-turn"] [data-message-author-role="assistant"]',
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
