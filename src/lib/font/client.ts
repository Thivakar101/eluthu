import type { Project } from '../model'
let worker:Worker|undefined,sequence=0
const pending=new Map<number,{resolve:(buffer:ArrayBuffer)=>void;reject:(reason:unknown)=>void}>()
function getWorker(){if(!worker){worker=new Worker(new URL('../../workers/font.worker.ts',import.meta.url),{type:'module'});worker.onmessage=(e:MessageEvent<{id:number;ok:boolean;buffer?:ArrayBuffer;error?:string}>)=>{const task=pending.get(e.data.id);if(!task)return;pending.delete(e.data.id);e.data.ok?task.resolve(e.data.buffer!):task.reject(new Error(e.data.error))}}return worker}
export function buildFontAsync(project:Project,format:'otf'|'ttf'|'woff2'){const id=++sequence;return new Promise<ArrayBuffer>((resolve,reject)=>{pending.set(id,{resolve,reject});getWorker().postMessage({id,project,format})})}
