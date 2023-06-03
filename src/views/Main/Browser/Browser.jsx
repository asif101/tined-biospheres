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
import { getImageUrl } from '../../../utils/general'
import { useSocket } from '../../../utils/socketContext'
import './Browser.css'

export default function Browser({ loggedInVenue, s3BucketNames, onModerationChange }) {
  const imagesPerPage = 25

  const socket = useSocket()

  const [numImages, setNumImages] = useState(0)
  const [page, setPage] = useState(1)
  const [images, setImages] = useState([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    socket.emit('getNumImages', loggedInVenue, (e, num) => {
      if (e) console.warn(e)
      else setNumImages(num)
    })
  }, [])

  useEffect(() => {
    socket.emit('getImages', { loggedInVenue, page, imagesPerPage }, (e, data) => {
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
            s3BucketNames={s3BucketNames}
            onModerationChange={(imageId, moderationState) => {
              socket.emit('updateModeration', imageId, moderationState, (e) => {
                if (e) console.warn(e)
                else {
                  onModerationChange()
                  socket.emit('getImages', { loggedInVenue, page, imagesPerPage }, (e, data) => {
                    if (e) console.warn(e)
                    else {
                      setImages(data)
                    }
                  })
                }
              })
            }}
            onDelete={() => setDeleteDialogOpen(x.image_id)}
          />
        ))}
      </div>
      <Pagination
        color='warning'
        count={Math.ceil(numImages / imagesPerPage)}
        page={page}
        onChange={(e, p) => setPage(p)}
      />
      <Dialog open={!!deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Image?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete this image from cloud storage. This is irreversible. Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button sx={{ color: 'grey' }} onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            color='error'
            onClick={() => {
              socket.emit('deleteImage', deleteDialogOpen, () => {
                socket.emit('getNumImages', loggedInVenue, (e, num) => {
                  if (e) console.warn(e)
                  else {
                    setNumImages(num)
                    socket.emit('getImages', { loggedInVenue, page, imagesPerPage }, (e, data) => {
                      if (e) console.warn(e)
                      else {
                        setImages(data)
                        setDeleteDialogOpen(false)
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

function ImageCard({ data, s3BucketNames, onModerationChange, onDelete }) {
  return (
    <div className='image-card'>
      <div className='column'>
        <img src={getImageUrl(s3BucketNames.thumbnail, data.image_id)} />
      </div>
      <div className='column'>
        <span>{DateTime.fromISO(data.created_timestamp).toUTC().toLocaleString(DateTime.DATETIME_MED)}</span>
        <span>{data.venue}</span>
        <span>{data.plant_name}</span>
        <span>{data.user_name}</span>
        <span>{data.drawing_prompt ?? 'No Prompt'}</span>
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
