import { fontBuffer } from '../lib/font/build'
import type { Project } from '../lib/model'
type Request={id:number;project:Project;format:'otf'|'ttf'|'woff2'}
self.onmessage=async(e:MessageEvent<Request>)=>{const{id,project,format}=e.data;try{let buffer=fontBuffer(project);if(format!=='otf'){if(format==='woff2')(self as unknown as {window:unknown}).window=self;const {createFont,woff2}=await import('fonteditor-core');if(format==='woff2')await woff2.init('/fonts/woff2.wasm');const font=createFont(buffer,{type:'otf'});buffer=font.write({type:format}) as ArrayBuffer}self.postMessage({id,ok:true,buffer},{transfer:[buffer]})}catch(err){self.postMessage({id,ok:false,error:err instanceof Error?err.message:'This font could not be built.'})}}
