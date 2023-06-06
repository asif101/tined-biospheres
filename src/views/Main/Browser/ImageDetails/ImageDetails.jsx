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
import { getImageUrl } from '../../../../utils/general'
import { Close } from '@mui/icons-material'
import { DateTime } from 'luxon'
import './ImageDetails.css'

export default function ImageDetails({ open, data, onClose, s3BucketNames }) {
  return (
    <Dialog className='image-details' maxWidth='lg' open={open} onClose={() => onClose()}>
      {data && (
        <>
          <DialogTitle className='title-area'>
            <span>Image Details</span>
            <IconButton onClick={() => onClose()}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent className='dialog-content'>
            <div className='column'>
              <img src={getImageUrl(s3BucketNames.image, data.image_id)} />
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
        </>
      )}
    </Dialog>
  )
}
