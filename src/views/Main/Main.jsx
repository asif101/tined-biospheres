import { useState } from 'react'
import Sidebar from './Sidebar/Sidebar'
import { mainViews } from '../../utils/enum'
import Upload from './Upload/Upload'
import Browser from './Browser/Browser'
import './Main.css'

export default function Main() {
  const [mainView, setMainView] = useState(mainViews.MODERATE)

  return (
    <div className='main'>
      <Sidebar mainView={mainView} onMainViewChange={(v) => setMainView(v)} />
      <div className='content'>
        {mainView === mainViews.IMAGE_BROWSER && <Browser />}
        {mainView === mainViews.UPLOAD_TESTER && <Upload />}
      </div>
    </div>
  )
}
