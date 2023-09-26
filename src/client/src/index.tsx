import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AddressDetailView } from './screens/address-detail';
import { TransactionDetailView } from './screens/transaction-detail';
import { CreateView } from './screens/create-transaction';

const rootElement = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(rootElement);

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/' element={<CreateView />}/>
                <Route path='/address/:addr' element={<AddressDetailView />}/>
                <Route path='/transaction/:txid' element={<TransactionDetailView />}/>
            </Routes>
        </BrowserRouter>
    )
}

root.render(
    <App />
);