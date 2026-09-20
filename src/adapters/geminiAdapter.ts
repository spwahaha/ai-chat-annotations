import { BaseAdapter } from './baseAdapter';

export class GeminiAdapter extends BaseAdapter {
  readonly id = 'gemini' as const;
  readonly displayName = 'Gemini';

  protected readonly responseSelectors = [
    'model-response',
    '.model-response',
    '[data-test-id="model-response"]',
    'message-content',
    '.response-container .markdown',
  ];

  protected readonly composerSelectors = [
    'rich-textarea .ql-editor[contenteditable="true"]',
    '.input-area-container [contenteditable="true"][role="textbox"]',
    '[contenteditable="true"][aria-label*="prompt" i]',
    'textarea[aria-label*="prompt" i]',
  ];

  protected readonly sendSelectors = [
    'button.send-button',
    'button[aria-label="Send message"]',
    'button[aria-label*="Send"]',
    '[data-test-id="send-button"]',
  ];

  matchesPage(url: URL): boolean {
    return url.hostname === 'gemini.google.com';
  }

  getConversationId(): string {
    const match = location.pathname.match(/\/app\/([^/?#]+)/);
    return match?.[1] ?? `${location.pathname}${location.search}`;
  }
}
