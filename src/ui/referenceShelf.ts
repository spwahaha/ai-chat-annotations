import type { ProviderAdapter, SelectedReference } from '../types';
import type { ReferenceStore } from '../core/referenceStore';

const styles = `
  :host { all: initial; pointer-events: none; }
  * { box-sizing: border-box; }
  button, input { font: inherit; }
  button { appearance: none; cursor: pointer; }
  button:focus-visible, input:focus-visible { outline: 2px solid #7aa7ff; outline-offset: 2px; }
  .marker {
    align-items: center; background: #2f6fca; border: 2px solid rgba(255,255,255,.92); border-radius: 999px;
    box-shadow: 0 3px 12px rgba(0,0,0,.3); color: #fff; display: flex; font: 700 12px/1 ui-sans-serif,
    -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; height: 27px; justify-content: center;
    pointer-events: auto; position: fixed; width: 27px;
  }
  .marker:hover, .marker.active { background: #1f5dad; transform: scale(1.06); }
  .panel {
    background: rgba(32,33,35,.98); border: 1px solid rgba(255,255,255,.14); border-radius: 12px;
    box-shadow: 0 12px 34px rgba(0,0,0,.34); color: #f4f4f5; font: 13px/1.4 ui-sans-serif,
    -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; padding: 10px; pointer-events: auto;
    position: fixed; width: min(380px, calc(100vw - 16px));
  }
  .header { align-items: center; display: flex; gap: 8px; margin-bottom: 7px; }
  .number { align-items: center; background: #2f6fca; border-radius: 999px; display: flex; font-weight: 700;
    height: 23px; justify-content: center; width: 23px; }
  .excerpt { color: #e5e7eb; flex: 1; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .icon { background: transparent; border: 0; border-radius: 6px; color: #b5b7bb; padding: 3px 6px; }
  .icon:hover { background: rgba(255,255,255,.08); color: #fff; }
  input { background: rgba(0,0,0,.22); border: 1px solid rgba(255,255,255,.12); border-radius: 8px;
    color: #fff; padding: 8px 9px; width: 100%; }
  input::placeholder { color: #96989d; }
  .hint { color: #9fa3aa; font-size: 11px; margin-top: 6px; }
  .actions { display: flex; justify-content: space-between; margin-top: 7px; }
  .action { background: transparent; border: 0; border-radius: 6px; color: #b9c8e7; font-size: 12px; padding: 3px 5px; }
  .action:hover { background: rgba(255,255,255,.08); }
  .danger { color: #ffb4aa; }
  button:disabled, input:disabled { cursor: default; opacity: .55; }
  .toast { background: rgba(32,33,35,.97); border: 1px solid rgba(255,255,255,.13); border-radius: 9px;
    bottom: 18px; box-shadow: 0 8px 24px rgba(0,0,0,.25); color: #b7c8e9; font: 12px/1.35 ui-sans-serif,
    -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; left: 50%; max-width: min(520px, calc(100vw - 24px));
    padding: 7px 10px; pointer-events: none; position: fixed; transform: translateX(-50%); }
  .toast.error { color: #ffb4aa; }
`;

export class ReferenceShelf {
  private readonly host: HTMLDivElement;
  private readonly shadow: ShadowRoot;
  private references: SelectedReference[] = [];
  private activeId: string | null = null;
  private prepared = false;
  private status = '';
  private statusError = false;

  constructor(
    private readonly store: ReferenceStore,
    private readonly adapter: ProviderAdapter,
  ) {
    this.host = document.createElement('div');
    this.host.id = 'mrq-reference-shelf';
    Object.assign(this.host.style, {
      display: 'none',
      inset: '0',
      pointerEvents: 'none',
      position: 'fixed',
      zIndex: '2147483646',
    });
    this.shadow = this.host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    this.shadow.appendChild(style);
    document.documentElement.appendChild(this.host);
  }

  update(references: SelectedReference[]): void {
    const previousIds = new Set(this.references.map((reference) => reference.id));
    const added = references.find((reference) => !previousIds.has(reference.id));
    this.references = references;
    if (added) this.activeId = added.id;
    if (this.activeId && !references.some((reference) => reference.id === this.activeId)) this.activeId = null;
    if (references.length === 0) {
      this.prepared = false;
      this.status = '';
      this.activeId = null;
      this.host.style.display = 'none';
      return;
    }
    this.host.style.display = 'block';
    this.render();
    this.position();
  }

  open(id: string): void {
    if (!this.references.some((reference) => reference.id === id)) return;
    this.activeId = id;
    this.render();
    this.position();
    window.setTimeout(() => this.shadow.querySelector<HTMLInputElement>('input')?.focus(), 0);
  }

  setPrepared(value: boolean): void {
    this.prepared = value;
    this.render();
    this.position();
  }

  setStatus(message: string, error = false): void {
    this.status = message;
    this.statusError = error;
    this.render();
    this.position();
  }

  position(): void {
    if (this.references.length === 0) return;
    for (const reference of this.references) {
      const marker = [...this.shadow.querySelectorAll<HTMLElement>('.marker')]
        .find((candidate) => candidate.dataset.referenceId === reference.id);
      if (!marker) continue;
      const rect = this.referenceRect(reference);
      if (!rect || rect.bottom < 0 || rect.top > window.innerHeight) {
        marker.style.display = 'none';
        continue;
      }
      marker.style.display = 'flex';
      marker.style.left = `${Math.max(4, Math.min(window.innerWidth - 31, rect.right + 5))}px`;
      marker.style.top = `${Math.max(4, Math.min(window.innerHeight - 31, rect.top - 3))}px`;
    }

    const active = this.references.find((reference) => reference.id === this.activeId);
    const panel = this.shadow.querySelector<HTMLElement>('.panel');
    if (!active || !panel) return;
    const rect = this.referenceRect(active);
    if (!rect) return;
    const panelWidth = Math.min(380, window.innerWidth - 16);
    const spaceRight = window.innerWidth - rect.right;
    const left = spaceRight >= panelWidth + 42
      ? rect.right + 38
      : Math.max(8, Math.min(window.innerWidth - panelWidth - 8, rect.left));
    const below = rect.bottom + 8;
    const estimatedHeight = 154;
    const top = below + estimatedHeight <= window.innerHeight
      ? below
      : Math.max(8, rect.top - estimatedHeight - 8);
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }

  private referenceRect(reference: SelectedReference): DOMRect | null {
    if (!reference.range.startContainer.isConnected) {
      const source = this.adapter.findSourceElement(reference);
      if (!source) return null;
      return source.getBoundingClientRect();
    }
    const rangeWithRects = reference.range as Range & {
      getClientRects?: () => DOMRectList;
      getBoundingClientRect?: () => DOMRect;
    };
    const clientRects = rangeWithRects.getClientRects?.();
    return clientRects?.[0] ?? rangeWithRects.getBoundingClientRect?.() ?? reference.sourceElement.getBoundingClientRect();
  }

  private render(): void {
    this.shadow.querySelectorAll('.marker, .panel, .toast').forEach((element) => element.remove());
    for (const reference of this.references) this.shadow.appendChild(this.renderMarker(reference));
    const active = this.references.find((reference) => reference.id === this.activeId);
    if (active) this.shadow.appendChild(this.renderPanel(active));
    if (this.status) {
      const toast = document.createElement('div');
      toast.className = `toast${this.statusError ? ' error' : ''}`;
      toast.setAttribute('role', 'status');
      toast.textContent = this.status;
      this.shadow.appendChild(toast);
    }
  }

  private renderMarker(reference: SelectedReference): HTMLButtonElement {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = `marker${reference.id === this.activeId ? ' active' : ''}`;
    marker.dataset.referenceId = reference.id;
    marker.textContent = String(reference.order);
    marker.title = `Open reference ${reference.order}: ${reference.text.replace(/\s+/g, ' ')}`;
    marker.setAttribute('aria-label', `Open reference ${reference.order}`);
    marker.addEventListener('click', () => {
      this.activeId = this.activeId === reference.id ? null : reference.id;
      this.render();
      this.position();
      if (this.activeId) window.setTimeout(() => this.shadow.querySelector<HTMLInputElement>('input')?.focus(), 0);
    });
    return marker;
  }

  private renderPanel(reference: SelectedReference): HTMLElement {
    const panel = document.createElement('section');
    panel.className = 'panel';
    panel.setAttribute('aria-label', `Reference ${reference.order} editor`);

    const header = document.createElement('div');
    header.className = 'header';
    const number = document.createElement('span');
    number.className = 'number';
    number.textContent = String(reference.order);
    const excerpt = document.createElement('span');
    excerpt.className = 'excerpt';
    excerpt.textContent = `“${reference.text.replace(/\s+/g, ' ')}”`;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'icon';
    close.textContent = '×';
    close.title = 'Minimize reference';
    close.setAttribute('aria-label', 'Minimize reference');
    close.addEventListener('click', () => {
      this.activeId = null;
      this.render();
      this.position();
    });
    header.append(number, excerpt, close);

    const note = document.createElement('input');
    note.type = 'text';
    note.value = reference.comment;
    note.placeholder = 'What do you want to ask about this?';
    note.setAttribute('aria-label', `Note for reference ${reference.order}`);
    note.disabled = this.prepared;
    note.addEventListener('input', () => this.store.updateComment(reference.id, note.value));
    note.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== 'Escape') return;
      event.preventDefault();
      this.activeId = null;
      this.render();
      this.position();
    });

    const hint = document.createElement('div');
    hint.className = 'hint';
    hint.textContent = 'Enter to save and minimize · click the number to reopen';

    const actions = document.createElement('div');
    actions.className = 'actions';
    const clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'action';
    clear.textContent = `Clear all (${this.references.length})`;
    clear.disabled = this.prepared;
    clear.addEventListener('click', () => this.store.clear());
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'action danger';
    remove.textContent = 'Remove this reference';
    remove.disabled = this.prepared;
    remove.addEventListener('click', () => this.store.remove(reference.id));
    actions.append(clear, remove);
    panel.append(header, note, hint, actions);

    panel.addEventListener('focusout', () => {
      window.setTimeout(() => {
        if (this.shadow.activeElement || this.prepared) return;
        this.activeId = null;
        this.render();
        this.position();
      }, 0);
    });
    return panel;
  }

  destroy(): void {
    this.host.remove();
  }
}
