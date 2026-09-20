import type { ProviderAdapter } from '../types';
import { ChatGPTAdapter } from './chatgptAdapter';
import { GeminiAdapter } from './geminiAdapter';

export function adapterFor(url: URL): ProviderAdapter | null {
  const adapters: ProviderAdapter[] = [new ChatGPTAdapter(), new GeminiAdapter()];
  return adapters.find((adapter) => adapter.matchesPage(url)) ?? null;
}
