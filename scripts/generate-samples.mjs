import { chromium } from '@playwright/test'
import fs from 'node:fs/promises'
const browser=await chromium.launch({headless:true,executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',args:['--no-sandbox']})
const page=await browser.newPage()
await fs.mkdir('public/samples',{recursive:true})
for(const char of ['a','b','c']){
  const data=await page.evaluate(char=>{
    const c=document.createElement('canvas');c.width=800;c.height=800;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,800,800);x.strokeStyle='#1A1712';x.lineWidth=32;x.lineCap='round';x.lineJoin='round';x.beginPath()
    if(char==='a'){x.moveTo(220,630);x.bezierCurveTo(300,470,365,300,425,160);x.bezierCurveTo(485,320,565,490,635,630);x.moveTo(295,485);x.bezierCurveTo(375,500,485,490,555,475)}
    if(char==='b'){x.moveTo(270,140);x.bezierCurveTo(255,300,260,480,268,610);x.moveTo(275,500);x.bezierCurveTo(340,340,570,330,590,470);x.bezierCurveTo(605,620,390,680,275,560)}
    if(char==='c'){x.moveTo(570,370);x.bezierCurveTo(470,280,290,325,270,480);x.bezierCurveTo(250,630,460,675,580,565)}
    x.stroke();return c.toDataURL('image/png').split(',')[1]
  },char)
  await fs.writeFile(`public/samples/${char}.png`,Buffer.from(data,'base64'))
}
await browser.close()
