import { getImageUrl } from '../../../utils/general'
import data from './data.json'
import './Viewer.css'

export default function Viewer({ s3BucketNames }) {
  
  return (
    <div className='viewer'>
      {data.map((x) => (
        <div key={x.image_id} className='image'>
          <img src={getImageUrl(s3BucketNames?.thumbnail, x.image_id)} />
        </div>
      ))}
    </div>
  )
}
