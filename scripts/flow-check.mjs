import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
const server=await createServer({server:{host:'127.0.0.1',port:5173}});await server.listen()
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--no-sandbox']})
const page=await browser.newPage({viewport:{width:900,height:900},acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message))
await page.goto('http://127.0.0.1:5173/');await page.getByRole('button',{name:/Write it/}).click();await page.getByText('Now write A.').waitFor()
const box=await page.locator('.draw-surface').boundingBox();if(!box)throw new Error('Canvas absent')
await page.mouse.move(box.x+box.width*.36,box.y+box.height*.7);await page.mouse.down();await page.mouse.move(box.x+box.width*.51,box.y+box.height*.25,{steps:12});await page.mouse.move(box.x+box.width*.66,box.y+box.height*.7,{steps:12});await page.mouse.up()
const drawnPathLength=await page.locator('.draw-surface .ink-path').last().getAttribute('d').then(path=>path?.length||0)
await page.getByRole('button',{name:/Next letter/}).click();await page.getByText('Now write B.').waitFor()
await page.waitForFunction(async()=>{const {loadProject}=await import('/src/lib/storage.ts');return !!(await loadProject())?.glyphs.A?.svgPathData})
const saved=await page.evaluate(async()=>{const {loadProject}=await import('/src/lib/storage.ts');return (await loadProject())?.glyphs.A?.svgPathData.length||0})
await page.reload();await page.getByRole('button',{name:/Continue your last font/}).click();await page.getByText('Your specimen sheet').waitFor()
await page.getByRole('button',{name:/Export/}).click();const downloadPromise=page.waitForEvent('download');await page.getByRole('button',{name:/Download/}).first().click();const fontDownload=await downloadPromise
await page.getByRole('button',{name:'Back to home'}).click();await page.getByRole('button',{name:/Upload it/}).click();await page.getByRole('button',{name:/One letter at a time/}).click();await page.locator('input[type=file]').setInputFiles('public/samples/a.png');await page.getByLabel('Traced B').waitFor({timeout:15000})
await page.getByRole('button',{name:'Back to home'}).click();await page.getByRole('button',{name:/Upload it/}).click();await page.getByRole('button',{name:/A whole sheet/}).click()
const pngPromise=page.waitForEvent('download');await page.getByRole('button',{name:/PNG/}).click();const png=await pngPromise,tempSheet=path.join(os.tmpdir(),'eluthu-sheet-qa.png');await png.saveAs(tempSheet)
await page.locator('input[type=file]').setInputFiles(tempSheet);await page.getByText(/Printable sheet detected|Free-form page detected/).waitFor({timeout:20000});const count=await page.locator('.detect-box').count(),sheetMode=await page.locator('.sheet-status').innerText()
console.log(JSON.stringify({drawnPathLength,savedPathLength:saved,fontDownload:fontDownload.suggestedFilename(),sheetMode,sheetBoxes:count,errors},null,2))
await fs.mkdir('docs',{recursive:true});await browser.close();await server.close()
