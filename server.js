import 'dotenv/config.js'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { getNumMetadata } from './modules/db.js'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

app.use(express.static('dist'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
  console.log('a user connected')

  socket.on('disconnect', function () {
    console.log('a user disconnected')
  })

  socket.on('ping', async () => {
    sendLogToApp('pong console log')
    socket.emit('pong')
  })

  socket.on('countUnmoderatedImages', async (callback) => {
    const res = await getNumMetadata()
    callback(res)
  })
})

server.listen(port, () => {
  console.log(`App listening on port ${port}`)
})

function normalizePort(val) {
  const port = parseInt(val, 10)
  if (isNaN(port)) return val
  if (port >= 0) return port
  return false
}

function sendLogToApp(message) {
  io.emit('backendLog', message)
}
