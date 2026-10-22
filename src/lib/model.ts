export type GlyphSource = 'draw' | 'upload-single' | 'upload-sheet'
export type GlyphStatus = 'done' | 'skipped' | 'needs-attention'
export interface Glyph {
  char: string
  unicode: number
  svgPathData: string
  advanceWidth: number
  lsb: number
  spacingMode?: 'auto' | 'manual'
  source: GlyphSource
  sourceImage?: string
  status: GlyphStatus
}
export interface Settings {
  unitsPerEm: number
  sideBearing: number
  smoothing: number
  weightOffset: number
  haptics: boolean
  showGuides: boolean
  showGhost: boolean
}
export interface Project {
  id: string
  name: string
  glyphs: Record<string, Glyph>
  settings: Settings
  coachPosition: number
  createdAt: number
  updatedAt: number
}
export const newProject = (): Project => {
  const now = Date.now()
  return { id: crypto.randomUUID(), name: 'My handwriting', glyphs: {}, settings: { unitsPerEm: 1000, sideBearing: 80, smoothing: 0.4, weightOffset: 0, haptics: true, showGuides: true, showGhost: true }, coachPosition: 0, createdAt: now, updatedAt: now }
}
