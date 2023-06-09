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
  CircularProgress,
} from '@mui/material'
import { getImageUrl } from '../../../../utils/general'
import { ArrowForwardIos, Close } from '@mui/icons-material'
import { DateTime } from 'luxon'
import './ImageDetails.css'
import { useState } from 'react'

export default function ImageDetails({ open, data, onClose, s3BucketNames, rowIndex, numImages, onSlide }) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const handleClose = () => {
    setImageLoaded(false)
    onClose()
  }

  const placeholderSize =
    window.innerWidth / window.innerHeight < 1266 / 1009
      ? (window.innerWidth * 771) / 1213
      : Math.min((window.innerHeight * 807) / 1046, 807)

  return (
    <Dialog className='image-details' maxWidth='lg' open={open} onClose={handleClose}>
      {data && (
        <>
          <DialogTitle className='title-area'>
            <span>Image Details</span>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent className='dialog-content'>
            <div className='column'>
              <img
                src={getImageUrl(s3BucketNames.image, data.image_id)}
                onLoad={() => setImageLoaded(true)}
                style={{ display: imageLoaded ? 'block' : 'none', opacity: imageLoaded ? 1 : 0 }}
              />
              {!imageLoaded && (
                <div className='placeholder' style={{ width: placeholderSize, height: placeholderSize }}>
                  <CircularProgress color='warning' />
                </div>
              )}
            </div>
            <div className='column'>
              <div className='text-area'>
                <div className='info-item'>
                  <span className='label'>Created Date & Time</span>
                  <span className='value'>
                    {DateTime.fromISO(data.created_timestamp).toUTC().toLocaleString(DateTime.DATETIME_MED)}
                  </span>
                </div>
                <div className='info-item'>
                  <span className='label'>Venue</span>
                  <span className='value'>{data.venue}</span>
                </div>
                <div className='info-item'>
                  <span className='label'>Plant Name</span>
                  <span className='value'>{data.plant_name !== '' ? data.plant_name : 'None Provided'}</span>
                </div>
                <div className='info-item'>
                  <span className='label'>Creator Name</span>
                  <span className='value'>{data.user_name !== '' ? data.user_name : 'None Provided'}</span>
                </div>
                <div className='info-item'>
                  <span className='label'>Drawing Prompt</span>
                  <span className='value'>{data.drawing_prompt !== '' ? data.drawing_prompt : 'None Provided'}</span>
                </div>
                <span className='id'>{data.image_id}</span>
              </div>
            </div>
          </DialogContent>
          {rowIndex !== 0 && (
            <div className='prev-button'>
              <IconButton onClick={() => onSlide(rowIndex - 1)}>
                <ArrowForwardIos />
              </IconButton>
            </div>
          )}
          {rowIndex + 1 !== numImages && (
            <div className='next-button'>
              <IconButton onClick={() => onSlide(rowIndex + 1)}>
                <ArrowForwardIos />
              </IconButton>
            </div>
          )}
        </>
      )}
    </Dialog>
  )
}
