import { CHARSET } from '../charset'
import { downloadBlob } from '../storage'
export const TEMPLATE_COLS = 8
export const TEMPLATE_ROWS = Math.ceil(CHARSET.length / TEMPLATE_COLS)
export function templateCell(index: number, width: number, height: number) {
  const marginX = width * .075, top = height * .15, gridWidth = width - marginX * 2, gridHeight = height * .76
  const cellW = gridWidth / TEMPLATE_COLS, cellH = gridHeight / TEMPLATE_ROWS
  return { x: marginX + (index % TEMPLATE_COLS) * cellW, y: top + Math.floor(index / TEMPLATE_COLS) * cellH, width: cellW, height: cellH }
}
function drawTemplate(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, w, h)
  ctx.strokeStyle = '#16150F'; ctx.lineWidth = w * .003
  const marks = [[w*.035,h*.035],[w*.965,h*.035],[w*.035,h*.965],[w*.965,h*.965]]
  for (const [x,y] of marks) { ctx.strokeRect(x-w*.011,y-w*.011,w*.022,w*.022) }
  ctx.fillStyle = '#16150F'; ctx.font = `${w*.046}px Georgia`; ctx.fillText('Eluthu · handwriting sheet', w*.075, h*.105)
  ctx.font = `${w*.016}px Arial`; ctx.fillText('Write one character in each box. Photograph the full page in even light.',w*.075,h*.127)
  for (let i=0;i<CHARSET.length;i++) { const c=templateCell(i,w,h);ctx.strokeStyle='#C9C5BD';ctx.lineWidth=1;ctx.strokeRect(c.x,c.y,c.width,c.height);ctx.fillStyle='#8C877B';ctx.font=`${w*.013}px Arial`;ctx.fillText(CHARSET[i].char,c.x+8,c.y+18) }
}
export function downloadTemplate(type: 'png'|'pdf') {
  if (type === 'png') { const canvas=document.createElement('canvas');canvas.width=2480;canvas.height=3508;drawTemplate(canvas.getContext('2d')!,canvas.width,canvas.height);canvas.toBlob(blob => { if(blob) downloadBlob(blob,'eluthu-handwriting-sheet.png') },'image/png'); return }
  // A4 PDF built directly to keep the printable sheet offline and dependency free.
  const W=595,H=842, commands:string[]=[]
  const line=(x1:number,y1:number,x2:number,y2:number)=>commands.push(`${x1.toFixed(2)} ${(H-y1).toFixed(2)} m ${x2.toFixed(2)} ${(H-y2).toFixed(2)} l S`)
  const rect=(x:number,y:number,w:number,h:number)=>commands.push(`${x.toFixed(2)} ${(H-y-h).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re S`)
  const label=(text:string,x:number,y:number,size:number)=>commands.push(`BT /F1 ${size} Tf ${x.toFixed(2)} ${(H-y).toFixed(2)} Td (${text.replace(/[()\\]/g,'\\$&')}) Tj ET`)
  commands.push('0 0 0 RG .7 w'); for(const [x,y] of [[21,21],[574,21],[21,821],[574,821]])rect(x-6,y-6,12,12)
  label('Eluthu handwriting sheet',45,82,21);label('Write one character in each box. Photograph the full page in even light.',45,100,8)
  for(let i=0;i<CHARSET.length;i++){const c=templateCell(i,W,H);rect(c.x,c.y,c.width,c.height);label(CHARSET[i].char,c.x+5,c.y+11,7);line(c.x+3,c.y+c.height*.79,c.x+c.width-3,c.y+c.height*.79)}
  const stream=commands.join('\n'), objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>',`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>`,'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`]
  let pdf='%PDF-1.4\n';const offsets=[0];for(let i=0;i<objects.length;i++){offsets.push(pdf.length);pdf+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`}const start=pdf.length;pdf+=`xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;for(let i=1;i<offsets.length;i++)pdf+=`${String(offsets[i]).padStart(10,'0')} 00000 n \n`;pdf+=`trailer << /Size ${objects.length+1} /Root 1 0 R >>\nstartxref\n${start}\n%%EOF`;downloadBlob(new Blob([pdf],{type:'application/pdf'}),'eluthu-handwriting-sheet.pdf')
}
