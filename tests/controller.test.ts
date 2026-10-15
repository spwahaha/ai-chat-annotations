import { describe, expect, it } from 'vitest';
import { ChatGPTAdapter } from '../src/adapters/chatgptAdapter';
import { AnnotationController } from '../src/core/annotationController';
import { selectText, tick } from './helpers';

describe('AnnotationController', () => {
  it('captures after ChatGPT adds its native selection action for an unknown response wrapper', async () => {
    document.body.innerHTML = `
      <main><div id="unknown-response">Alpha captured from native action omega</div></main>
      <form><textarea id="prompt-textarea"></textarea><button data-testid="send-button">Send</button></form>
    `;
    const controller = new AnnotationController(new ChatGPTAdapter());
    controller.start();

    const response = document.querySelector<HTMLElement>('#unknown-response')!;
    selectText(response, 'captured from native action');
    response.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    await tick();

    const actionHost = document.querySelector<HTMLDivElement>('#mrq-selection-action')!;
    expect(actionHost.style.display).toBe('none');

    const nativeAction = document.createElement('div');
    nativeAction.setAttribute('popover', 'manual');
    nativeAction.style.setProperty('--targeted-action-selection', '1');
    nativeAction.innerHTML = '<button class="btn-secondary">Ask ChatGPT</button>';
    document.body.appendChild(nativeAction);
    await tick();

    expect(actionHost.style.display).toBe('block');
    actionHost.shadowRoot!.querySelector<HTMLButtonElement>('button')!.click();
    expect(controller.getReferencesForTesting()).toHaveLength(1);
    expect(controller.getReferencesForTesting()[0].text).toBe('captured from native action');
    controller.destroy();
  });

  it('waits for ChatGPT to activate a pre-rendered native selection action', async () => {
    document.body.innerHTML = `
      <main><div id="unknown-delayed-response">Alpha delayed native action omega</div></main>
      <div id="native-action"><span role="button">Start writing</span></div>
      <form><textarea id="prompt-textarea"></textarea><button data-testid="send-button">Send</button></form>
    `;
    const controller = new AnnotationController(new ChatGPTAdapter());
    controller.start();

    const response = document.querySelector<HTMLElement>('#unknown-delayed-response')!;
    selectText(response, 'delayed native action');
    response.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    await tick();

    const actionHost = document.querySelector<HTMLDivElement>('#mrq-selection-action')!;
    expect(actionHost.style.display).toBe('none');

    await tick(100);
    const nativeAction = document.querySelector<HTMLElement>('#native-action')!;
    nativeAction.setAttribute('popover', 'manual');
    nativeAction.style.setProperty('position-anchor', '--targeted-action-selection');
    nativeAction.querySelector<HTMLElement>('[role="button"]')!.textContent = 'Ask ChatGPT';
    await tick(100);

    expect(actionHost.style.display).toBe('block');
    actionHost.shadowRoot!.querySelector<HTMLButtonElement>('button')!.click();
    expect(controller.getReferencesForTesting()).toHaveLength(1);
    expect(controller.getReferencesForTesting()[0].text).toBe('delayed native action');
    controller.destroy();
  });

  it('keeps the captured passage when ChatGPT clears the browser selection on mouseup', async () => {
    document.body.innerHTML = `
      <ol data-conversation-transcript>
        <li data-message-role="assistant" id="selection-race-message">
          <div data-assistant-markdown>Alpha passage captured before native popup omega</div>
        </li>
      </ol>
      <form data-mobile-composer>
        <textarea data-mobile-composer-prompt></textarea>
        <button data-composer-submit>Send</button>
      </form>
    `;
    window.history.replaceState({}, '', '/c/selection-race-test');
    const controller = new AnnotationController(new ChatGPTAdapter());
    controller.start();

    const response = document.querySelector<HTMLElement>('[data-assistant-markdown]')!;
    response.addEventListener('mouseup', () => window.getSelection()?.removeAllRanges());
    selectText(response, 'passage captured before native popup');
    response.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    await tick();

    const actionHost = document.querySelector<HTMLDivElement>('#mrq-selection-action')!;
    expect(actionHost.style.display).toBe('block');
    actionHost.shadowRoot!.querySelector<HTMLButtonElement>('button')!.click();
    expect(controller.getReferencesForTesting()).toHaveLength(1);
    expect(controller.getReferencesForTesting()[0].text).toBe('passage captured before native popup');
    controller.destroy();
  });

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
