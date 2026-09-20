import { chromium } from '@playwright/test';
import { copyFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const icon = (await readFile('assets/icons/icon-source.png')).toString('base64');
const iconUrl = `data:image/png;base64,${icon}`;
const outputDirectory = path.resolve('assets/store');
await mkdir(outputDirectory, { recursive: true });
await copyFile('assets/icons/icon-128.png', 'assets/store/store-icon-128.png');

const browser = await chromium.launch({ channel: 'chromium', headless: true });
try {
  for (const asset of [
    { name: 'promo-small.png', width: 440, height: 280, iconSize: 178 },
    { name: 'promo-marquee.png', width: 1400, height: 560, iconSize: 330 },
  ]) {
    const page = await browser.newPage({ viewport: { width: asset.width, height: asset.height } });
    await page.setContent(`<!doctype html>
      <style>
        * { box-sizing: border-box; }
        html, body { height: 100%; margin: 0; overflow: hidden; }
        body {
          align-items: center;
          background:
            radial-gradient(circle at 18% 20%, rgba(78, 181, 255, .65), transparent 28%),
            radial-gradient(circle at 82% 78%, rgba(71, 111, 255, .55), transparent 31%),
            linear-gradient(135deg, #07163f 0%, #173aa2 54%, #0b76d9 100%);
          display: flex;
          justify-content: center;
          position: relative;
        }
        .ring { border: 2px solid rgba(255,255,255,.15); border-radius: 999px; position: absolute; }
        .one { height: 62%; left: -8%; top: -24%; width: 40%; }
        .two { bottom: -31%; height: 78%; right: -4%; width: 34%; }
        .line { background: rgba(255,255,255,.16); border-radius: 999px; height: 7%; position: absolute; }
        .line-a { left: 8%; top: 24%; width: 22%; }
        .line-b { bottom: 22%; right: 8%; width: 25%; }
        img { filter: drop-shadow(0 18px 25px rgba(0,0,0,.28)); height: ${asset.iconSize}px; width: ${asset.iconSize}px; }
      </style>
      <div class="ring one"></div><div class="ring two"></div>
      <div class="line line-a"></div><div class="line line-b"></div>
      <img alt="" src="${iconUrl}">`);
    await page.screenshot({ path: path.join(outputDirectory, asset.name) });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log('Rendered Chrome Web Store promotional assets.');
