import 'dotenv/config.js'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import { deleteMetadata, getNumMetadata, insertMetadata } from './modules/db.js'
import { deleteFromS3, uploadToS3 } from './modules/s3.js'
import { makeThumbnail } from './modules/image.js'
import { v4 as uuidv4 } from 'uuid'

const app = express()
const server = http.createServer(app)
const io = new Server(server, { maxHttpBufferSize: 1e8 })

const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

app.use(express.static('dist'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
  console.log('app connected')
  socket.on('disconnect', () => console.log('app disconnected'))
  socket.on('countUnmoderatedImages', async (callback) => {
    const res = await getNumMetadata()
    callback(res)
  })
  socket.on('authenticate', (data, callback) => {
    callback(authenticate(data))
  })
  socket.on('fileUpload', (file, callback) => {
    // console.log(file)
    uploadImage(file, { sessionId: uuidv4(), venue: 'Sydney', userName: 'Asif Rahman' })
      .then((imageId) => callback(true, `successfully added image with id ${imageId}`))
      .catch((e) => callback(false, e))
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

function uploadImage(imageBuffer, { sessionId, venue, plantName, userName }) {
  return new Promise((resolve, reject) => {
    makeThumbnail(imageBuffer) //first, make thumbnail
      .then((thumbnail) => {
        //then, upload image and thumbnail
        const imageId = uuidv4()
        const imageName = `${imageId}.png`
        uploadToS3(imageBuffer, imageName, 'tined-biospheres-images')
          .then((url) => {
            uploadToS3(thumbnail, imageName, 'tined-biospheres-image-thumbnails')
              .then((url) => {
                //finally, add metadata to postgres db
                insertMetadata(imageId, sessionId, venue, plantName, userName, new Date(), 0)
                  .then(() => resolve(imageId))
                  .catch((e) => handleError('error adding metadata to database', e))
              })
              .catch((e) => handleError('error uploading thumbnail to s3', e))
          })
          .catch((e) => handleError('error uploading image to s3', e))
      })
      .catch((e) => handleError('error making thumbnail', e))

    function handleError(message, error) {
      console.log(message, error)
      sendLogToApp({ message, error })
      reject(message, error)
    }
  })
}

function deleteImage(imageId) {
  return new Promise((resolve, reject) => {
    const imageName = `${imageId}.png`
    deleteFromS3(imageName, 'tined-biospheres-images')
      .then(() => {
        deleteFromS3(imageName, 'tined-biospheres-image-thumbnails')
          .then(() => {
            deleteMetadata(imageId)
              .then(() => resolve(imageId))
              .catch((e) => handleError('error deleting metadata', e))
          })
          .catch((e) => handleError('error deleting thumbnail from s3', e))
      })
      .catch((e) => handleError('error deleting image from s3', e))

    function handleError(message, error) {
      console.log(message, error)
      sendLogToApp({ message, error })
      reject(message, error)
    }
  })
}
