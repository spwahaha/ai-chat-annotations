import type { ProviderAdapter, SelectedReference } from '../types';
import { formatReferences, hasFormattedReferences } from './formatReferences';
import { HighlightManager } from './highlightManager';
import { ReferenceStore } from './referenceStore';
import { SelectionAction } from '../ui/selectionAction';
import { ReferenceShelf } from '../ui/referenceShelf';

export class AnnotationController {
  private readonly store: ReferenceStore;
  private readonly highlights: HighlightManager;
  private readonly selectionAction: SelectionAction;
  private readonly shelf: ReferenceShelf;
  private allowNextSubmit = false;
  private preparing = false;
  private routeTimer: number | null = null;
  private refreshTimer: number | null = null;
  private observer: MutationObserver | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor(private readonly adapter: ProviderAdapter) {
    this.store = new ReferenceStore(this.conversationKey());
    this.highlights = new HighlightManager(adapter);
    this.selectionAction = new SelectionAction();
    this.shelf = new ReferenceShelf(this.store, adapter);
  }

  start(): void {
    this.unsubscribe = this.store.subscribe((references) => {
      this.highlights.update(references);
      this.shelf.update(references);
    });
    document.addEventListener('mouseup', this.onSelectionEnd, true);
    document.addEventListener('keyup', this.onSelectionEnd, true);
    document.addEventListener('mousedown', this.onDocumentMouseDown, true);
    document.addEventListener('click', this.onClickCapture, true);
    document.addEventListener('keydown', this.onKeydownCapture, true);
    window.addEventListener('resize', this.onViewportChange);
    window.addEventListener('scroll', this.onViewportChange, true);

    this.observer = new MutationObserver(() => this.scheduleRefresh());
    this.observer.observe(document.body, { childList: true, subtree: true });
    this.routeTimer = window.setInterval(() => this.checkRoute(), 750);
  }

  destroy(): void {
    this.unsubscribe?.();
    this.observer?.disconnect();
    if (this.routeTimer !== null) window.clearInterval(this.routeTimer);
    if (this.refreshTimer !== null) window.clearTimeout(this.refreshTimer);
    document.removeEventListener('mouseup', this.onSelectionEnd, true);
    document.removeEventListener('keyup', this.onSelectionEnd, true);
    document.removeEventListener('mousedown', this.onDocumentMouseDown, true);
    document.removeEventListener('click', this.onClickCapture, true);
    document.removeEventListener('keydown', this.onKeydownCapture, true);
    window.removeEventListener('resize', this.onViewportChange);
    window.removeEventListener('scroll', this.onViewportChange, true);
    this.highlights.clear();
    this.selectionAction.destroy();
    this.shelf.destroy();
  }

  getReferencesForTesting(): SelectedReference[] {
    return this.store.getAll();
  }

  private conversationKey(): string {
    return `${this.adapter.id}:${this.adapter.getConversationId()}`;
  }

  private checkRoute(): void {
    this.store.setConversation(this.conversationKey());
    this.scheduleRefresh();
  }

  private scheduleRefresh(): void {
    if (this.refreshTimer !== null) return;
    this.refreshTimer = window.setTimeout(() => {
      this.refreshTimer = null;
      this.highlights.refresh();
      this.shelf.position();
    }, 80);
  }

  private readonly onViewportChange = (): void => {
    this.shelf.position();
  };

  private readonly onSelectionEnd = (event: Event): void => {
    if (this.selectionAction.contains(event.target as Node | null)) return;
    window.setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
        this.selectionAction.hide();
        return;
      }
      const reference = this.adapter.getSelectedReference(selection);
      if (!reference) {
        this.selectionAction.hide();
        return;
      }
      const rect = selection.getRangeAt(0).getBoundingClientRect();
      this.selectionAction.show(rect, this.store.getAll().length, () => {
        const currentSelection = window.getSelection();
        const selected = currentSelection ? this.adapter.getSelectedReference(currentSelection) : null;
        if (!selected) {
          this.shelf.setStatus('Select the passage again, then choose “Add to question”.', true);
          this.selectionAction.hide();
          return;
        }
        const added = this.store.add(selected);
        if (!added) {
          this.shelf.setStatus('That passage is already included, or the 20-reference limit was reached.', true);
        } else {
          this.shelf.setStatus('');
          this.shelf.open(selected.id);
        }
        currentSelection?.removeAllRanges();
        this.selectionAction.hide();
      });
    }, 0);
  };

  private readonly onDocumentMouseDown = (event: MouseEvent): void => {
    if (!this.selectionAction.contains(event.target as Node | null)) this.selectionAction.hide();
  };

  private readonly onClickCapture = (event: MouseEvent): void => {
    if (!this.adapter.isSendControl(event.target)) return;
    if (this.allowNextSubmit) {
      this.allowNextSubmit = false;
      this.monitorSubmission();
      return;
    }
    this.handleSubmit(event);
  };

  private readonly onKeydownCapture = (event: KeyboardEvent): void => {
    if (!this.adapter.shouldSubmitOnKeydown(event)) return;
    if (this.allowNextSubmit) {
      this.allowNextSubmit = false;
      this.monitorSubmission();
      return;
    }
    this.handleSubmit(event);
  };

  private handleSubmit(event: Event): void {
    const references = this.store.getAll();
    if (references.length === 0 || this.preparing) return;

    const composer = this.adapter.locateComposer();
    if (!composer) {
      event.preventDefault();
      event.stopImmediatePropagation();
      this.shelf.setStatus(`Could not find the ${this.adapter.displayName} message box. Your references are still saved.`, true);
      return;
    }

    const current = this.adapter.readComposerText(composer.element);
    if (hasFormattedReferences(current)) {
      this.shelf.setPrepared(true);
      this.monitorSubmission();
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
    this.preparing = true;
    this.shelf.setStatus('Adding references to your message…');

    const payload = formatReferences(references);
    if (!this.adapter.appendToComposer(payload)) {
      this.preparing = false;
      this.shelf.setStatus('Could not add the references. Nothing was sent; your references are still saved.', true);
      return;
    }

    this.shelf.setPrepared(true);
    this.shelf.setStatus('References added. Sending with your question…');
    window.setTimeout(() => {
      this.preparing = false;
      const refreshed = this.adapter.locateComposer();
      if (!refreshed) {
        this.shelf.setStatus('References were added, but the Send control is unavailable. Send again normally.', true);
        return;
      }

      this.allowNextSubmit = true;
      if (refreshed.sendButton) {
        refreshed.sendButton.click();
      } else {
        refreshed.element.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          bubbles: true,
          cancelable: true,
        }));
      }
      window.setTimeout(() => {
        if (this.allowNextSubmit) {
          this.allowNextSubmit = false;
          this.shelf.setStatus('References were added, but sending did not complete. Send again normally.', true);
        }
      }, 500);
    }, 140);
  }

  private monitorSubmission(): void {
    const started = Date.now();
    const timer = window.setInterval(() => {
      const composer = this.adapter.locateComposer();
      const text = composer ? this.adapter.readComposerText(composer.element).trim() : '';
      if (!text) {
        window.clearInterval(timer);
        this.store.clear();
        this.shelf.setPrepared(false);
        return;
      }
      if (Date.now() - started > 5_000) {
        window.clearInterval(timer);
        this.shelf.setStatus('The message has not cleared yet. Your references remain available.', true);
      }
    }, 100);
  }
}
