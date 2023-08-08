import React from 'react';
import ReactDOM from 'react-dom/client';
import './global.css'

import Create from './components/screens/create/Create'

export const contextMenuSetters = [] as Array<React.Dispatch<React.SetStateAction<boolean>>>
function hideContextMenus() {
  contextMenuSetters.forEach(setter => setter(false))
}

const rootElement = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <Create />
  </React.StrictMode>
);
rootElement.onmousedown = ev => { hideContextMenus() }
document.onkeydown = ev => { if (['Escape', 'F12'].includes(ev.key)) { hideContextMenus() } }