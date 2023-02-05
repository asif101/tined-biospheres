import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import './App.css'
import Login from './views/Login/Login'
import Main from './views/Main/Main'

const socket = io(import.meta.env.DEV ? ':3000' : null, { transports: ['websocket'] })

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [unmoderatedImageCount, setUnmoderatedImageCount] = useState(null)

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('backendLog', (m) => console.log(m))

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('pong')
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
      {isLoggedIn && (
        <Main
          isSocketConnected={isConnected}
          onUpload={(f) => socket.emit('fileUpload', f[0], (res) => console.log(res))}
        />
      )}
    </div>
  )
}
