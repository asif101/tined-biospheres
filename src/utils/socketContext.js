import { createContext, useContext } from 'react'
import io from 'socket.io-client'

export const socket = io(import.meta.env.DEV ? ':3000' : null, { transports: ['websocket'] })
export const SocketContext = createContext()
export function useSocket() {
  return useContext(SocketContext)
}
