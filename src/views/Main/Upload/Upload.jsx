import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useSocket } from '../../../utils/socketContext'
import './Upload.css'

export default function Upload() {
  const socket = useSocket()

  const onDrop = useCallback((acceptedFiles) => {
    socket.emit('fileUpload', acceptedFiles[0], (res) => console.log(res))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 })

  return (
    <div className='upload'>
      <div className='dropzone' {...getRootProps()}>
        <input {...getInputProps()} />
        <p>{isDragActive ? 'Drop the file here' : 'Drag image file here, or click to select file'}</p>
      </div>
    </div>
  )
}
