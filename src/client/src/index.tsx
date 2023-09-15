import ReactDOM from 'react-dom/client';
import './global.css'

import { Create } from './components/screens/create/Create'

const rootElement = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(rootElement);

root.render(
    <Create />
);