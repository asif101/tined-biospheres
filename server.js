import 'dotenv/config.js'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import multer from 'multer'
import {
  deleteMetadata,
  getImages,
  getNumImages,
  countUnmoderatedImages,
  insertMetadata,
  setModeration,
  getNextUnmoderatedImageMetadata,
} from './modules/db.js'
import { deleteFromS3, uploadToS3 } from './modules/s3.js'
import { makeThumbnail } from './modules/image.js'
import { v4 as uuidv4 } from 'uuid'
import { venues } from './src/utils/enum.js'

const debug = false

const app = express()
const server = http.createServer(app)
const io = new Server(server, { maxHttpBufferSize: 1e8 })
const upload = multer()

const port = normalizePort(process.env.PORT || '3000')
app.set('port', port)

//REST Endpoints
app.use(express.static('dist'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

app.post('/image', upload.single('image'), (req, res) => {
  const e = validateRequest(req)
  if (e) {
    console.log('rejected image POST request with reason:', e)
    res.status(400).send(e)
  } else {
    uploadImage(req.file.buffer, {
      sessionId: req.body.sessionId,
      venue: req.body.venue,
      plantName: req.body?.plantName !== '' ? req.body?.plantName : undefined,
      userName: req.body?.userName !== '' ? req.body?.userName : undefined,
    })
      .then((imageId) => {
        io.emit('newImage')
        res.status(200).send(`successfully added image with id ${imageId}`)
      })
      .catch((e) => res.status(500).send(e))
  }

  function validateRequest(req) {
    if (req.body?.token !== process.env.API_TOKEN) return 'invalid token'
    if (!Object.values(venues).includes(req.body.venue)) return 'Venue is not valid'
    if (!req.body.sessionId) return 'sessionId is a required field'
    if (req?.file?.mimetype !== 'image/png') return 'invalid image type. only png is allowed'
    if (req?.file?.size > 11000000) return 'image too large. max size is 10MB'
    return false
  }
})

//Socketio Endpoints
io.on('connection', (socket) => {
  console.log('app connected')
  socket.on('disconnect', () => console.log('app disconnected'))
  socket.on('countUnmoderatedImages', (callback) => {
    countUnmoderatedImages()
      .then((count) => callback(false, count))
      .catch((e) => callback(true))
  })
  socket.on('getNextMetadata', (callback) => {
    getNextUnmoderatedImageMetadata()
      .then((metadata) => callback(false, metadata))
      .catch((e) => callback(e))
  })
  socket.on('authenticate', (data, callback) => {
    callback(authenticate(data))
  })
  socket.on('fileUpload', (file, metadata, callback) => {
    uploadImage(file, metadata)
      .then((imageId) => callback(false, `successfully added image with id ${imageId}`))
      .catch((e) => callback(e))
  })
  socket.on('getNumImages', (callback) => {
    getNumImages()
      .then((num) => {
        callback(false, num)
      })
      .catch((e) => callback(e))
  })
  socket.on('getImages', (queryParams, callback) => {
    getImages(queryParams)
      .then((data) => {
        callback(false, data)
      })
      .catch((e) => callback(e))
  })
  socket.on('deleteImage', (imageId, callback) => {
    deleteImage(imageId)
      .then((imageId) => callback(false, imageId))
      .catch((e) => callback(e))
  })

  socket.on('updateModeration', (imageId, moderationState, callback) => {
    setModeration(imageId, moderationState)
      .then(() => callback(false))
      .catch((e) => callback(true))
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
  if (debug) return true
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
