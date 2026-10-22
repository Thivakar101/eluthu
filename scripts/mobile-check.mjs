import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import assert from 'node:assert/strict'

const server = await createServer({server:{host:'127.0.0.1',port:5189,strictPort:true}})
await server.listen()
const browser = await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'})
try {
  const page = await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2,acceptDownloads:true})
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('http://127.0.0.1:5189/')
  await page.getByRole('button',{name:/Write it/}).tap()
  await page.getByText('Now write A.').waitFor()
  await page.waitForTimeout(400)
  const box = await page.locator('.draw-surface').boundingBox()
  assert.ok(box)
  const targets = await page.locator('.draw-tools .icon-button').evaluateAll(elements => elements.map(el => {const rect=el.getBoundingClientRect();return {width:rect.width,height:rect.height}}))
  assert.ok(targets.every(target => target.width >= 44 && target.height >= 44), 'Drawing controls have 44px touch targets')
  const client = await page.context().newCDPSession(page)
  const point = (x,y) => ({x:box.x+box.width*x,y:box.y+box.height*y,id:0,radiusX:1,radiusY:1,force:1})
  // Pace the gesture like a finger stroke, then allow native gesture handling to settle.
  await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point(.3,.75)]})
  for (let i=1;i<=12;i++) {await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point(.3+.2*i/12,.75-.5*i/12)]});await page.waitForTimeout(20)}
  for (let i=1;i<=12;i++) {await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[point(.5+.2*i/12,.25+.5*i/12)]});await page.waitForTimeout(20)}
  await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})
  await client.detach()
  await page.waitForTimeout(1500)
  await page.getByRole('button',{name:'Next letter'}).tap()
  await page.getByText('Now write B.').waitFor()
  await page.waitForFunction(async () => {const {loadProject}=await import('/src/lib/storage.ts');return !!(await loadProject())?.glyphs.A?.svgPathData})
  await page.getByRole('button',{name:'Review letters',exact:true}).tap()
  const preview = page.getByLabel('Sample text')
  await preview.waitFor()
  await page.waitForTimeout(400)
  const before = await preview.evaluate(el => parseFloat(getComputedStyle(el).fontSize))
  const slider = await page.locator('.preview-sliders input').first().boundingBox()
  await page.touchscreen.tap(slider.x + slider.width - 5, slider.y + slider.height / 2)
  await page.waitForTimeout(150)
  const after = await preview.evaluate(el => parseFloat(getComputedStyle(el).fontSize))
  assert.ok(after > before, 'Mobile preview size slider visibly changes the font')
  await page.getByRole('button',{name:'Font settings',exact:true}).tap()
  await page.getByRole('button',{name:'Close settings',exact:true}).waitFor()
  assert.ok(await page.locator('.editor-panel .field input').evaluate(el => parseFloat(getComputedStyle(el).fontSize) >= 16))
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
  await page.getByRole('button',{name:'Close settings',exact:true}).tap()
  await page.getByRole('button',{name:/^Export/}).tap()
  const downloads = page.waitForEvent('download')
  await page.locator('.format-card .button').first().tap()
  const download = await downloads
  assert.ok(download.suggestedFilename().endsWith('.ttf'))
  await page.getByRole('button',{name:'Back to home',exact:true}).tap()
  await page.getByRole('button',{name:/Upload/}).tap()
  await page.getByRole('button',{name:/One letter/}).tap()
  await page.locator('input[type=file]').setInputFiles('public/samples/a.png')
  await page.getByLabel('Traced B').waitFor({timeout:15000})
  assert.deepEqual(errors, [])
  console.log(JSON.stringify({touchDrawing:'passed',savedGlyph:'A',previewSize:{before,after},settings:'passed',fontDownload:download.suggestedFilename(),photoUpload:'passed',errors},null,2))
} finally {await browser.close();await server.close()}
