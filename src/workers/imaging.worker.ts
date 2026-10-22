import { binarize, clusterRows, components, findTemplateMarks, inkBounds, mergeFragments, trace, warpPerspective, type Box } from '../lib/imaging/processing'
import { templateCell } from '../lib/imaging/template'
import { CHARSET } from '../lib/charset'
type Request={id:number;file:File;mode:'single'|'sheet';threshold?:number;erasures?:{x:number;y:number;r:number}[]}
self.onmessage=async(event:MessageEvent<Request>)=>{
  const {id,file,mode,threshold=0,erasures=[]}=event.data
  try{
    if(!file.type.startsWith('image/'))throw new Error('Choose a PNG or photo of your handwriting.')
    const bitmap=await createImageBitmap(file)
    const max=mode==='single'?640:1800,scale=Math.min(1,max/Math.max(bitmap.width,bitmap.height)),w=Math.max(1,Math.round(bitmap.width*scale)),h=Math.max(1,Math.round(bitmap.height*scale))
    const canvas=new OffscreenCanvas(w,h),ctx=canvas.getContext('2d',{willReadFrequently:true})!;ctx.drawImage(bitmap,0,0,w,h);bitmap.close()
    const pixels=ctx.getImageData(0,0,w,h)
    let {binary,threshold:usedThreshold}=binarize(pixels,threshold)
    if(mode==='single'){
      for(const mark of erasures){const cx=mark.x*w,cy=mark.y*h,r=mark.r*Math.min(w,h);for(let y=Math.max(0,Math.floor(cy-r));y<Math.min(h,Math.ceil(cy+r));y++)for(let x=Math.max(0,Math.floor(cx-r));x<Math.min(w,Math.ceil(cx+r));x++)if((x-cx)**2+(y-cy)**2<r*r)binary[y*w+x]=0}
      const box=inkBounds(binary,w,h)
      let path=''
      try { const {tracePotrace}=await import('../lib/imaging/potrace');path=await tracePotrace(binary,w,h,box) }
      catch { path=trace(binary,w,h,box) }
      self.postMessage({id,ok:true,result:{path,box,width:w,height:h,threshold:usedThreshold}})
      return
    }
    const marks=findTemplateMarks(binary,w,h),marked=!!marks
    let corrected:Blob|undefined
    if(marks){const straight=warpPerspective(pixels,marks);ctx.putImageData(straight,0,0);binary=binarize(straight,threshold).binary;corrected=await canvas.convertToBlob({type:'image/png'})}
    let boxes:Box[]=[]
    if(marked){boxes=CHARSET.map((item,i)=>({...templateCell(i,w,h),char:item.char}))}
    else {const raw=mergeFragments(components(binary,w,h,Math.max(8,Math.round(w*h*.000015)))).filter(b=>b.width>3&&b.height>3&&b.width<w*.6&&b.height<h*.4);boxes=clusterRows(raw).flat().slice(0,CHARSET.length).map((b,i)=>({...b,char:CHARSET[i].char}))}
    self.postMessage({id,ok:true,result:{boxes,marked,width:w,height:h,threshold:usedThreshold,corrected}})
  }catch(error){self.postMessage({id,ok:false,error:error instanceof Error?error.message:'This image could not be read.'})}
}
