import { chromium } from '@playwright/test'
import { createServer } from 'vite'
import os from 'node:os'
import path from 'node:path'
const server=await createServer({server:{host:'127.0.0.1',port:5173}});await server.listen()
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--no-sandbox']})
const page=await browser.newPage({acceptDownloads:true});await page.goto('http://127.0.0.1:5173/')
const wait=page.waitForEvent('download');await page.getByRole('button',{name:/Download a printable sheet/}).click();const file=await wait,target=path.join(os.tmpdir(),'eluthu-handwriting-sheet.pdf');await file.saveAs(target);console.log(target)
await browser.close();await server.close()
