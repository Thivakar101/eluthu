import { useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useApp } from './store'
import { loadProject } from './lib/storage'
import { IconButton } from './components/ui'
import Home from './features/home/Home'
import Design from './features/home/Design'
import Coach from './features/coach/Coach'
import UploadChoice from './features/upload/UploadChoice'
import Sheet from './features/upload/Sheet'
import Review from './features/review/Review'
import Export from './features/export/Export'
import Complete from './features/coach/Complete'
export default function App() {
  const { screen, setScreen, setProject, toast, setToast } = useApp()
  useEffect(() => { loadProject().then(project => { if (project) setProject(project) }).catch(() => {}) }, [setProject])
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3000); return () => clearTimeout(timer) }, [toast, setToast])
  useEffect(() => { const onPop = () => setScreen('home'); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop) }, [setScreen])
  const page = { home: <Home/>, design: <Design/>, coach: <Coach/>, 'upload-choice': <UploadChoice/>, sheet: <Sheet/>, review: <Review/>, export: <Export/>, complete: <Complete/> }[screen]
  return <><header className={`global-header ${screen === 'home' ? 'home-header' : ''}`}><div className="header-inner"><button className="wordmark" onClick={() => setScreen('home')} aria-label="Eluthu home"><img src="/brand/logo.png" alt="" /></button><div className="header-actions">{screen !== 'home' && <IconButton label="Back to home" onClick={() => setScreen('home')}><ArrowLeft size={22} strokeWidth={1.5}/></IconButton>}</div></div></header><AnimatePresence mode="wait">{page}</AnimatePresence>{toast && <div className="toast" role="status">{toast}</div>}</>
}
