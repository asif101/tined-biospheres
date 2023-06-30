import { Check, Delete, DoNotDisturbAlt, Star, StarBorder } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import { DateTime } from 'luxon'
import { useEffect, useState } from 'react'
import { getImageUrl } from '../../../utils/general'
import { venues } from '../../../utils/enum'
import { useSocket } from '../../../utils/socketContext'
import ImageDetails from './ImageDetails/ImageDetails'
import './Browser.css'

export default function Browser({ loggedInVenue, s3BucketNames, onModerationChange }) {
  const imagesPerPage = 25

  const socket = useSocket()

  const [numImages, setNumImages] = useState(0)
  const [page, setPage] = useState(1)
  const [images, setImages] = useState([])
  const [filters, setFilters] = useState({ venue: 'Global', state: 'All' })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [imageDetails, setImageDetails] = useState({ open: false, data: null })

  useEffect(() => {
    socket.emit('getNumImages', { loggedInVenue, filters }, (e, num) => {
      if (e) console.warn(e)
      else setNumImages(num)
    })
  }, [])

  useEffect(() => {
    socket.emit('getImages', { loggedInVenue, page, imagesPerPage, filters }, (e, data) => {
      if (e) console.warn(e)
      else {
        setImages(data)
      }
    })
  }, [page])

  const refreshImages = (callback, filterOverride) => {
    socket.emit('getImages', { loggedInVenue, page, imagesPerPage, filters: filterOverride ?? filters }, (e, data) => {
      if (e) console.warn(e)
      else {
        setImages(data)
        if (callback) callback()
      }
    })
  }

  const refreshNumImages = (filterOverride) => {
    socket.emit('getNumImages', { loggedInVenue, filters: filterOverride }, (e, num) => {
      if (e) console.warn(e)
      else setNumImages(num)
    })
  }

  return (
    <div className='browser'>
      <div className='header-area'>
        <p>{`Total Images: ${numImages}`}</p>
        <div className='right'>
          {loggedInVenue == 'Global' && (
            <div className='filters'>
              <FormControl sx={{ width: 140 }}>
                <InputLabel color='warning'>Venue</InputLabel>
                <Select
                  color='warning'
                  value={filters.venue}
                  label='Venue'
                  size='small'
                  onChange={(e) => {
                    setFilters((s) => {
                      const newFilters = { ...s, venue: e.target.value }
                      refreshImages(null, newFilters)
                      refreshNumImages(newFilters)
                      return newFilters
                    })
                  }}
                >
                  <MenuItem value='Global'>All</MenuItem>
                  {Object.values(venues).map((x) => (
                    <MenuItem key={x} value={x}>
                      {x}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          )}
          <p>All Times are in GMT</p>
        </div>
      </div>
      <div className='grid'>
        {images.map((x, i) => (
          <ImageCard
            key={x.image_id}
            data={x}
            loggedInVenue={loggedInVenue}
            s3BucketNames={s3BucketNames}
            onImageClick={() => {
              setImageDetails({ open: true, data: x, rowIndex: (page - 1) * imagesPerPage + i })
            }}
            onModerationChange={(imageId, moderationState) => {
              socket.emit('updateModeration', imageId, moderationState, (e) => {
                if (e) console.warn(e)
                else {
                  refreshImages()
                }
              })
            }}
            onFeatureChange={(imageId, featured) => {
              socket.emit('updateFeatured', imageId, featured, (e) => {
                if (e) console.warn(e)
                else {
                  onModerationChange()
                  refreshImages()
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
                    refreshImages(() => setDeleteDialogOpen(false))
                  }
                })
              })
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <ImageDetails
        {...imageDetails}
        onClose={() => setImageDetails((x) => ({ ...x, open: false }))}
        s3BucketNames={s3BucketNames}
        numImages={numImages}
        onSlide={(rowIndex) => {
          socket.emit('getImages', { loggedInVenue, page: rowIndex + 1, imagesPerPage: 1, filters }, (e, data) => {
            if (e) console.warn(e)
            else {
              setImageDetails({ open: true, data: data[0], rowIndex: rowIndex })
            }
          })
        }}
      />
    </div>
  )
}

function ImageCard({
  data,
  loggedInVenue,
  s3BucketNames,
  onImageClick,
  onModerationChange,
  onFeatureChange,
  onDelete,
}) {
  return (
    <div className='image-card'>
      <div className='column'>
        <img src={getImageUrl(s3BucketNames.thumbnail, data.image_id)} onClick={onImageClick} />
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
              <Check fontSize='small' />
            </ToggleButton>
            <ToggleButton value={2}>
              <DoNotDisturbAlt fontSize='small' />
            </ToggleButton>
          </ToggleButtonGroup>
          {loggedInVenue === 'Global' && (
            <Stack className='status-buttons' direction='row' alignItems='center' spacing={0}>
              <IconButton
                size='small'
                className='featured '
                onClick={() => onFeatureChange(data.image_id, !data.featured)}
              >
                {data.featured ? <Star color='warning' fontSize='small' /> : <StarBorder fontSize='small' />}
              </IconButton>

              <IconButton size='small' className='delete ' onClick={() => onDelete(data.image_id)}>
                <Delete fontSize='small' />
              </IconButton>
            </Stack>
          )}
        </div>
      </div>
    </div>
  )
}
