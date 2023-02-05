import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import './Upload.css'

export default function Upload({ onUpload }) {
  const onDrop = useCallback((acceptedFiles) => {
    // Do something with the files
    // console.log(acceptedFiles)
    onUpload(acceptedFiles)
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, maxFiles: 1 })

  return (
    <div className='upload'>
      <div className='inner'>
        <div className='dropzone' {...getRootProps()}>
          <input {...getInputProps()} />
          <p>{isDragActive ? 'Drop the file here' : 'Drag image file here, or click to select file'}</p>
        </div>
      </div>
    </div>
  )
}
