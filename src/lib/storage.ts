import { get, set } from 'idb-keyval'
import type { Project } from './model'
const KEY = 'eluthu-project-v1'
export const loadProject = () => get<Project>(KEY)
export const saveProject = (project: Project) => set(KEY, project)
export const downloadBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
}
export const downloadProject = (project: Project) => downloadBlob(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.eluthu.json`)
