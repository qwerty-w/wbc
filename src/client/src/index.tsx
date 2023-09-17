import './global.css'

import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Create } from './components/screens/create/Create'

const rootElement = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(rootElement);

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<Create />}/>
                <Route path='/address/:addr' element={<Create />}/>
                <Route path='/transaction/:tx' element={<Create />}/>
            </Routes>
        </BrowserRouter>
    )
}

root.render(
    <App />
);