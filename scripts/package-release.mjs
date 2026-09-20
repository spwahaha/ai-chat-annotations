import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';

const execute = promisify(execFile);
const manifest = JSON.parse(await readFile('manifest.json', 'utf8'));
const releaseDirectory = path.resolve('release');
const archive = path.join(releaseDirectory, `ai-chat-annotations-${manifest.version}.zip`);

await rm(releaseDirectory, { recursive: true, force: true });
await mkdir(releaseDirectory, { recursive: true });
await execute('zip', ['-qr', archive, '.', '-x', '*.map'], { cwd: path.resolve('dist') });

const digest = createHash('sha256').update(await readFile(archive)).digest('hex');
await writeFile(`${archive}.sha256`, `${digest}  ${path.basename(archive)}\n`);

console.log(`Created ${archive}`);
console.log(`SHA-256 ${digest}`);
