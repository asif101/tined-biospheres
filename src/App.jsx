import { useState, useEffect } from 'react'
import Login from './views/Login/Login'
import Main from './views/Main/Main'
import './App.css'
import { useSocket } from './utils/socketContext'

export default function App() {
  const socket = useSocket()
  const [loggedInVenue, setLoggedInVenue] = useState(false)

  useEffect(() => {
    socket.on('connect', () => console.log('connected'))
    socket.on('backendLog', (m) => console.log(m))
    return () => {
      socket.off('connect')
      socket.off('backendLog')
    }
  }, [])

  return (
    <div className='app'>
      <div className='header'>
        <span>BIOSPHERES</span>
      </div>
      {loggedInVenue ? <Main loggedInVenue={loggedInVenue} /> : <Login onLoginSuccess={(v) => setLoggedInVenue(v)} />}
    </div>
  )
}
