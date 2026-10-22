import type { Box } from './processing'
let worker:Worker|undefined,sequence=0
const pending=new Map<number,{resolve:(value:unknown)=>void;reject:(reason:unknown)=>void}>()
function getWorker(){if(!worker){worker=new Worker(new URL('../../workers/imaging.worker.ts',import.meta.url),{type:'module'});worker.onmessage=(event:MessageEvent<{id:number;ok:boolean;result?:unknown;error?:string}>)=>{const task=pending.get(event.data.id);if(!task)return;pending.delete(event.data.id);event.data.ok?task.resolve(event.data.result):task.reject(new Error(event.data.error))}}return worker}
function request<T>(file:File,mode:'single'|'sheet',threshold=0,erasures:{x:number;y:number;r:number}[]=[]):Promise<T>{const id=++sequence;return new Promise((resolve,reject)=>{pending.set(id,{resolve:resolve as (value:unknown)=>void,reject});getWorker().postMessage({id,file,mode,threshold,erasures})})}
export interface SingleResult{path:string;box:Box;width:number;height:number;threshold:number}
export interface SheetResult{boxes:Box[];marked:boolean;width:number;height:number;threshold:number;corrected?:Blob}
export const processSingle=(file:File,threshold=0,erasures:{x:number;y:number;r:number}[]=[])=>request<SingleResult>(file,'single',threshold,erasures)
export const processSheet=(file:File,threshold=0)=>request<SheetResult>(file,'sheet',threshold)
