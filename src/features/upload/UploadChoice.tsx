import { FileImage, LayoutGrid, Download } from 'lucide-react'
import { Page } from '../../components/ui'
import { useApp } from '../../store'
import { downloadTemplate } from '../../lib/imaging/template'
export default function UploadChoice() {
  const { setMode, setScreen } = useApp()
  return <Page className="choice-page"><h1>Upload your writing</h1>
    <div className="choice-grid">
      <button className="choice-card" onClick={() => { setMode('upload'); setScreen('coach') }}><FileImage /><h2>One letter</h2><p>bring a photo or scan<br/>of each letter</p></button>
      <button className="choice-card" onClick={() => setScreen('sheet')}><LayoutGrid /><h2>A whole sheet</h2><p>upload a page<br/>of your writing</p></button>
    </div>
    <div className="choice-footer"><button className="text-link" onClick={() => downloadTemplate('pdf')}><Download size={18}/>Download a Printable sheet</button></div>
  </Page>
}
