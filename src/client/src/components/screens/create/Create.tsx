import './Create.css'
import { useContext, createContext } from 'react'

import { Container } from '../../../utils'
import { AddressContainer, AddressesView, getAddresses } from './add/Addresses'
import { Transaction, TransactionsView } from './txs/Transactions'
import { Creator, CreatorView } from './crt/Creator'
import { NewAddressModal, NewAddressModalView } from './new-address/NewAddress'
import { NewOutputModal, NewOutputModalView } from './new-output/NewOutput'


export { GlobalStore, CreateView }

interface IModals {
    newaddr: NewAddressModal,
    newout: NewOutputModal
}

interface IGlobalStore {
    addrs: AddressContainer,
    txs: Container<Transaction>,
    creator: Creator,
    modals: IModals
}

const GlobalStore = createContext<IGlobalStore>({
    addrs: new AddressContainer(getAddresses()),
    txs: new Container('id'),
    creator: new Creator(),
    modals: {
        newaddr: new NewAddressModal(),
        newout: new NewOutputModal()
    }
})

const CreateView = () => {
    return (
        <GlobalStore.Provider value={useContext(GlobalStore)}>
            <div className='main'>
                <AddressesView />
                <TransactionsView />
                <CreatorView />
                <NewAddressModalView />
                <NewOutputModalView />
            </div>
        </GlobalStore.Provider>
    );
}