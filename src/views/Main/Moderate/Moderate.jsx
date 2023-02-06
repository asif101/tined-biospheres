import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import { getThumbnailUrl, getImageUrl } from '../../../utils/general'
import { useSocket } from '../../../utils/socketContext'
import './Moderate.css'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Check, DoNotDisturbAlt } from '@mui/icons-material'

export default function Moderate({ onModerationChange }) {
  const socket = useSocket()

  const [metadata, setMetadata] = useState()

  useEffect(() => {
    getNextMetadata()
  }, [])

  function getNextMetadata() {
    socket.emit('getNextMetadata', (e, metadata) => {
      console.log(metadata)
      if (e) console.warn(e)
      else {
        setMetadata(metadata)
      }
    })
  }

  return (
    <div className='moderate'>
      {metadata && (
        <div className='moderation-container'>
          <div className='column'>
            <img
                src={getThumbnailUrl(metadata.image_id)}
            //   src={getImageUrl(metadata.image_id)}
            />
          </div>
          <div className='column'>
            <div className='image-info'>
              <div className='info-item'>
                <span className='label'>Created Date & Time</span>
                <span className='value'>
                  {DateTime.fromISO(metadata.created_timestamp).toUTC().toLocaleString(DateTime.DATETIME_MED)}
                </span>
              </div>
              <div className='info-item'>
                <span className='label'>Venue</span>
                <span className='value'>{metadata.venue}</span>
              </div>
              <div className='info-item'>
                <span className='label'>Plant Name</span>
                <span className='value'>{metadata.plant_name !== '' ? metadata.plant_name : 'None Provided'}</span>
              </div>
              <div className='info-item'>
                <span className='label'>Creator Name</span>
                <span className='value'>{metadata.user_name !== '' ? metadata.user_name : 'None Provided'}</span>
              </div>
            </div>
            <div className='button-panel'>
              <ToggleButtonGroup
                size='large'
                exclusive
                onChange={(e, v) => {
                  socket.emit('updateModeration', metadata.image_id, v, (e) => {
                    if (e) console.warn(e)
                    else {
                      onModerationChange()
                      getNextMetadata()
                    }
                  })
                }}
              >
                <ToggleButton value={1}>
                  <Check sx={{ fontSize: 60, fill: '#7ecd47' }} />
                </ToggleButton>
                <ToggleButton value={2}>
                  <DoNotDisturbAlt sx={{ fontSize: 60, fill: '#dc3d32' }} />
                </ToggleButton>
              </ToggleButtonGroup>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
