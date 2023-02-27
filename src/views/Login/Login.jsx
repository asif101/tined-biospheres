import { Button, TextField } from '@mui/material'
import { useState } from 'react'
import { useSocket } from '../../utils/socketContext'
import './Login.css'

export default function Login({ onLoginSuccess }) {
  const socket = useSocket()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  const login = () => {
    socket.emit('authenticate', { username, password }, (venue) => {
      if (!venue) setError(true)
      else onLoginSuccess(venue)
    })
  }

  return (
    <div className='login'>
      <TextField
        label='Username'
        color='warning'
        value={username}
        error={error}
        onChange={(e) => {
          if (error) setError(false)
          setUsername(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') login()
        }}
      />
      <TextField
        label='Password'
        color='warning'
        value={password}
        type='password'
        error={error}
        helperText={error ? 'Incorrect Username/Password' : ' '}
        onChange={(e) => {
          if (error) setError(false)
          setPassword(e.target.value)
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') login()
        }}
      />
      <Button variant='contained' color='warning' onClick={login}>
        Log In
      </Button>
    </div>
  )
}
