import type { Glyph } from '../model'
import { bounds } from './path'

export function usesAutoSpacing(glyph: Glyph): boolean {
  // Existing projects stored 1000 for every untouched letter.
  return glyph.spacingMode === 'auto' || (glyph.spacingMode !== 'manual' && glyph.advanceWidth === 1000)
}

export function glyphMetrics(glyph: Glyph, defaultSideBearing: number) {
  const ink = bounds(glyph.svgPathData)
  const sideBearing = Math.max(0, Math.min(200, defaultSideBearing))
  const naturalWidth = Math.max(180, Math.round(ink.width + sideBearing * 2))
  const advanceWidth = usesAutoSpacing(glyph) ? naturalWidth : Math.max(160, Math.round(glyph.advanceWidth))
  return { advanceWidth, leftShift: sideBearing - ink.x, inkWidth: ink.width }
}
