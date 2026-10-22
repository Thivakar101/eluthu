import { useRef } from 'react'
import { useApp } from '../../store'
import type { Project } from '../../lib/model'

export function OpenProject() {
  const input = useRef<HTMLInputElement>(null)
  const { setProject, setScreen, setToast } = useApp()
  const open = async (file: File) => {
    try {
      const value = JSON.parse(await file.text()) as Project
      if (!value || typeof value.name !== 'string' || !value.glyphs || typeof value.glyphs !== 'object' || !value.settings || !Number.isInteger(value.coachPosition)) throw new Error('This is not an Eluthu project file.')
      setProject(value)
      setScreen('review')
      setToast('Project opened.')
    } catch (error) { setToast(error instanceof Error ? error.message : 'This file could not be opened.') }
  }
  return <div className="project-import"><button className="text-link" onClick={() => input.current?.click()}>Open a saved project</button><input ref={input} className="sr-only" type="file" accept=".json,application/json" onChange={event => { const file = event.target.files?.[0]; if (file) void open(file) }} /></div>
}
