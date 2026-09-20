import { copyFile, mkdir } from 'node:fs/promises';

await mkdir('dist', { recursive: true });
await copyFile('manifest.json', 'dist/manifest.json');
await mkdir('dist/icons', { recursive: true });
for (const size of [16, 32, 48, 128]) {
  await copyFile(`assets/icons/icon-${size}.png`, `dist/icons/icon-${size}.png`);
}
