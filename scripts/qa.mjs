import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
import { createServer } from 'vite'
const server=await createServer({server:{host:'127.0.0.1',port:5173}})
await server.listen()
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--no-sandbox']})
const errors=[]
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1})
page.on('pageerror',error=>errors.push(error.message))
await page.goto('http://127.0.0.1:5173/')
await page.evaluate(async()=>{
  const {useApp}=await import('/src/store.ts')
  const base=useApp.getState().project
  const paths={A:'M 100 790 L 450 140 L 550 140 L 900 790 L 790 790 L 650 520 L 350 520 L 210 790 Z',B:'M 160 140 L 560 140 L 730 210 L 770 340 L 680 470 L 790 570 L 760 700 L 620 790 L 160 790 Z',C:'M 790 210 L 650 140 L 340 170 L 180 340 L 170 590 L 340 760 L 650 790 L 790 710 L 740 620 L 630 680 L 390 660 L 290 550 L 290 360 L 390 260 L 630 250 L 740 300 Z'}
  const glyphs=Object.fromEntries(Object.entries(paths).map(([char,svgPathData])=>[char,{char,unicode:char.charCodeAt(0),svgPathData,advanceWidth:1000,lsb:80,source:'draw',status:'done'}]))
  const project={...base,name:'Mira’s handwriting',glyphs,coachPosition:3}
  useApp.setState({project})
  const {saveProject}=await import('/src/lib/storage.ts')
  await saveProject(project)
})
await fs.mkdir('docs/screens',{recursive:true})
for(const width of [375,768,1440])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:900})
  await page.evaluate(async(theme)=>{const {useApp}=await import('/src/store.ts');useApp.getState().setTheme(theme)},theme)
  for(const [screen,mode] of [['home','draw'],['design','draw'],['coach','draw'],['coach','upload'],['upload-choice','upload'],['sheet','upload'],['review','draw'],['export','draw'],['complete','draw']]){
    await page.evaluate(async({screen,mode})=>{const {useApp}=await import('/src/store.ts');useApp.getState().setMode(mode);useApp.getState().setScreen(screen)},{screen,mode})
    await page.waitForTimeout(screen==='complete'?1500:550)
    await page.screenshot({path:`docs/screens/${screen}${screen==='coach'?'-'+mode:''}-${width}-${theme}.png`,fullPage:true})
  }
}
await page.setViewportSize({width:1440,height:900})
const built=await page.evaluate(async()=>{const {useApp}=await import('/src/store.ts');const {buildFontAsync}=await import('/src/lib/font/client.ts');const project=useApp.getState().project;const result={};for(const format of ['otf','ttf','woff2']){try{const data=await Promise.race([buildFontAsync(project,format),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Timed out')),12000))]);result[format]=data.byteLength}catch(error){result[format]=String(error)}}return result})
console.log(JSON.stringify({built,errors},null,2))
await browser.close()
await server.close()
