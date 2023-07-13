import React from 'react';
import ReactDOM from 'react-dom/client';
import './global.css'

import Create from './components/screens/create/Create'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <Create />
  </React.StrictMode>
);
