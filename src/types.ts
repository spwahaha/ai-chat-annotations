export type ProviderId = 'chatgpt' | 'gemini';

export interface SelectedReference {
  id: string;
  provider: ProviderId;
  conversationId: string;
  sourceMessageId: string | null;
  sourceMessageIndex: number;
  text: string;
  prefix: string;
  suffix: string;
  comment: string;
  order: number;
  createdAt: number;
  sourceElement: HTMLElement;
  range: Range;
}

export interface SerializedReference {
  id: string;
  provider: ProviderId;
  conversationId: string;
  sourceMessageId: string | null;
  sourceMessageIndex: number;
  text: string;
  prefix: string;
  suffix: string;
  comment: string;
  order: number;
  createdAt: number;
}

export interface ComposerHandle {
  element: HTMLElement;
  sendButton: HTMLElement | null;
}

export interface ProviderAdapter {
  readonly id: ProviderId;
  readonly displayName: string;
  matchesPage(url: URL): boolean;
  getConversationId(): string;
  getResponseElements(): HTMLElement[];
  getSelectedReference(selection: Selection): SelectedReference | null;
  findSourceElement(reference: SelectedReference): HTMLElement | null;
  locateComposer(): ComposerHandle | null;
  isSendControl(target: EventTarget | null): boolean;
  shouldSubmitOnKeydown(event: KeyboardEvent): boolean;
  readComposerText(element?: HTMLElement): string;
  appendToComposer(text: string): boolean;
}

export type StoreListener = (references: SelectedReference[]) => void;
