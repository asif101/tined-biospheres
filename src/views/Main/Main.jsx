import { useState } from 'react'
import './Main.css'

export default function Main({ isSocketConnected }) {
  const [count, setCount] = useState(0)

  return (
    <div className='main'>
      <div className='card'>
        <button onClick={() => setCount((count) => count + 1)}>count is {count}</button>
        <div>
          <p>Connected: {'' + isSocketConnected}</p>
        </div>
      </div>
    </div>
  )
}
