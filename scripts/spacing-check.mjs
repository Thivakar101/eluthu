import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import os from 'node:os'
import path from 'node:path'

const server = await createServer({ server: { host: '127.0.0.1', port: 5180, strictPort: true } })
await server.listen()
const url = server.resolvedUrls.local[0]
const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', error => errors.push(error.message))
await page.goto(url)
await page.evaluate(async () => {
  const { newProject } = await import('/src/lib/model.ts')
  const { saveProject } = await import('/src/lib/storage.ts')
  const project = newProject()
  const outlines = {
    h: 'M 110 150 L 175 150 L 175 460 C 255 350 420 350 480 455 C 530 550 510 700 510 790 L 445 790 L 445 525 C 445 420 240 420 175 530 L 175 790 L 110 790 Z',
    e: 'M 105 570 C 105 400 205 350 325 350 C 445 350 500 440 500 560 L 170 560 C 165 680 245 745 335 735 C 390 730 425 700 455 675 L 490 730 C 430 790 380 805 300 805 C 175 805 105 700 105 570 Z',
    l: 'M 450 150 L 515 150 L 515 790 L 450 790 Z',
    o: 'M 305 355 C 450 355 515 445 515 575 C 515 710 445 795 305 795 C 165 795 95 710 95 575 C 95 445 165 355 305 355 Z M 305 420 C 210 420 165 475 165 575 C 165 675 210 730 305 730 C 400 730 445 675 445 575 C 445 475 400 420 305 420 Z',
  }
  for (const [char, svgPathData] of Object.entries(outlines)) project.glyphs[char] = { char, unicode: char.codePointAt(0), svgPathData, advanceWidth: 1000, lsb: 80, source: 'draw', status: 'done' }
  await saveProject(project)
})
await page.reload()
await page.getByRole('button', { name: /Continue your last font/ }).click()
await page.getByLabel('Sample text').fill('hello hello')
await page.waitForFunction(() => [...document.fonts].some(face => face.family === 'EluthuPreview' && face.status === 'loaded'))
const metrics = await page.evaluate(() => { const canvas = document.createElement('canvas'), context = canvas.getContext('2d'); context.font = '56px EluthuPreview'; return { previewWidth: Math.round(context.measureText('hello').width), oldFixedWidth: 5 * 56, viewportWidth: document.documentElement.scrollWidth } })
await page.locator('.preview-dock').screenshot({ path: path.join(os.tmpdir(), 'eluthu-spacing-after.png') })
await page.setViewportSize({ width: 375, height: 900 })
const mobile = await page.evaluate(() => ({ viewportWidth: document.documentElement.scrollWidth, spacingControlVisible: !!document.querySelector('.preview-sliders input') && getComputedStyle(document.querySelector('.preview-sliders')).display !== 'none' }))
await page.locator('.preview-dock').screenshot({ path: path.join(os.tmpdir(), 'eluthu-spacing-mobile.png') })
if (metrics.previewWidth >= metrics.oldFixedWidth * .8 || mobile.viewportWidth !== 375 || !mobile.spacingControlVisible || errors.length) throw new Error('The live preview spacing check failed.')
console.log(JSON.stringify({ metrics, mobile, screenshots: [path.join(os.tmpdir(), 'eluthu-spacing-after.png'), path.join(os.tmpdir(), 'eluthu-spacing-mobile.png')], errors }, null, 2))
await browser.close()
await server.close()
