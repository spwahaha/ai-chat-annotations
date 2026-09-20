import { chromium, expect, test, type BrowserContext, type Locator } from '@playwright/test';

const extensionPath = decodeURIComponent(new URL('../../dist/', import.meta.url).pathname.replace(/\/$/, ''));

type ProviderFixture = {
  url: string;
  responseSelector: string;
  composerSelector: string;
  html: string;
  submit: 'button' | 'enter';
};

const sharedStyles = `
  body { font: 16px/1.5 system-ui; margin: 40px auto; max-width: 760px; }
  article, model-response { display: block; margin: 24px 0; padding: 16px; }
  form, .input-area-container { background: white; bottom: 12px; padding: 12px; position: fixed; width: 680px; }
  textarea, [contenteditable] { border: 1px solid #999; display: block; min-height: 70px; padding: 8px; width: 620px; }
`;

const fixtures: Record<'chatgpt' | 'gemini', ProviderFixture> = {
  chatgpt: {
    url: 'https://chatgpt.com/c/e2e-conversation',
    responseSelector: '[data-message-author-role="assistant"]',
    composerSelector: '#prompt-textarea',
    submit: 'button',
    html: `<!doctype html><style>${sharedStyles}</style>
      <article><div data-message-author-role="assistant" data-message-id="c1">Alpha first selected passage omega.</div></article>
      <article><div data-message-author-role="assistant" data-message-id="c2">Beta second selected passage gamma.</div></article>
      <form>
        <textarea id="prompt-textarea">Compare the passages</textarea>
        <button type="button" data-testid="send-button">Send</button>
      </form>
      <script>
        window.sentMessages = [];
        document.querySelector('[data-testid="send-button"]').addEventListener('click', () => {
          const composer = document.querySelector('#prompt-textarea');
          window.sentMessages.push(composer.value);
          composer.value = '';
          composer.dispatchEvent(new Event('input', { bubbles: true }));
        });
      </script>`,
  },
  gemini: {
    url: 'https://gemini.google.com/app/e2e-conversation',
    responseSelector: 'model-response',
    composerSelector: 'rich-textarea .ql-editor',
    submit: 'enter',
    html: `<!doctype html><style>${sharedStyles}</style>
      <model-response data-test-id="model-response"><message-content>Alpha first selected passage omega.</message-content></model-response>
      <model-response data-test-id="model-response"><message-content>Beta second selected passage gamma.</message-content></model-response>
      <div class="input-area-container">
        <rich-textarea><div class="ql-editor" contenteditable="true" role="textbox">Compare the passages</div></rich-textarea>
        <button type="button" class="send-button" aria-label="Send message">Send</button>
      </div>
      <script>
        window.sentMessages = [];
        document.querySelector('.send-button').addEventListener('click', () => {
          const composer = document.querySelector('rich-textarea .ql-editor');
          window.sentMessages.push(composer.innerText);
          composer.innerHTML = '';
          composer.dispatchEvent(new Event('input', { bubbles: true }));
        });
      </script>`,
  },
};

async function launchExtension(profilePath: string): Promise<BrowserContext> {
  return chromium.launchPersistentContext(profilePath, {
    channel: 'chromium',
    headless: true,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`,
    ],
  });
}

async function selectText(locator: Locator, phrase: string): Promise<void> {
  await locator.evaluate((element, selectedPhrase) => {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    let node: Node | null = walker.nextNode();
    while (node && !node.textContent?.includes(selectedPhrase)) node = walker.nextNode();
    if (!node?.textContent) throw new Error(`Could not find ${selectedPhrase}`);
    const start = node.textContent.indexOf(selectedPhrase);
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, start + selectedPhrase.length);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    element.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  }, phrase);
}

for (const [provider, fixture] of Object.entries(fixtures)) {
  test(`${provider}: multiple references are automatically included by normal Send`, async ({}, testInfo) => {
    const context = await launchExtension(testInfo.outputPath('profile'));
    try {
      await context.route(`${new URL(fixture.url).origin}/**`, (route) => route.fulfill({
        body: fixture.html,
        contentType: 'text/html',
      }));
      const page = context.pages()[0] ?? await context.newPage();
      await page.goto(fixture.url);

      await expect(page.locator('#mrq-selection-action')).toBeAttached();
      const responses = page.locator(fixture.responseSelector);
      await selectText(responses.nth(0), 'first selected passage');
      await page.locator('#mrq-selection-action').getByRole('button', { name: /Add to question/ }).click();
      const shelf = page.locator('#mrq-reference-shelf');
      await shelf.getByLabel('Note for reference 1').fill('Use this as the baseline.');
      await shelf.getByLabel('Note for reference 1').press('Enter');
      await selectText(responses.nth(1), 'second selected passage');
      await page.locator('#mrq-selection-action').getByRole('button', { name: /Add to question/ }).click();
      await shelf.getByLabel('Note for reference 2').press('Enter');

      await expect(shelf.getByRole('button', { name: 'Open reference 1' })).toBeVisible();
      await expect(shelf.getByRole('button', { name: 'Open reference 2' })).toBeVisible();
      await expect(shelf.getByRole('region')).toHaveCount(0);
      const firstPhraseRect = await responses.nth(0).evaluate((element) => {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        let node: Node | null = walker.nextNode();
        while (node && !node.textContent?.includes('first selected passage')) node = walker.nextNode();
        if (!node?.textContent) throw new Error('Phrase text node not found');
        const start = node.textContent.indexOf('first selected passage');
        const range = document.createRange();
        range.setStart(node, start);
        range.setEnd(node, start + 'first selected passage'.length);
        return range.getBoundingClientRect().toJSON();
      });
      const firstMarkerRect = await shelf.getByRole('button', { name: 'Open reference 1' })
        .evaluate((element) => element.getBoundingClientRect().toJSON());
      expect(firstMarkerRect.width).toBeGreaterThan(0);
      expect(Math.abs(firstMarkerRect.y - firstPhraseRect.y)).toBeLessThan(12);
      expect(firstMarkerRect.x).toBeGreaterThanOrEqual(firstPhraseRect.right);
      await shelf.getByRole('button', { name: 'Open reference 1' }).click();
      await expect(shelf.getByLabel('Note for reference 1')).toHaveValue('Use this as the baseline.');
      await page.locator(fixture.composerSelector).click();
      await expect(shelf.getByRole('region')).toHaveCount(0);
      if (fixture.submit === 'button') {
        await page.getByRole('button', { name: 'Send', exact: true }).click();
      } else {
        await page.locator(fixture.composerSelector).press('Enter');
      }

      await expect.poll(() => page.evaluate(() => (window as typeof window & { sentMessages: string[] }).sentMessages.length)).toBe(1);
      const sent = await page.evaluate(() => (window as typeof window & { sentMessages: string[] }).sentMessages[0]);
      expect(sent).toContain('Compare the passages');
      expect(sent).toContain('[1]\n> first selected passage');
      expect(sent).toContain('Note: Use this as the baseline.');
      expect(sent).toContain('[2]\n> second selected passage');
      await expect(shelf).toBeHidden();
    } finally {
      await context.close();
    }
  });
}

test('chatgpt: a reference-only question sends without a false insertion error', async ({}, testInfo) => {
  const fixture = fixtures.chatgpt;
  const context = await launchExtension(testInfo.outputPath('profile'));
  try {
    await context.route(`${new URL(fixture.url).origin}/**`, (route) => route.fulfill({
      body: fixture.html.replace('>Compare the passages</textarea>', '></textarea>'),
      contentType: 'text/html',
    }));
    const page = context.pages()[0] ?? await context.newPage();
    await page.goto(fixture.url);
    await expect(page.locator('#mrq-selection-action')).toBeAttached();

    await selectText(page.locator(fixture.responseSelector).first(), 'first selected passage');
    await page.locator('#mrq-selection-action').getByRole('button', { name: /Add to question/ }).click();
    const shelf = page.locator('#mrq-reference-shelf');
    await shelf.getByLabel('Note for reference 1').press('Enter');
    await page.locator(fixture.composerSelector).press('Enter');

    await expect.poll(() => page.evaluate(() => (window as typeof window & { sentMessages: string[] }).sentMessages.length)).toBe(1);
    const sent = await page.evaluate(() => (window as typeof window & { sentMessages: string[] }).sentMessages[0]);
    expect(sent).toMatch(/^---\nReferenced passages from earlier responses:/);
    expect(sent).toContain('[1]\n> first selected passage');
    await expect(page.getByText('Could not add the references. Nothing was sent')).toHaveCount(0);
    await expect(shelf).toBeHidden();
  } finally {
    await context.close();
  }
});
