import type { Project } from './model'
const KEY = 'eluthu-project-v1'
// Keep idb-keyval's original database and store names so existing projects load unchanged.
const DATABASE = 'keyval-store'
const STORE = 'keyval'
let connection: Promise<IDBDatabase> | undefined

function openDatabase(): Promise<IDBDatabase> {
  if (connection) return connection
  connection = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DATABASE)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE)
    }
    request.onsuccess = () => {
      request.result.onclose = () => { connection = undefined }
      resolve(request.result)
    }
    request.onerror = () => reject(request.error)
  }).catch(error => { connection = undefined; throw error })
  return connection
}

export async function loadProject(): Promise<Project | undefined> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const request = database.transaction(STORE, 'readonly').objectStore(STORE).get(KEY)
    request.onsuccess = () => resolve(request.result as Project | undefined)
    request.onerror = () => reject(request.error)
  })
}

export async function saveProject(project: Project): Promise<void> {
  const database = await openDatabase()
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE, 'readwrite')
    transaction.objectStore(STORE).put(project, KEY)
    transaction.oncomplete = () => resolve()
    transaction.onerror = () => reject(transaction.error)
    transaction.onabort = () => reject(transaction.error)
  })
}
export const downloadBlob = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
}
export const downloadProject = (project: Project) => downloadBlob(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.eluthu.json`)
