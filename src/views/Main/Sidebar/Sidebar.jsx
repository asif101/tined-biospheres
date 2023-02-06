import { Apps, CloudUpload, Inbox } from '@mui/icons-material'
import { Badge, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material'
import { mainViews } from '../../../utils/enum'
import './Sidebar.css'

export default function Sidebar({ mainView, onMainViewChange, unmoderatedImageCount }) {
  return (
    <div className='sidebar'>
      <List>
        <ListItemButton selected={mainView === mainViews.MODERATE} onClick={() => onMainViewChange(mainViews.MODERATE)}>
          <ListItemIcon>
            <Badge badgeContent={unmoderatedImageCount} color='error' max={999}>
              <Inbox />
            </Badge>
          </ListItemIcon>
          <ListItemText primary='Moderate' />
        </ListItemButton>
        <ListItemButton
          selected={mainView === mainViews.IMAGE_BROWSER}
          onClick={() => onMainViewChange(mainViews.IMAGE_BROWSER)}
        >
          <ListItemIcon>
            <Apps />
          </ListItemIcon>
          <ListItemText primary='Image Browser' />
        </ListItemButton>
        <ListItemButton
          selected={mainView === mainViews.UPLOAD_TESTER}
          onClick={() => onMainViewChange(mainViews.UPLOAD_TESTER)}
        >
          <ListItemIcon>
            <CloudUpload />
          </ListItemIcon>
          <ListItemText primary='Upload Tester' />
        </ListItemButton>
      </List>
    </div>
  )
}
