import { useState } from 'react'
import Sidebar from './Sidebar/Sidebar'
import { mainViews } from '../../utils/enum'
import './Main.css'
import Upload from '../Upload/Upload'

export default function Main() {
  const [mainView, setMainView] = useState(mainViews.MODERATE)

  return (
    <div className='main'>
      <Sidebar mainView={mainView} onMainViewChange={(v) => setMainView(v)} />
      {mainView === mainViews.UPLOAD_TESTER && <Upload />}
    </div>
  )
}
