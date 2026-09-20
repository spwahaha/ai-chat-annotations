import { access, readFile, stat } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('manifest.json', 'utf8'));
const packageJson = JSON.parse(await readFile('package.json', 'utf8'));
const errors = [];

if (manifest.manifest_version !== 3) errors.push('manifest_version must be 3');
if (manifest.name !== 'AI Chat Annotations') errors.push('manifest name must be AI Chat Annotations');
if (manifest.version !== packageJson.version) errors.push('manifest and package versions must match');
if (!manifest.description || manifest.description.length > 132) errors.push('manifest description must be 1–132 characters');
if (manifest.permissions?.length || manifest.host_permissions?.length) {
  errors.push('release must not request general extension or host permissions');
}

const expectedMatches = [
  'https://chatgpt.com/*',
  'https://chat.openai.com/*',
  'https://gemini.google.com/*',
];
const matches = manifest.content_scripts?.[0]?.matches ?? [];
if (JSON.stringify(matches) !== JSON.stringify(expectedMatches)) {
  errors.push('content-script sites differ from the reviewed release allowlist');
}

function pngDimensions(buffer) {
  const signature = buffer.subarray(1, 4).toString('ascii');
  if (signature !== 'PNG') return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}

for (const size of [16, 32, 48, 128]) {
  const file = `dist/icons/icon-${size}.png`;
  try {
    const dimensions = pngDimensions(await readFile(file));
    if (!dimensions || dimensions.width !== size || dimensions.height !== size) {
      errors.push(`${file} must be ${size}×${size} PNG`);
    }
  } catch {
    errors.push(`${file} is missing`);
  }
}

for (const file of ['dist/manifest.json', 'dist/content.js']) {
  try {
    if ((await stat(file)).size === 0) errors.push(`${file} is empty`);
  } catch {
    errors.push(`${file} is missing`);
  }
}

for (const file of [
  'PRIVACY.md',
  'LICENSE',
  'store-listing/listing.md',
  'store-listing/privacy-practices.md',
  'store-listing/test-instructions.md',
  'assets/store/promo-small.png',
  'assets/store/screenshots/01-add-to-question.png',
]) {
  try {
    await access(file);
  } catch {
    errors.push(`${file} is missing`);
  }
}

if (errors.length > 0) {
  console.error(`Release validation failed:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`Release validation passed for AI Chat Annotations ${manifest.version}.`);
