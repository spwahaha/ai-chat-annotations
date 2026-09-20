import { beforeEach, describe, expect, it } from 'vitest';
import { ChatGPTAdapter } from '../src/adapters/chatgptAdapter';
import { GeminiAdapter } from '../src/adapters/geminiAdapter';
import { selectText } from './helpers';

describe('provider adapters', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/');
  });

  it('captures a ChatGPT assistant selection and appends to its composer', () => {
    document.body.innerHTML = `
      <article data-testid="conversation-turn-2">
        <div data-message-author-role="assistant" data-message-id="chat-message">Alpha selected phrase omega</div>
      </article>
      <form><textarea id="prompt-textarea">My question</textarea><button data-testid="send-button">Send</button></form>
    `;
    window.history.replaceState({}, '', '/c/conversation-id');
    const adapter = new ChatGPTAdapter();
    const response = document.querySelector<HTMLElement>('[data-message-author-role="assistant"]')!;
    selectText(response, 'selected phrase');

    const captured = adapter.getSelectedReference(window.getSelection()!);
    expect(captured?.text).toBe('selected phrase');
    expect(captured?.sourceMessageId).toBe('chat-message');
    expect(adapter.getConversationId()).toBe('conversation-id');
    expect(adapter.appendToComposer('\n\nReferences')).toBe(true);
    expect(adapter.readComposerText()).toBe('My question\n\nReferences');
    expect(adapter.locateComposer()?.sendButton?.textContent).toBe('Send');
  });

  it('accepts a reference block as the entire ChatGPT message', () => {
    document.body.innerHTML = `
      <form><textarea id="prompt-textarea"></textarea><button data-testid="send-button">Send</button></form>
    `;
    const adapter = new ChatGPTAdapter();
    const payload = '\n\n---\nReferenced passages from earlier responses:\n\n[1]\n> Only reference';
    expect(adapter.appendToComposer(payload)).toBe(true);
    expect(adapter.readComposerText()).toBe(payload.trimStart());
  });

  it('captures a Gemini model response and locates the rich composer', () => {
    document.body.innerHTML = `
      <model-response id="gemini-response">Gemini selected passage here</model-response>
      <div class="input-area-container">
        <rich-textarea><div class="ql-editor" role="textbox" contenteditable="true">Compare these</div></rich-textarea>
        <button class="send-button" aria-label="Send message">Send</button>
      </div>
    `;
    window.history.replaceState({}, '', '/app/gemini-conversation');
    const adapter = new GeminiAdapter();
    const response = document.querySelector<HTMLElement>('model-response')!;
    selectText(response, 'selected passage');

    const captured = adapter.getSelectedReference(window.getSelection()!);
    expect(captured?.text).toBe('selected passage');
    expect(captured?.sourceMessageId).toBe('gemini-response');
    expect(adapter.getConversationId()).toBe('gemini-conversation');
    expect(adapter.appendToComposer('\n\nReferences')).toBe(true);
    expect(adapter.readComposerText()).toContain('Compare these');
    expect(adapter.readComposerText()).toContain('References');
    expect(adapter.getResponseElements()).toHaveLength(1);
  });

  it('does not mistake an unrelated Send control for the composer Send button', () => {
    document.body.innerHTML = `
      <button aria-label="Send feedback">Send feedback</button>
      <form><textarea id="prompt-textarea">Question</textarea><button data-testid="send-button"><span>Send</span></button></form>
    `;
    const adapter = new ChatGPTAdapter();
    const feedback = document.querySelector<HTMLElement>('[aria-label="Send feedback"]')!;
    const sendIcon = document.querySelector<HTMLElement>('[data-testid="send-button"] span')!;
    expect(adapter.isSendControl(feedback)).toBe(false);
    expect(adapter.isSendControl(sendIcon)).toBe(true);
  });

  it('rejects selections that cross response boundaries', () => {
    document.body.innerHTML = `
      <model-response id="one">First response</model-response>
      <model-response id="two">Second response</model-response>
    `;
    const first = document.querySelector('#one')!.firstChild!;
    const second = document.querySelector('#two')!.firstChild!;
    const range = document.createRange();
    range.setStart(first, 0);
    range.setEnd(second, 6);
    const selection = window.getSelection()!;
    selection.removeAllRanges();
    selection.addRange(range);
    expect(new GeminiAdapter().getSelectedReference(selection)).toBeNull();
  });

  it('re-finds a selected response after the provider replaces and reorders its DOM', () => {
    document.body.innerHTML = `
      <model-response>Earlier unique passage</model-response>
      <model-response>Target before selected phrase after</model-response>
    `;
    const adapter = new GeminiAdapter();
    const original = document.querySelectorAll<HTMLElement>('model-response')[1];
    selectText(original, 'selected phrase');
    const captured = adapter.getSelectedReference(window.getSelection()!)!;

    document.body.innerHTML = `
      <model-response>A new response inserted first</model-response>
      <model-response>Earlier unique passage</model-response>
      <model-response>Target before selected phrase after</model-response>
    `;
    expect(adapter.findSourceElement(captured)?.textContent).toContain('Target before selected phrase after');
  });
});
