const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
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

  socket.on('ping', () => {
    socket.emit('pong')
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