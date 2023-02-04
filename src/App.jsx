import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import './App.css'

const socket = io(import.meta.env.DEV ? ':3000' : null, { transports: ['websocket'] })

export default function App() {
  const [count, setCount] = useState(0)
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [lastPong, setLastPong] = useState(null)
  const [unmoderatedImageCount, setUnmoderatedImageCount] = useState(null)

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })

    socket.on('pong', () => {
      setLastPong(new Date().toISOString())
    })
    socket.on('backendLog', (m) => console.log(m))

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('pong')
      socket.off('backendLog')
    }
  }, [])

  const sendPing = () => {
    socket.emit('ping')
  }

  return (
    <div className="App">
      <h1>Biospheres</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <div>
          <p>Connected: {'' + isConnected}</p>
          <p>Last pong: {lastPong || '-'}</p>
          <button onClick={sendPing}>Send ping</button>
          <p>Number of unmoderated Images: {unmoderatedImageCount}</p>
          <button onClick={() => socket.emit('countUnmoderatedImages', (val) => setUnmoderatedImageCount(val))}>
            Count unmoderated images
          </button>
        </div>
      </div>
    </div>
  )
}
