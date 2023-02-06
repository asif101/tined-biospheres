import { FormControl, InputLabel, MenuItem, TextField, Select } from '@mui/material'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useSocket } from '../../../utils/socketContext'
import { venues } from '../../../utils/enum'
import './Upload.css'
import { LoadingButton } from '@mui/lab'
import { CloudUpload, Check, Error } from '@mui/icons-material'
import { v4 } from 'uuid'

export default function Upload({ onUpload }) {
  const socket = useSocket()

  const [sessionId] = useState(v4())
  const [file, setFile] = useState()
  const [userName, setUserName] = useState('')
  const [plantName, setPlantName] = useState('')
  const [venue, setVenue] = useState(venues.SYDNEY)

  const [uploadStatus, setUploadStatus] = useState('ready')

  const onDrop = useCallback((acceptedFiles) => {
    setFile({ file: acceptedFiles[0], preview: URL.createObjectURL(acceptedFiles[0]) })
    setUploadStatus('ready')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 })

  return (
    <div className='upload'>
      <p>Use this space to test if images can upload into the biosphere cloud!</p>

      <div className='dropzone' {...getRootProps()}>
        <input {...getInputProps()} />
        <p>{isDragActive ? 'Drop the file here' : 'Drag image file here, or click to select file'}</p>
      </div>

      {file && (
        <div className='preview'>
          <div className='column'>
            <img src={file.preview} />
          </div>
          <div className='column'>
            <FormControl>
              <InputLabel>Venue</InputLabel>
              <Select label='Venue' value={venue} onChange={(e) => setVenue(e.target.value)}>
                {Object.keys(venues).map((k) => (
                  <MenuItem key={k} value={venues[k]}>
                    {venues[k]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label='Plant name (Optional)' value={plantName} onChange={(e) => setPlantName(e.target.value)} />
            <TextField label='Creator name (Optional)' value={userName} onChange={(e) => setUserName(e.target.value)} />
            <LoadingButton
              variant='contained'
              color={uploadStatus === 'success' ? 'success' : uploadStatus === 'error' ? 'error' : 'warning'}
              startIcon={
                uploadStatus === 'success' ? <Check /> : uploadStatus === 'error' ? <Error /> : <CloudUpload />
              }
              loadingPosition='start'
              onClick={() => {
                if (uploadStatus === 'success' || uploadStatus === 'error') return
                setUploadStatus('loading')
                socket.emit(
                  'fileUpload',
                  file.file,
                  {
                    sessionId,
                    venue,
                    userName: userName !== '' ? userName : undefined,
                    plantName: plantName !== '' ? plantName : undefined,
                  },
                  (e) => {
                    if (e) {
                      setUploadStatus('error')
                      console.warn(e)
                    } else {
                      setUploadStatus('success')
                      onUpload()
                    }
                  }
                )
              }}
              loading={uploadStatus === 'loading'}
            >
              <span>
                {uploadStatus === 'success'
                  ? 'Done'
                  : uploadStatus === 'error'
                  ? 'Error'
                  : uploadStatus === 'loading'
                  ? 'Uploading...'
                  : 'Upload'}
              </span>
            </LoadingButton>
          </div>
        </div>
      )}
    </div>
  )
}
