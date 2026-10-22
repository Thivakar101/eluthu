import { CHARSET } from '../charset'
export function assignInOrder<T>(items:T[],startChar:string){const start=Math.max(0,CHARSET.findIndex(c=>c.char===startChar));return items.slice(0,CHARSET.length-start).map((item,index)=>({item,char:CHARSET[start+index].char}))}
