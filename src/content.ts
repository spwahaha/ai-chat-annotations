import globalStyles from './styles.css?inline';
import { adapterFor } from './adapters';
import { AnnotationController } from './core/annotationController';

declare global {
  interface Window {
    __aiChatAnnotationsController?: AnnotationController;
  }
}

function installGlobalStyles(): void {
  if (document.getElementById('mrq-global-styles')) return;
  const style = document.createElement('style');
  style.id = 'mrq-global-styles';
  style.textContent = globalStyles;
  document.documentElement.appendChild(style);
}

function start(): void {
  if (window.__aiChatAnnotationsController) return;
  const adapter = adapterFor(new URL(location.href));
  if (!adapter) return;

  // Extension reloads can leave inert UI from the previous content-script
  // world in an already-open tab. Clear it before installing the fresh one.
  document.getElementById('mrq-selection-action')?.remove();
  document.getElementById('mrq-reference-shelf')?.remove();
  document.getElementById('mrq-global-styles')?.remove();

  installGlobalStyles();
  const controller = new AnnotationController(adapter);
  controller.start();
  window.__aiChatAnnotationsController = controller;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
