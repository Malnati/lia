import { copyFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const indexHtml = join(dist, 'index.html');

await mkdir(join(dist, 'mock'), { recursive: true });
await copyFile(indexHtml, join(dist, 'mock', 'index.html'));
await copyFile(indexHtml, join(dist, '404.html'));
