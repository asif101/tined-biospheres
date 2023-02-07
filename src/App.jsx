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
      <div className='header'>
        <span>BIOSPHERES</span>
      </div>
      {!isLoggedIn && (
        <Login
          onLogin={(username, password) =>
            socket.emit('authenticate', { username, password }, (auth) => {
              if(!auth) console.warn('login failed')
              else setIsLoggedIn(auth)
            })
          }
        />
      )}
      {isLoggedIn && <Main />}
    </div>
  )
}
