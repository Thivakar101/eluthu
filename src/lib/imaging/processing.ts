export interface Box { x: number; y: number; width: number; height: number; area?: number; char?: string }
export function otsu(gray: Uint8Array) {
  const hist=new Uint32Array(256);for(const v of gray)hist[v]++
  let sum=0;for(let i=0;i<256;i++)sum+=i*hist[i]
  let background=0,lower=0,best=0,threshold=128
  for(let i=0;i<256;i++){background+=hist[i];if(!background)continue;const foreground=gray.length-background;if(!foreground)break;lower+=i*hist[i];const between=background*foreground*((lower/background)-((sum-lower)/foreground))**2;if(between>best){best=between;threshold=i}}
  return threshold
}
export function binarize(data: ImageData, adjustment=0) {
  const gray=new Uint8Array(data.width*data.height)
  for(let i=0;i<gray.length;i++){const alpha=data.data[i*4+3]/255;gray[i]=Math.round((data.data[i*4]*.2126+data.data[i*4+1]*.7152+data.data[i*4+2]*.0722)*alpha+255*(1-alpha))}
  const limit=Math.max(25,Math.min(235,otsu(gray)+adjustment))
  return { binary:gray.map(v=>v<limit?1:0),threshold:limit }
}
export function components(binary: Uint8Array,w:number,h:number,minArea=4):Box[]{
  const seen=new Uint8Array(binary.length),boxes:Box[]=[]
  const stack:number[]=[]
  for(let i=0;i<binary.length;i++){
    if(!binary[i]||seen[i])continue
    seen[i]=1;stack.push(i);let minX=w,minY=h,maxX=0,maxY=0,area=0
    while(stack.length){const p=stack.pop()!,x=p%w,y=Math.floor(p/w);area++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);for(const n of [p-1,p+1,p-w,p+w]){if(n<0||n>=binary.length||seen[n]||!binary[n])continue;const nx=n%w,ny=Math.floor(n/w);if(Math.abs(nx-x)+Math.abs(ny-y)!==1)continue;seen[n]=1;stack.push(n)}}
    if(area>=minArea)boxes.push({x:minX,y:minY,width:maxX-minX+1,height:maxY-minY+1,area})
  }
  return boxes
}
export function mergeFragments(boxes:Box[]):Box[]{
  const result=boxes.map(b=>({...b})),removed=new Set<number>()
  for(let i=0;i<result.length;i++){
    if(removed.has(i))continue
    for(let j=i+1;j<result.length;j++){
      if(removed.has(j))continue
      const a=result[i],b=result[j],overlap=Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)),gap=Math.max(0,Math.max(a.y,b.y)-Math.min(a.y+a.height,b.y+b.height))
      const near=overlap>Math.min(a.width,b.width)*.45&&gap<Math.max(a.height,b.height)*.65
      const tiny=Math.min(a.area||0,b.area||0)<Math.max(a.area||0,b.area||0)*.32
      if(near&&tiny){const x=Math.min(a.x,b.x),y=Math.min(a.y,b.y);a.width=Math.max(a.x+a.width,b.x+b.width)-x;a.height=Math.max(a.y+a.height,b.y+b.height)-y;a.x=x;a.y=y;a.area=(a.area||0)+(b.area||0);removed.add(j)}
    }
  }
  return result.filter((_,i)=>!removed.has(i))
}
export function clusterRows(boxes:Box[]):Box[][] {
  const rows:Box[][]=[]
  for(const box of [...boxes].sort((a,b)=>a.y-b.y)){
    const cy=box.y+box.height/2
    const row=rows.find(r=>{const centers=r.map(b=>b.y+b.height/2);const avg=centers.reduce((a,b)=>a+b,0)/centers.length;const h=Math.max(...r.map(b=>b.height),box.height);return Math.abs(cy-avg)<h*.6})
    if(row)row.push(box);else rows.push([box])
  }
  return rows.map(row=>row.sort((a,b)=>a.x-b.x)).sort((a,b)=>Math.min(...a.map(v=>v.y))-Math.min(...b.map(v=>v.y)))
}
function simplify(points:[number,number][],epsilon:number):[number,number][]{
  if(points.length<4)return points
  const first=points[0],last=points[points.length-1];let index=0,dmax=0
  for(let i=1;i<points.length-1;i++){const p=points[i],dx=last[0]-first[0],dy=last[1]-first[1],t=dx*dx+dy*dy?Math.max(0,Math.min(1,((p[0]-first[0])*dx+(p[1]-first[1])*dy)/(dx*dx+dy*dy))):0,d=Math.hypot(p[0]-first[0]-t*dx,p[1]-first[1]-t*dy);if(d>dmax){dmax=d;index=i}}
  if(dmax<=epsilon)return[first,last]
  return [...simplify(points.slice(0,index+1),epsilon).slice(0,-1),...simplify(points.slice(index),epsilon)]
}
export function trace(binary:Uint8Array,w:number,h:number,region:Box):string {
  const x0=Math.max(0,Math.floor(region.x)),y0=Math.max(0,Math.floor(region.y)),x1=Math.min(w,Math.ceil(region.x+region.width)),y1=Math.min(h,Math.ceil(region.y+region.height))
  const edges=new Map<string,[number,number][]>()
  const put=(a:[number,number],b:[number,number])=>{const key=a.join(',');const arr=edges.get(key)||[];arr.push(b);edges.set(key,arr)}
  const dark=(x:number,y:number)=>x>=x0&&x<x1&&y>=y0&&y<y1&&binary[y*w+x]===1
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){if(!dark(x,y))continue;if(!dark(x,y-1))put([x,y],[x+1,y]);if(!dark(x+1,y))put([x+1,y],[x+1,y+1]);if(!dark(x,y+1))put([x+1,y+1],[x,y+1]);if(!dark(x-1,y))put([x,y+1],[x,y])}
  const paths:string[]=[];let safety=0
  while(edges.size&&safety++<10000){const startKey=edges.keys().next().value as string;const start=startKey.split(',').map(Number) as [number,number];let current=start;const loop:[number,number][]=[start]
    for(let step=0;step<100000;step++){const key=current.join(','),targets=edges.get(key);if(!targets?.length)break;const next=targets.pop()!;if(!targets.length)edges.delete(key);loop.push(next);current=next;if(next[0]===start[0]&&next[1]===start[1])break}
    if(loop.length<5)continue
    const scale=Math.min(800/Math.max(1,region.width),700/Math.max(1,region.height)),left=(1000-region.width*scale)/2,top=(1000-region.height*scale)/2
    const pts=simplify(loop,Math.max(1,Math.min(region.width,region.height)*.004)).map(([x,y])=>[(x-region.x)*scale+left,(y-region.y)*scale+top] as [number,number])
    paths.push(`M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} `+pts.slice(1).map(p=>`L ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ')+' Z')
  }
  return paths.join(' ')
}
export function inkBounds(binary:Uint8Array,w:number,h:number):Box {
  const parts=components(binary,w,h,Math.max(5,Math.floor(w*h*.00002))).filter(b=>b.area!<w*h*.7)
  if(!parts.length)return{x:0,y:0,width:w,height:h}
  return{x:Math.min(...parts.map(p=>p.x)),y:Math.min(...parts.map(p=>p.y)),width:Math.max(...parts.map(p=>p.x+p.width))-Math.min(...parts.map(p=>p.x)),height:Math.max(...parts.map(p=>p.y+p.height))-Math.min(...parts.map(p=>p.y))}
}
export function findTemplateMarks(binary:Uint8Array,w:number,h:number):[number,number][]|null {
  const parts=components(binary,w,h,Math.max(12,Math.round(w*h*.00002)))
  const corners:[[number,number],[number,number],[number,number],[number,number]]=[[.035,.035],[.965,.035],[.035,.965],[.965,.965]]
  const marks:[number,number][]=[]
  for(const [rx,ry] of corners){const targetX=rx*w,targetY=ry*h,candidates=parts.filter(b=>{const cx=b.x+b.width/2,cy=b.y+b.height/2;return Math.abs(cx-targetX)<w*.13&&Math.abs(cy-targetY)<h*.12&&b.width>w*.008&&b.width<w*.065&&b.height>h*.008&&b.height<h*.065})
    if(!candidates.length)return null
    const match=candidates.sort((a,b)=>{const score=(v:Box)=>Math.hypot((v.x+v.width/2-targetX)/w,(v.y+v.height/2-targetY)/h)+Math.abs(v.width/w-.022)+Math.abs(v.height/h-.022);return score(a)-score(b)})[0]
    marks.push([match.x+match.width/2,match.y+match.height/2])
  }
  return marks
}
export function warpPerspective(data:ImageData,marks:[number,number][]):ImageData {
  const w=data.width,h=data.height,dest:[[number,number],[number,number],[number,number],[number,number]]=[[w*.035,h*.035],[w*.965,h*.035],[w*.035,h*.965],[w*.965,h*.965]]
  const matrix:number[][]=[]
  for(let i=0;i<4;i++){const [u,v]=dest[i],[x,y]=marks[i];matrix.push([u,v,1,0,0,0,-u*x,-v*x,x]);matrix.push([0,0,0,u,v,1,-u*y,-v*y,y])}
  for(let col=0;col<8;col++){let pivot=col;for(let row=col+1;row<8;row++)if(Math.abs(matrix[row][col])>Math.abs(matrix[pivot][col]))pivot=row;[matrix[col],matrix[pivot]]=[matrix[pivot],matrix[col]];const divisor=matrix[col][col];if(Math.abs(divisor)<1e-8)return data;for(let j=col;j<9;j++)matrix[col][j]/=divisor;for(let row=0;row<8;row++){if(row===col)continue;const factor=matrix[row][col];for(let j=col;j<9;j++)matrix[row][j]-=factor*matrix[col][j]}}
  const p=matrix.map(row=>row[8]),out=new ImageData(w,h)
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const z=p[6]*x+p[7]*y+1,sx=Math.round((p[0]*x+p[1]*y+p[2])/z),sy=Math.round((p[3]*x+p[4]*y+p[5])/z),di=(y*w+x)*4;if(sx>=0&&sx<w&&sy>=0&&sy<h){const si=(sy*w+sx)*4;out.data[di]=data.data[si];out.data[di+1]=data.data[si+1];out.data[di+2]=data.data[si+2];out.data[di+3]=255}else{out.data[di]=255;out.data[di+1]=255;out.data[di+2]=255;out.data[di+3]=255}}
  return out
}
