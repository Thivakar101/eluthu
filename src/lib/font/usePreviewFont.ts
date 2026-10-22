import { useEffect, useState } from 'react'
import { useApp } from '../../store'
import { buildFontAsync } from './client'
export function usePreviewFont(){
  const project=useApp(s=>s.project),[version,setVersion]=useState(0)
  useEffect(()=>{if(!Object.values(project.glyphs).some(g=>g.svgPathData))return;let alive=true,url='',face:FontFace|undefined;const timer=setTimeout(()=>{buildFontAsync(project,'otf').then(buffer=>{if(!alive)return;url=URL.createObjectURL(new Blob([buffer],{type:'font/otf'}));face=new FontFace('EluthuPreview',`url(${url})`);return face.load().then(loaded=>{if(alive){document.fonts.add(loaded);setVersion(v=>v+1)}})}).catch(()=>{})},250);return()=>{alive=false;clearTimeout(timer);if(face)document.fonts.delete(face);if(url)URL.revokeObjectURL(url)}},[project])
  return version>0?'EluthuPreview, Fraunces, serif':'Fraunces, serif'
}
