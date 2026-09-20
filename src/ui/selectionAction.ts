const styles = `
  :host { all: initial; }
  button {
    appearance: none;
    border: 1px solid rgba(255,255,255,.18);
    border-radius: 10px;
    background: #202123;
    color: #fff;
    box-shadow: 0 8px 24px rgba(0,0,0,.28);
    cursor: pointer;
    font: 600 13px/1.2 ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    padding: 9px 12px;
    white-space: nowrap;
  }
  button:hover { background: #2d2f33; }
  button:focus-visible { outline: 2px solid #7aa7ff; outline-offset: 2px; }
  .count { color: #a9c3ff; margin-left: 5px; }
`;

export class SelectionAction {
  private readonly host: HTMLDivElement;
  private readonly button: HTMLButtonElement;
  private callback: (() => void) | null = null;

  constructor() {
    this.host = document.createElement('div');
    this.host.id = 'mrq-selection-action';
    Object.assign(this.host.style, {
      display: 'none',
      position: 'fixed',
      zIndex: '2147483647',
    });
    const shadow = this.host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styles;
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.title = 'Keep this passage and include it with your next message';
    this.button.addEventListener('mousedown', (event) => event.preventDefault());
    this.button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.callback?.();
    });
    shadow.append(style, this.button);
    document.documentElement.appendChild(this.host);
  }

  contains(target: Node | null): boolean {
    return Boolean(target && (this.host === target || this.host.contains(target)));
  }

  show(rect: DOMRect, count: number, callback: () => void): void {
    this.callback = callback;
    this.button.replaceChildren(document.createTextNode('＋ Add to question'));
    if (count > 0) {
      const badge = document.createElement('span');
      badge.className = 'count';
      badge.textContent = `· ${count}`;
      this.button.appendChild(badge);
    }
    this.host.style.display = 'block';
    const width = 180;
    const left = Math.max(8, Math.min(window.innerWidth - width - 8, rect.right - width / 2));
    const top = Math.max(8, Math.min(window.innerHeight - 48, rect.bottom + 8));
    this.host.style.left = `${left}px`;
    this.host.style.top = `${top}px`;
  }

  hide(): void {
    this.callback = null;
    this.host.style.display = 'none';
  }

  destroy(): void {
    this.host.remove();
  }
}
