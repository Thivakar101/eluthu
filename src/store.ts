import { create } from 'zustand'
import { CHARSET, nextUnfinished } from './lib/charset'
import { newProject, type Glyph, type Project, type Settings } from './lib/model'
import { saveProject } from './lib/storage'
export type Screen = 'home' | 'coach' | 'upload-choice' | 'sheet' | 'review' | 'export' | 'design' | 'complete'
export type Mode = 'draw' | 'upload'
interface AppState {
  project: Project
  screen: Screen
  mode: Mode
  hydrated: boolean
  toast: string
  setProject: (project: Project) => void
  setScreen: (screen: Screen) => void
  setMode: (mode: Mode) => void
  setToast: (toast: string) => void
  setPosition: (position: number) => void
  saveGlyph: (glyph: Glyph) => void
  saveBatch: (glyphs: Glyph[]) => void
  updateGlyph: (glyph: Glyph) => void
  skip: () => void
  updateSettings: (patch: Partial<Settings>) => void
  rename: (name: string) => void
}
const initial = newProject()
const persist = (project: Project) => { void saveProject(project).catch(() => {}) }
export const useApp = create<AppState>((set, get) => ({
  project: initial, screen: location.pathname === '/design' ? 'design' : 'home', mode: 'draw', hydrated: false, toast: '',
  setProject: project => { persist(project); set({ project, hydrated: true }) },
  setScreen: screen => { history.pushState({}, '', screen === 'design' ? '/design' : '/'); set({ screen }) },
  setMode: mode => set({ mode }),
  setToast: toast => set({ toast }),
  setPosition: position => { const project = { ...get().project, coachPosition: Math.max(0, Math.min(CHARSET.length - 1, position)), updatedAt: Date.now() }; persist(project); set({ project }) },
  saveGlyph: glyph => { const current = get().project; const glyphs = { ...current.glyphs, [glyph.char]: glyph }; const next = nextUnfinished(glyphs, current.coachPosition); const settings=current.coachPosition===2?{...current.settings,showGhost:false}:current.settings; const project = { ...current, glyphs, settings, coachPosition: next < CHARSET.length ? next : current.coachPosition, updatedAt: Date.now() }; persist(project); set({ project, screen: next === CHARSET.length ? 'complete' : 'coach', toast: 'Lovely.' }) },
  saveBatch: additions => { const current=get().project,glyphs={...current.glyphs};for(const glyph of additions)glyphs[glyph.char]=glyph;const next=nextUnfinished(glyphs,current.coachPosition);const project={...current,glyphs,coachPosition:next<CHARSET.length?next:current.coachPosition,updatedAt:Date.now()};persist(project);set({project,screen:next===CHARSET.length?'complete':'coach',toast:`${additions.length} letters added.`}) },
  updateGlyph: glyph => { const current=get().project,project={...current,glyphs:{...current.glyphs,[glyph.char]:glyph},updatedAt:Date.now()};persist(project);set({project}) },
  skip: () => { const current = get().project,char=CHARSET[current.coachPosition].char,glyphs={...current.glyphs,[char]:{char,unicode:char.codePointAt(0)!,svgPathData:'',advanceWidth:1000,lsb:current.settings.sideBearing,source:get().mode==='draw'?'draw' as const:'upload-single' as const,status:'skipped' as const}},next=nextUnfinished(glyphs,current.coachPosition); const project = { ...current,glyphs, coachPosition: next < CHARSET.length ? next : current.coachPosition, updatedAt: Date.now() }; persist(project); set({ project, screen: next === CHARSET.length ? 'complete' : 'coach' }) },
  updateSettings: patch => { const project = { ...get().project, settings: { ...get().project.settings, ...patch }, updatedAt: Date.now() }; persist(project); set({ project }) },
  rename: name => { const project = { ...get().project, name, updatedAt: Date.now() }; persist(project); set({ project }) },
}))
