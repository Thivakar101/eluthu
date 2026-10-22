import { chromium } from '@playwright/test'
import { createServer } from 'vite'
const server = await createServer({ server: { host: '127.0.0.1', port: 5173 } })
await server.listen()
const browser = await chromium.launch({ headless: true, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', args: ['--no-sandbox'] })
const page = await browser.newPage({ viewport: { width: 375, height: 900 } })
await page.goto('http://127.0.0.1:5173/')
for (const screen of ['home','design','coach','upload-choice','sheet','review','export','complete']) {
  await page.evaluate(async screen => { const { useApp } = await import('/src/store.ts'); useApp.getState().setScreen(screen) }, screen)
  await page.waitForTimeout(300)
  const overflow = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, elements: [...document.querySelectorAll('body *')].map(element => ({ tag: element.tagName, className: typeof element.className === 'string' ? element.className : '', text: element.textContent?.slice(0, 40), right: Math.round(element.getBoundingClientRect().right) })).filter(item => item.right > innerWidth + 1).sort((a, b) => b.right - a.right).slice(0, 8) }))
  console.log(screen, JSON.stringify(overflow))
}
await browser.close()
await server.close()
