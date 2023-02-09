import { useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import { getThumbnailUrl, getImageUrl } from '../../../utils/general'
import { useSocket } from '../../../utils/socketContext'
import './Moderate.css'
import { CircularProgress, Skeleton, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { Check, DoNotDisturbAlt, Inbox } from '@mui/icons-material'
import { AnimatePresence, motion } from 'framer-motion'

export default function Moderate({ onModerationChange, unmoderatedImageCount }) {
  const socket = useSocket()

  const [metadata, setMetadata] = useState()
  const [imageLoaded, setImageLoaded] = useState(false)

  useEffect(() => {
    getNextMetadata(true)
  }, [])

  useEffect(() => {
    getNextMetadata()
  }, [unmoderatedImageCount])

  function getNextMetadata(resetImageLoaded) {
    socket.emit('getNextMetadata', (e, metadata) => {
      if (e) console.warn(e)
      else {
        if (resetImageLoaded) setImageLoaded(false)
        setMetadata(metadata)
      }
    })
  }

  return (
    <div className='moderate'>
      <AnimatePresence>
        {metadata && (
          <motion.div
            className='moderation-container'
            key={metadata.image_id}
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <div className='column'>
              <CircularProgress color='warning' style={{ opacity: imageLoaded ? 0 : 1 }}/>
              <img
                style={{ opacity: imageLoaded ? 1 : 0 }}
                // src={getThumbnailUrl(metadata.image_id)}
                src={getImageUrl(metadata.image_id)}
                onLoad={() => setImageLoaded(true)}
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
                        getNextMetadata(true)
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
          </motion.div>
        )}
        {parseInt(unmoderatedImageCount) === 0 && (
          <motion.div
            className='done-indicator'
            key='done-indicator'
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
          >
            <Inbox sx={{ fontSize: 60 }} />
            <span>All Done! No more images to moderate.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
