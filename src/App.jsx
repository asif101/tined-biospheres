import { useState, useEffect } from 'react'
import io from 'socket.io-client'
import './App.css'

const socket = io(':3000', { transports: ['websocket'] })

export default function App() {
  const [count, setCount] = useState(0)
  const [isConnected, setIsConnected] = useState(socket.connected)
  const [lastPong, setLastPong] = useState(null)

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

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('pong')
    }
  }, [])

  const sendPing = () => {
    socket.emit('ping')
  }

  return (
    <div className="App">
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <div>
          <p>Connected: {'' + isConnected}</p>
          <p>Last pong: {lastPong || '-'}</p>
          <button onClick={sendPing}>Send ping</button>
        </div>
      </div>
    </div>
  )
}
