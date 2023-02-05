import { useState } from 'react'
import Sidebar from './Sidebar/Sidebar'
import { mainViews } from '../../utils/enum'
import './Main.css'
import Upload from '../Upload/Upload'

export default function Main({ isSocketConnected, onUpload }) {
  const [count, setCount] = useState(0)
  const [mainView, setMainView] = useState(mainViews.MODERATE)

  return (
    <div className='main'>
      <Sidebar mainView={mainView} onMainViewChange={(v) => setMainView(v)} />
      {mainView === mainViews.UPLOAD_TESTER && <Upload onUpload={onUpload} />}
      {/* <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <div>
          <p>Connected: {'' + isSocketConnected}</p>
        </div>
      </div> */}
    </div>
  )
}
