import { useState, useEffect } from 'react'
import Login from './views/Login/Login'
import Main from './views/Main/Main'
import './App.css'
import { useSocket } from './utils/socketContext'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const socket = useSocket()

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
      <h1>BIOSPHERES</h1>
      {!isLoggedIn && (
        <Login
          onLogin={(username, password) =>
            socket.emit('authenticate', { username, password }, (auth) => {
              setIsLoggedIn(auth)
            })
          }
        />
      )}
      {isLoggedIn && <Main />}
    </div>
  )
}
