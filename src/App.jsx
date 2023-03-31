import { useState, useEffect } from 'react'
import Login from './views/Login/Login'
import Main from './views/Main/Main'
import './App.css'
import { useSocket } from './utils/socketContext'

export default function App() {
  const socket = useSocket()
  const [loggedInVenue, setLoggedInVenue] = useState(false)
  const [s3BucketNames, sets3BucketNames] = useState()

  useEffect(() => {
    socket.on('connect', () => console.log('connected'))
    socket.on('backendLog', (m) => console.log(m))
    socket.emit('getS3BucketNames', (data) => sets3BucketNames(data))

    return () => {
      socket.off('connect')
      socket.off('backendLog')
    }
  }, [])

  return (
    <div className='app'>
      <div className='header'>
        <span>BIOSPHERES</span>
        <span>{loggedInVenue}</span>
      </div>
      {loggedInVenue ? (
        <Main loggedInVenue={loggedInVenue} s3BucketNames={s3BucketNames} />
      ) : (
        <Login onLoginSuccess={(v) => setLoggedInVenue(v)} />
      )}
    </div>
  )
}
