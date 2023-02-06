import { Check, Delete, DoNotDisturbAlt } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { DateTime } from 'luxon'
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
      <div className='filters'>
        <p>{`Total Images: ${numImages}`}</p>
        <p>All Times are in GMT</p>
      </div>
      <div className='grid'>
        {images.map((x) => (
          <ImageCard
            key={x.image_id}
            data={x}
            onModerationChange={(imageId, moderationState) => {
              socket.emit('updateModeration', imageId, moderationState, (e) => {
                if (e) console.warn(e)
                else {
                  socket.emit('getImages', { page, imagesPerPage }, (e, data) => {
                    if (e) console.warn(e)
                    else {
                      setImages(data)
                    }
                  })
                }
              })
            }}
            onDelete={() => setDialogOpen(x.image_id)}
          />
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
              socket.emit('deleteImage', dialogOpen, () => {
                socket.emit('getNumImages', (e, num) => {
                  if (e) console.warn(e)
                  else {
                    setNumImages(num)
                    socket.emit('getImages', { page, imagesPerPage }, (e, data) => {
                      if (e) console.warn(e)
                      else {
                        setImages(data)
                        setDialogOpen(false)
                      }
                    })
                  }
                })
              })
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

function ImageCard({ data, onModerationChange, onDelete }) {
  return (
    <div className='image-card'>
      <div className='column'>
        <img src={getThumbnailUrl(data.image_id)} />
      </div>
      <div className='column'>
        <span>{DateTime.fromISO(data.created_timestamp).toUTC().toLocaleString(DateTime.DATETIME_MED)}</span>
        <span>{data.venue}</span>
        <div className='button-panel'>
          <ToggleButtonGroup
            size='small'
            exclusive
            value={data.moderation_state}
            onChange={(e, v) => {
              if (v) onModerationChange(data.image_id, v)
            }}
          >
            <ToggleButton value={1}>
              <Check />
            </ToggleButton>
            <ToggleButton value={2}>
              <DoNotDisturbAlt />
            </ToggleButton>
          </ToggleButtonGroup>
          <IconButton className='delete ' onClick={() => onDelete(data.image_id)}>
            <Delete />
          </IconButton>
        </div>
      </div>
    </div>
  )
}
