import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import path from 'node:path';

const execute = promisify(execFile);
const manifest = JSON.parse(await readFile('manifest.json', 'utf8'));
const releaseDirectory = path.resolve('release');
const releaseName = `ai-chat-annotations-${manifest.version}`;
const unpackedDirectory = path.join(releaseDirectory, releaseName);
const archive = path.join(releaseDirectory, `${releaseName}.zip`);

await rm(releaseDirectory, { recursive: true, force: true });
await mkdir(unpackedDirectory, { recursive: true });
await cp(path.resolve('dist'), unpackedDirectory, { recursive: true });
await rm(path.join(unpackedDirectory, 'content.js.map'), { force: true });
await execute('zip', ['-qr', archive, '.'], { cwd: unpackedDirectory });

const digest = createHash('sha256').update(await readFile(archive)).digest('hex');
await writeFile(`${archive}.sha256`, `${digest}  ${path.basename(archive)}\n`);

console.log(`Created ${archive}`);
console.log(`Created ${unpackedDirectory}`);
console.log(`SHA-256 ${digest}`);
