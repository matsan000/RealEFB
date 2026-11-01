import { createRoot } from 'react-dom/client';
import { App } from './App';
import './operations.css';
import './theme.css';
import './modern.css';
import './glass.css';
import './os.css';
import './efbpad.css';
import './tablet.css';

// Restore the existing per-device wallpaper preference before the first React paint.
try {
  document.body.dataset.appearance = localStorage.getItem('realefb.appearance') || 'light';
  const photo = localStorage.getItem('realefb.wallpaperPhoto');
  let wallpaper = localStorage.getItem('realefb.wallpaper');
  if (wallpaper === 'sky') wallpaper = 'aurora';
  if (!wallpaper) wallpaper = 'alpine';
  if (photo) document.body.style.setProperty('--wallpaper-photo', `url("${photo}")`);
  if (wallpaper === 'photo' && !photo) wallpaper = 'alpine';
  if (!['aurora', 'alpine', 'forest', 'coast', 'highlands', 'glacier', 'tidal', 'ember', 'photo'].includes(wallpaper)) wallpaper = 'alpine';
  document.body.dataset.wallpaper = wallpaper;
} catch { /* Storage can be disabled in tablet browsers. */ }

createRoot(document.getElementById('root')!).render(<App />);

import './refinements.css';

import './ui-kit.css';
