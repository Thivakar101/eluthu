import { Page } from '../../components/ui'
import { Camera, Download, Sparkle } from 'lucide-react'
import { useApp } from '../../store'
import { downloadTemplate } from '../../lib/imaging/template'

export default function Home() {
  const { setScreen, setMode } = useApp()
  return <Page className="home">
    <div className="home-copy">
      <h1>eluthu</h1>
      <p>Turn your handwriting into a font</p>
    </div>
    <div className="home-cards">
      <button className="path-card write-card" onClick={() => { setMode('draw'); setScreen('coach') }}>
        <span className="home-icon home-sparkles" aria-hidden="true"><Sparkle preserveAspectRatio="none" /><Sparkle preserveAspectRatio="none" /></span>
        <div className="path-card-copy"><h2>Write it</h2><p>draw each letter at<br/>your own pace</p></div>
      </button>
      <button className="path-card upload-card" onClick={() => setScreen('upload-choice')}>
        <Camera className="home-icon home-camera" aria-hidden="true" />
        <div className="path-card-copy"><h2>Upload</h2><p>bring a photo or scan<br/>of your writing</p></div>
      </button>
    </div>
    <div className="home-bottom"><button className="text-link" onClick={() => downloadTemplate('pdf')}><Download size={21} aria-hidden="true" />Download a Printable sheet</button></div>
  </Page>
}
