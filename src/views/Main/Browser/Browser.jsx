import { Delete } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Pagination,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { getThumbnailUrl } from '../../../utils/general'
import { useSocket } from '../../../utils/socketContext'
import './Browser.css'

export default function Browser() {
  const imagesPerPage = 25

  const socket = useSocket()

  const [numImages, setNumImages] = useState(0)
  const [page, setPage] = useState(1)
  const [images, setImages] = useState([])
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    socket.emit('getNumImages', (e, num) => {
      if (e) console.warn(e)
      else setNumImages(num)
    })
  }, [])

  useEffect(() => {
    socket.emit('getImages', { page, imagesPerPage }, (e, data) => {
      if (e) console.warn(e)
      else {
        // console.log(data)
        setImages(data)
      }
    })
  }, [page])

  return (
    <div className='browser'>
      <p>{`Total Images: ${numImages}`}</p>
      <div className='grid'>
        {images.map((x) => (
          <ImageCard key={x.image_id} data={x} onDelete={() => setDialogOpen(x.image_id)} />
        ))}
      </div>
      <Pagination
        color='warning'
        count={Math.ceil(numImages / imagesPerPage)}
        page={page}
        onChange={(e, p) => setPage(p)}
      />
      <Dialog open={!!dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Delete Image?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete this image from cloud storage. This is irreversible. Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button sx={{ color: 'grey' }} onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            color='error'
            onClick={() => {
              socket.emit('deleteImage', dialogOpen, () => setDialogOpen(false))
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

function ImageCard({ data, onDelete }) {
  return (
    <div className='image'>
      <img src={getThumbnailUrl(data.image_id)} />
      <span>{data.image_id}</span>
      <IconButton onClick={() => onDelete(data.image_id)}>
        <Delete />
      </IconButton>
    </div>
  )
}
