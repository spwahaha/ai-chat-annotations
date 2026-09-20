import { describe, expect, it } from 'vitest';
import { ChatGPTAdapter } from '../src/adapters/chatgptAdapter';
import { AnnotationController } from '../src/core/annotationController';
import { selectText, tick } from './helpers';

describe('AnnotationController', () => {
  it('collects multiple references with notes and submits them with the normal Send button', async () => {
    document.body.innerHTML = `
      <article><div data-message-author-role="assistant" data-message-id="m1">Alpha first selected passage omega</div></article>
      <article><div data-message-author-role="assistant" data-message-id="m2">Beta second selected passage gamma</div></article>
      <form>
        <textarea id="prompt-textarea">Compare them</textarea>
        <button type="button" data-testid="send-button">Send</button>
      </form>
    `;
    window.history.replaceState({}, '', '/c/controller-test');
    const controller = new AnnotationController(new ChatGPTAdapter());
    controller.start();

    const responses = document.querySelectorAll<HTMLElement>('[data-message-author-role="assistant"]');
    for (const [element, text] of [
      [responses[0], 'first selected passage'],
      [responses[1], 'second selected passage'],
    ] as const) {
      selectText(element, text);
      document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      await tick();
      const actionHost = document.querySelector<HTMLDivElement>('#mrq-selection-action')!;
      actionHost.shadowRoot!.querySelector<HTMLButtonElement>('button')!.click();
      await tick();
    }

    expect(controller.getReferencesForTesting()).toHaveLength(2);
    const shelf = document.querySelector<HTMLDivElement>('#mrq-reference-shelf')!;
    expect(shelf.shadowRoot!.querySelectorAll('.marker')).toHaveLength(2);
    expect(shelf.shadowRoot!.querySelectorAll('.panel')).toHaveLength(1);
    const note = shelf.shadowRoot!.querySelector<HTMLInputElement>('input')!;
    note.value = 'Explain this one.';
    note.dispatchEvent(new Event('input', { bubbles: true }));
    note.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(shelf.shadowRoot!.querySelectorAll('.panel')).toHaveLength(0);

    const send = document.querySelector<HTMLButtonElement>('[data-testid="send-button"]')!;
    let sentText = '';
    send.addEventListener('click', () => {
      const composer = document.querySelector<HTMLTextAreaElement>('#prompt-textarea')!;
      sentText = composer.value;
      composer.value = '';
      composer.dispatchEvent(new Event('input', { bubbles: true }));
    });
    send.click();
    await tick(350);

    expect(sentText).toContain('Compare them');
    expect(sentText).toContain('[1]\n> first selected passage');
    expect(sentText).toContain('Note: Explain this one.');
    expect(sentText).toContain('[2]\n> second selected passage');
    expect(controller.getReferencesForTesting()).toHaveLength(0);
    controller.destroy();
  });
});
