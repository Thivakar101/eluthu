import { chromium } from '@playwright/test'
import { createServer } from 'vite'
const server=await createServer({server:{host:'127.0.0.1',port:5173}});await server.listen()
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--no-sandbox']})
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5173/');await page.waitForTimeout(900)
const result=await page.evaluate(async()=>{const {newProject}=await import('/src/lib/model.ts'),{buildFontAsync}=await import('/src/lib/font/client.ts');const project=newProject();project.glyphs.A={char:'A',unicode:65,svgPathData:'M 100 790 L 500 120 L 900 790 L 760 790 L 500 350 L 240 790 Z',advanceWidth:1000,lsb:80,source:'draw',status:'done'};const result={};for(const format of ['otf','ttf','woff2']){try{const buffer=await Promise.race([buildFontAsync(project,format),new Promise((_,reject)=>setTimeout(()=>reject(new Error('timeout')),15000))]);result[format]={length:buffer.byteLength,signature:[...new Uint8Array(buffer.slice(0,4))]}}catch(error){result[format]=String(error)}}return result})
console.log(JSON.stringify({result,errors},null,2));await browser.close();await server.close()
