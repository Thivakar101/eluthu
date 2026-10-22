import { ArrowRight } from 'lucide-react'
import { Button, Page } from '../../components/ui'
import { CHARSET } from '../../lib/charset'
import { usePreviewFont } from '../../lib/font/usePreviewFont'
import { useApp } from '../../store'
export default function Complete() {
  const { project, setScreen, setPosition } = useApp(), font = usePreviewFont()
  const missing = CHARSET.filter(c => !project.glyphs[c.char] || project.glyphs[c.char].status === 'skipped')
  return <Page className="complete-page"><div className="complete-mark" style={{ fontFamily: font }}>Aa</div><h1>Your letters are ready</h1><p>{Object.values(project.glyphs).filter(g => g.status === 'done').length} letters, all yours.</p><div className="complete-actions"><Button kind="primary" onClick={() => setScreen('review')}>Review your font <ArrowRight size={17}/></Button>{missing.length > 0 && <Button kind="ghost" onClick={() => { setPosition(CHARSET.indexOf(missing[0])); setScreen('coach') }}>Write missing letters ({missing.length})</Button>}</div></Page>
}
