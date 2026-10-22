import opentype from 'opentype.js'
import type { Project } from '../model'
import { CHARSET } from '../charset'
import { offsetPath, parsePath } from './path'
import { glyphMetrics } from './metrics'
const license = 'This font was made from the creator’s handwriting with Eluthu. The creator retains rights to their handwriting.'
export function buildFont(project: Project): opentype.Font {
  const notdef = new opentype.Path()
  notdef.moveTo(80, -100); notdef.lineTo(80, 700); notdef.lineTo(690, 700); notdef.lineTo(690, -100); notdef.closePath()
  notdef.moveTo(150, -30); notdef.lineTo(620, -30); notdef.lineTo(620, 630); notdef.lineTo(150, 630); notdef.closePath()
  const glyphs = [new opentype.Glyph({ name: '.notdef', advanceWidth: 770, path: notdef }), new opentype.Glyph({ name: 'space', unicode: 32, advanceWidth: 380, path: new opentype.Path() })]
  for (const { char } of CHARSET) {
    const glyph = project.glyphs[char]
    if (!glyph || !glyph.svgPathData || glyph.status === 'skipped') continue
    const adjusted = offsetPath(glyph.svgPathData, project.settings.weightOffset)
    const path = parsePath(adjusted)
    const metrics = glyphMetrics({ ...glyph, svgPathData: adjusted }, project.settings.sideBearing)
    for (const command of path.commands) {
      if ('x' in command && typeof command.x === 'number') command.x += metrics.leftShift
      if ('x1' in command && typeof command.x1 === 'number') command.x1 += metrics.leftShift
      if ('x2' in command && typeof command.x2 === 'number') command.x2 += metrics.leftShift
    }
    glyphs.push(new opentype.Glyph({ name: `uni${glyph.unicode.toString(16).padStart(4, '0').toUpperCase()}`, unicode: glyph.unicode, advanceWidth: metrics.advanceWidth, path }))
  }
  return new opentype.Font({ familyName: project.name || 'My handwriting', styleName: 'Regular', unitsPerEm: 1000, ascender: 800, descender: -200, glyphs, designer: 'Created with Eluthu', manufacturer: 'Eluthu', license })
}
export function fontBuffer(project: Project): ArrayBuffer { return buildFont(project).toArrayBuffer() }
export function validateProject(project: Project) {
  const done = Object.values(project.glyphs).filter(g => g.status !== 'skipped' && !!g.svgPathData)
  const unique = new Set(done.map(g => g.unicode)).size === done.length
  const validWidths = done.every(g => Number.isFinite(g.advanceWidth) && g.advanceWidth > 0)
  return { done: done.length, missing: CHARSET.length - done.length, valid: unique && validWidths, unique, validWidths }
}
