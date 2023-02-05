import { ThemeProvider, createTheme } from '@mui/material'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { SocketContext, socket } from './utils/socketContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={createTheme({ palette: { mode: 'dark' } })}>
      <SocketContext.Provider value={socket}>
        <App />
      </SocketContext.Provider>
    </ThemeProvider>
  </React.StrictMode>
)
