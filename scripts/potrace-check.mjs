import { chromium } from '@playwright/test'
import { createServer } from 'vite'
const server=await createServer({server:{host:'127.0.0.1',port:5173}});await server.listen()
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--no-sandbox']})
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:5173/')
const result=await page.evaluate(async()=>{const {tracePotrace}=await import('/src/lib/imaging/potrace.ts');const data=new Uint8Array(10000);for(let y=15;y<85;y++)for(let x=15;x<85;x++)if(Math.hypot(x-50,y-50)<35&&Math.hypot(x-50,y-50)>17)data[y*100+x]=1;const path=await tracePotrace(data,100,100,{x:15,y:15,width:70,height:70});const {newProject}=await import('/src/lib/model.ts');const {buildFontAsync}=await import('/src/lib/font/client.ts');const project=newProject();project.glyphs.O={char:'O',unicode:79,svgPathData:path,advanceWidth:1000,lsb:80,source:'upload-single',status:'done'};const font=await buildFontAsync(project,'ttf');return{pathLength:path.length,subpaths:(path.match(/M /g)||[]).length,curves:(path.match(/C /g)||[]).length,fontBytes:font.byteLength}})
console.log(JSON.stringify({result,errors},null,2));await browser.close();await server.close()
