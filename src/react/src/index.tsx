import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { DetailedAddressView } from './explorer/DetailedAddress';
import { DetailedTransactionView } from './explorer/DetailedTransaction';
import { TransactionCreatorView } from './creator/TransactionCreator';
import { LoginWindowView } from './login/Login';


const rootElement = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(rootElement);

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/login' element={<LoginWindowView/>}/>
                <Route path='/' element={<TransactionCreatorView/>}/>
                <Route path='/address/:addr' element={<DetailedAddressView/>}/>
                <Route path='/transaction/:txid' element={<DetailedTransactionView/>}/>
            </Routes>
        </BrowserRouter>
    )
}

root.render(
    <App/>
);