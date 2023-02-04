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

  socket.on('countUnmoderatedImages', async (callback) => {
    const res = await getNumMetadata()
    callback(res)
  })

  socket.on('authenticate', (data, callback) => {
    callback(authenticate(data))
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

function authenticate({ username, password }) {
  return true //for debugging
  if (username === process.env.APP_USERNAME && password === process.env.APP_PASSWORD) return true
  else return false
}
