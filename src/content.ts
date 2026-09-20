import globalStyles from './styles.css?inline';
import { adapterFor } from './adapters';
import { AnnotationController } from './core/annotationController';

function installGlobalStyles(): void {
  if (document.getElementById('mrq-global-styles')) return;
  const style = document.createElement('style');
  style.id = 'mrq-global-styles';
  style.textContent = globalStyles;
  document.documentElement.appendChild(style);
}

function start(): void {
  const adapter = adapterFor(new URL(location.href));
  if (!adapter) return;
  installGlobalStyles();
  const controller = new AnnotationController(adapter);
  controller.start();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
  start();
}
