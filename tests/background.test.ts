import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('background reinjection', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllGlobals();
  });

  it('injects the current content script into supported tabs after extension reload', async () => {
    let onInstalled: (() => void) | undefined;
    const executeScript = vi.fn().mockResolvedValue([]);
    const query = vi.fn().mockResolvedValue([{ id: 7 }, { id: 11 }, {}]);

    vi.stubGlobal('chrome', {
      runtime: {
        onInstalled: { addListener: (listener: () => void) => { onInstalled = listener; } },
        onStartup: { addListener: vi.fn() },
      },
      tabs: { query },
      scripting: { executeScript },
    });

    // This is the exact plain-JavaScript service worker shipped to Chrome.
    // @ts-expect-error The JavaScript module intentionally has no declaration file.
    await import('../background.js');
    onInstalled?.();

    await vi.waitFor(() => expect(executeScript).toHaveBeenCalledTimes(2));
    expect(query).toHaveBeenCalledWith({
      url: [
        'https://chatgpt.com/*',
        'https://chat.openai.com/*',
        'https://gemini.google.com/*',
      ],
    });
    expect(executeScript).toHaveBeenCalledWith({
      target: { tabId: 7 },
      files: ['content.js'],
    });
  });
});
