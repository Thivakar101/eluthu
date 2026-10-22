import opentype from 'opentype.js'
const command = /([MLQCZ])([^MLQCZ]*)/gi
const numbers = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi
export function parsePath(data: string): opentype.Path {
  const path = new opentype.Path()
  for (const match of data.matchAll(command)) {
    const kind = match[1].toUpperCase()
    const values = [...match[2].matchAll(numbers)].map(item => Number(item[0]))
    const y = (v: number) => 800 - v
    if (kind === 'M' && values.length >= 2) path.moveTo(values[0], y(values[1]))
    if (kind === 'L' && values.length >= 2) path.lineTo(values[0], y(values[1]))
    if (kind === 'Q' && values.length >= 4) path.quadraticCurveTo(values[0], y(values[1]), values[2], y(values[3]))
    if (kind === 'C' && values.length >= 6) path.bezierCurveTo(values[0], y(values[1]), values[2], y(values[3]), values[4], y(values[5]))
    if (kind === 'Z') path.closePath()
  }
  return path
}
export function pointsToPath(points: number[][]): string {
  if (!points.length) return ''
  return `M ${points[0][0].toFixed(1)} ${points[0][1].toFixed(1)} ` + points.slice(1).map(([x, y]) => `L ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ') + ' Z'
}
export function transformPath(data: string, sx: number, sy: number, dx: number, dy: number): string {
  return data.replace(command, (_, kind: string, raw: string) => {
    const vals = [...raw.matchAll(numbers)].map(item => Number(item[0]))
    return kind.toUpperCase() + ' ' + vals.map((value, i) => (i % 2 === 0 ? value * sx + dx : value * sy + dy).toFixed(1)).join(' ') + ' '
  })
}
export function bounds(data: string) {
  const values = [...data.matchAll(command)].flatMap(m => [...m[2].matchAll(numbers)].map(n => Number(n[0])))
  const xs = values.filter((_, i) => i % 2 === 0), ys = values.filter((_, i) => i % 2 === 1)
  return xs.length ? { x: Math.min(...xs), y: Math.min(...ys), width: Math.max(...xs) - Math.min(...xs), height: Math.max(...ys) - Math.min(...ys) } : { x: 0, y: 0, width: 0, height: 0 }
}
export function normalize(data: string, char: string, sideBearing = 80): string {
  const b = bounds(data)
  if (!b.width || !b.height) return data
  const isLower = /^[a-z]$/.test(char)
  const descender = /[gjpqy]/.test(char)
  const top = isLower && !/[bdfhklt]/.test(char) ? 310 : 150
  const bottom = descender ? 960 : 790
  const scale = Math.min((1000 - sideBearing * 2) / b.width, (bottom - top) / b.height)
  const dx = sideBearing + ((1000 - sideBearing * 2) - b.width * scale) / 2 - b.x * scale
  const dy = bottom - (b.y + b.height) * scale
  return transformPath(data, scale, scale, dx, dy)
}
const vertexPattern=/([ML])\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)/gi
export function vertices(data:string){return [...data.matchAll(vertexPattern)].map(match=>({x:Number(match[2]),y:Number(match[3])}))}
export function moveVertex(data:string,index:number,x:number,y:number){let current=-1;return data.replace(vertexPattern,(whole,kind:string)=>{current++;return current===index?`${kind} ${Math.max(0,Math.min(1000,x)).toFixed(1)} ${Math.max(0,Math.min(1000,y)).toFixed(1)}`:whole})}
export function simplifyPath(data:string,step=2){return (data.match(/M[^M]*/gi)||[]).map(part=>{const lines=[...part.matchAll(/L\s*-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?/gi)];if(lines.length<=3)return part;let index=-1;return part.replace(/L\s*-?\d+(?:\.\d+)?\s+-?\d+(?:\.\d+)?/gi,match=>{index++;return index===0||index===lines.length-1||index%step===0?match:''})}).join(' ')}
export function offsetPath(data:string,amount:number):string{
  if(!amount)return data
  return (data.match(/M[^M]*/gi)||[]).map(part=>{
    if(/[QC]/i.test(part))return part
    const pts=vertices(part);if(pts.length<3)return part
    const area=pts.reduce((sum,p,i)=>{const q=pts[(i+1)%pts.length];return sum+p.x*q.y-q.x*p.y},0),sign=area>=0?1:-1
    const moved=pts.map((p,i)=>{const prev=pts[(i-1+pts.length)%pts.length],next=pts[(i+1)%pts.length],v1={x:p.x-prev.x,y:p.y-prev.y},v2={x:next.x-p.x,y:next.y-p.y},n1={x:sign*v1.y,y:-sign*v1.x},n2={x:sign*v2.y,y:-sign*v2.x},l1=Math.hypot(n1.x,n1.y)||1,l2=Math.hypot(n2.x,n2.y)||1,nx=n1.x/l1+n2.x/l2,ny=n1.y/l1+n2.y/l2,len=Math.hypot(nx,ny)||1;return{x:p.x+amount*nx/len,y:p.y+amount*ny/len}})
    return moved.map((p,i)=>`${i===0?'M':'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')+' Z'
  }).join(' ')
}
