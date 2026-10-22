import { describe, expect, it } from 'vitest'
import opentype from 'opentype.js'
import { CHARSET, nextUnfinished } from './charset'
import { newProject } from './model'
import { assignInOrder } from './imaging/assignment'
import { clusterRows, mergeFragments, otsu, trace } from './imaging/processing'
import { templateCell } from './imaging/template'
import { bounds, normalize, offsetPath } from './font/path'
import { buildFont, fontBuffer, validateProject } from './font/build'
import { glyphMetrics } from './font/metrics'
describe('letter coach',()=>{
  it('keeps a single alphabet and punctuation order',()=>{expect(CHARSET.slice(0,4).map(c=>c.char)).toEqual(['A','B','C','D']);expect(CHARSET[26].char).toBe('a');expect(CHARSET[52].char).toBe('0');expect(new Set(CHARSET.map(c=>c.char)).size).toBe(CHARSET.length)})
  it('moves past done and skipped letters, then wraps to the next missing one',()=>{expect(nextUnfinished({A:true,B:true},0)).toBe(2);expect(nextUnfinished({A:true,B:true},2)).toBe(3);const all=Object.fromEntries(CHARSET.map(c=>[c.char,true]));expect(nextUnfinished(all,0)).toBe(CHARSET.length);delete all.C;expect(nextUnfinished(all,CHARSET.length-1)).toBe(2)})
  it('assigns a batch from the current letter without duplicate overflow',()=>{expect(assignInOrder(['one','two','three'],'Y').map(v=>v.char)).toEqual(['Y','Z','a']);expect(assignInOrder([1,2,3],'~').map(v=>v.char)).toEqual(['~'])})
})
describe('sheet processing',()=>{
  it('cuts cells in a stable grid',()=>{const a=templateCell(0,800,1200),b=templateCell(8,800,1200);expect(a.width).toBe(b.width);expect(b.y).toBeGreaterThan(a.y);expect(templateCell(7,800,1200).x).toBeGreaterThan(a.x)})
  it('merges nearby dot and stem fragments',()=>{const merged=mergeFragments([{x:10,y:10,width:4,height:4,area:16},{x:9,y:25,width:10,height:25,area:180},{x:70,y:10,width:15,height:35,area:200}]);expect(merged).toHaveLength(2);expect(merged[0].height).toBe(40)})
  it('clusters rows in reading order',()=>{const rows=clusterRows([{x:50,y:100,width:10,height:20},{x:30,y:10,width:10,height:20},{x:10,y:100,width:10,height:20},{x:80,y:10,width:10,height:20}]);expect(rows.map(row=>row.map(b=>b.x))).toEqual([[30,80],[10,50]])})
  it('finds contrast and traces a small raster square',()=>{const gray=new Uint8Array([0,0,255,255]);expect(otsu(gray)).toBeLessThan(255);const binary=new Uint8Array(100);for(let y=3;y<7;y++)for(let x=3;x<7;x++)binary[y*10+x]=1;expect(trace(binary,10,10,{x:3,y:3,width:4,height:4})).toMatch(/^M /)})
})
describe('font output',()=>{
  it('normalizes a path inside the em',()=>{const path=normalize('M 20 20 L 100 20 L 100 80 L 20 80 Z','A');const b=bounds(path);expect(b.x).toBeGreaterThanOrEqual(79);expect(b.y).toBeGreaterThanOrEqual(149);expect(b.y+b.height).toBeLessThanOrEqual(791)})
  it('adjusts outline weight without changing the original path',()=>{const path='M 200 200 L 800 200 L 800 800 L 200 800 Z';expect(bounds(offsetPath(path,15)).width).toBeGreaterThan(bounds(path).width);expect(path).toContain('200 200')})
  it('builds an installable font with unicode and metrics',()=>{const project=newProject();project.glyphs.A={char:'A',unicode:65,svgPathData:'M 100 790 L 500 150 L 900 790 L 750 790 L 500 360 L 250 790 Z',advanceWidth:1000,lsb:80,source:'draw',status:'done'};const font=buildFont(project),buffer=fontBuffer(project),parsed=opentype.parse(buffer);expect(font.glyphs.length).toBe(3);expect(parsed.glyphs.length).toBe(3);expect(parsed.charToGlyph('A').advanceWidth).toBe(960);expect(parsed.charToGlyph('A').getBoundingBox().x1).toBe(80);expect(parsed.charToGlyph('A').unicode).toBe(65);expect(parsed.unitsPerEm).toBe(1000);expect(validateProject(project).missing).toBe(CHARSET.length-1)})
  it('spaces narrow letters by their ink, including old saved projects',()=>{const project=newProject();project.glyphs.l={char:'l',unicode:108,svgPathData:'M 470 150 L 530 150 L 530 790 L 470 790 Z',advanceWidth:1000,lsb:80,source:'draw',status:'done'};project.glyphs.m={char:'m',unicode:109,svgPathData:'M 180 310 L 820 310 L 820 790 L 180 790 Z',advanceWidth:1000,lsb:80,source:'draw',status:'done'};const font=buildFont(project);expect(font.charToGlyph('l').advanceWidth).toBe(220);expect(font.charToGlyph('m').advanceWidth).toBe(800);expect(font.charToGlyph('l').getBoundingBox().x1).toBe(80);expect(glyphMetrics({...project.glyphs.l,advanceWidth:350,spacingMode:'manual'},80).advanceWidth).toBe(350)})
})
