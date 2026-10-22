import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import assert from 'node:assert/strict'
const server = await createServer({ server: { host: '127.0.0.1', port: 5187, strictPort: true } })
await server.listen()
const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', args: ['--no-sandbox'] })
try {
  const page = await browser.newPage({ viewport: { width: 802, height: 521 } })
  await page.goto('http://127.0.0.1:5187/')
  console.log('Responsive check: page loaded')
  await page.evaluate(() => document.fonts.ready.then(() => true))
  await page.waitForTimeout(400)
  assert.equal(await page.locator('h1').innerText(), 'eluthu')
  assert.equal(await page.locator('svg image').count(), 0, 'No screenshot slices in the interface')
  assert.deepEqual(await page.locator('img').evaluateAll(images => images.map(img => img.getAttribute('src'))), ['/brand/logo.png'])
  assert.ok(await page.evaluate(() => document.fonts.check('400 48px Jua')), 'Brand font is available locally')
  await page.screenshot({path:'docs/screens/home-reference-802.png',fullPage:true})
  for (const [width, height] of [[320,568],[360,740],[375,667],[390,844],[430,932],[600,900],[768,1024],[802,521],[844,390],[1280,720],[1366,768],[1440,900]]) {
    await page.setViewportSize({width,height})
    const screens = process.argv.includes('--home-only') ? [['home','draw']] : [['home','draw'],['coach','draw'],['coach','upload'],['upload-choice','upload'],['sheet','upload'],['review','draw'],['export','draw'],['complete','draw']]
    for (const [screen, mode] of screens) {
      await page.evaluate(async ({screen,mode}) => { const { useApp } = await import('/src/store.ts'); useApp.getState().setMode(mode); useApp.getState().setScreen(screen); window.scrollTo(0,0) }, {screen,mode})
      await page.waitForTimeout(650)
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      assert.ok(scrollWidth <= width, `${screen} overflows at ${width}: ${scrollWidth}`)
      if (screen === 'home') {
        const contentFits = await page.locator('h1, .path-card').evaluateAll(elements => elements.every(el => el.scrollWidth <= el.clientWidth + 1))
        assert.ok(contentFits, `Home content clipped at ${width}`)
        if (width >= 1280 || (width === 390 && height === 844)) assert.ok(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight), `Home needs scrolling at ${width}x${height}`)
        if ([375,768,1440].includes(width)) await page.screenshot({path:`docs/screens/home-${width}.png`,fullPage:true})
      }
      if (screen === 'coach' && mode === 'draw' && width >= 1280) {
        const next = await page.getByRole('button', {name:'Skip letter',exact:true}).boundingBox()
        assert.ok(next.y + next.height <= height, `Drawing actions below laptop viewport at ${width}x${height}`)
      }
      if (width === 390 || (width === 1366 && (screen === 'home' || screen === 'coach'))) await page.screenshot({path:`docs/screens/${screen}${screen==='coach'?'-'+mode:''}-${width}.png`,fullPage:true})
    }
    console.log(`Passed ${width} x ${height}`)
  }
  console.log('Live text, local font, logo-only imagery, and responsive layouts verified.')
} finally { await browser.close(); await server.close() }
