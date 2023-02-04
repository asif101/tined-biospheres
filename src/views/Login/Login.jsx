import { Button, TextField } from '@mui/material'
import { useState } from 'react'
import './Login.css'

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const login = () => onLogin(username, password)

  return (
    <div className='login'>
      <TextField
        label='Username'
        color='warning'
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') login()
        }}
      />
      <TextField
        label='Password'
        color='warning'
        value={password}
        type='password'
        onChange={(e) => setPassword(e.target.value)}
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
