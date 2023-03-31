import { useEffect, useState } from 'react'
import Sidebar from './Sidebar/Sidebar'
import { mainViews } from '../../utils/enum'
import Upload from './Upload/Upload'
import Browser from './Browser/Browser'
import Moderate from './Moderate/Moderate'
import './Main.css'
import { useSocket } from '../../utils/socketContext'

export default function Main({ loggedInVenue, s3BucketNames }) {
  const socket = useSocket()

  const [mainView, setMainView] = useState(mainViews.MODERATE)
  const [unmoderatedImageCount, setUnmoderatedImageCount] = useState(0)

  useEffect(() => {
    refreshUnmoderatedImageCount()
    socket.on('newImage', () => refreshUnmoderatedImageCount())
    return () => {
      socket.off('newImage')
    }
  }, [])

  const refreshUnmoderatedImageCount = () => {
    socket.emit('countUnmoderatedImages', loggedInVenue, (e, count) => {
      if (e) console.warn(e)
      else setUnmoderatedImageCount(count)
    })
  }

  return (
    <div className='main'>
      <Sidebar
        mainView={mainView}
        onMainViewChange={(v) => setMainView(v)}
        unmoderatedImageCount={unmoderatedImageCount}
      />
      <div className='content'>
        {mainView === mainViews.MODERATE && (
          <Moderate
            loggedInVenue={loggedInVenue}
            s3BucketNames={s3BucketNames}
            onModerationChange={refreshUnmoderatedImageCount}
            unmoderatedImageCount={unmoderatedImageCount}
          />
        )}
        {mainView === mainViews.IMAGE_BROWSER && (
          <Browser
            loggedInVenue={loggedInVenue}
            s3BucketNames={s3BucketNames}
            onModerationChange={refreshUnmoderatedImageCount}
          />
        )}
        {mainView === mainViews.UPLOAD_TESTER && <Upload onUpload={refreshUnmoderatedImageCount} />}
      </div>
    </div>
  )
}
