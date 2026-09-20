import type { SelectedReference, StoreListener } from '../types';

export class ReferenceStore {
  private readonly byConversation = new Map<string, SelectedReference[]>();
  private readonly listeners = new Set<StoreListener>();
  private conversationKey: string;

  constructor(initialConversationKey: string) {
    this.conversationKey = initialConversationKey;
  }

  setConversation(key: string): void {
    if (key === this.conversationKey) return;
    this.conversationKey = key;
    this.emit();
  }

  getConversation(): string {
    return this.conversationKey;
  }

  getAll(): SelectedReference[] {
    return [...(this.byConversation.get(this.conversationKey) ?? [])];
  }

  add(reference: SelectedReference): boolean {
    const references = this.byConversation.get(this.conversationKey) ?? [];
    const duplicate = references.some((candidate) =>
      candidate.text === reference.text &&
      candidate.sourceMessageId === reference.sourceMessageId &&
      candidate.sourceMessageIndex === reference.sourceMessageIndex &&
      candidate.prefix === reference.prefix &&
      candidate.suffix === reference.suffix,
    );
    if (duplicate || references.length >= 20) return false;

    reference.order = references.length + 1;
    this.byConversation.set(this.conversationKey, [...references, reference]);
    this.emit();
    return true;
  }

  remove(id: string): void {
    const references = this.getAll().filter((reference) => reference.id !== id);
    references.forEach((reference, index) => {
      reference.order = index + 1;
    });
    this.byConversation.set(this.conversationKey, references);
    this.emit();
  }

  updateComment(id: string, comment: string): void {
    const references = this.getAll();
    const reference = references.find((candidate) => candidate.id === id);
    if (!reference) return;
    reference.comment = comment;
  }

  clear(): void {
    this.byConversation.set(this.conversationKey, []);
    this.emit();
  }

  subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    listener(this.getAll());
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    const snapshot = this.getAll();
    this.listeners.forEach((listener) => listener(snapshot));
  }
}
