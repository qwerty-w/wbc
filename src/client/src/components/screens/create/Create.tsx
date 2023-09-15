import './Create.css'
import { createContext } from 'react'

import { Container } from '../../../utils'
import { AddressContainer, AddressesView, getAddresses } from './add/Addresses'
import { Transaction, TransactionsView } from './txs/Transactions'
import { Creator, CreatorView } from './crt/Creator'
import { ModalContextProvider } from '../common/modal/modal'
import { NewAddressModal, NewAddressContext } from './new-address/NewAddress'
import { NewOutputModal, NewOutputContext } from './new-output/NewOutput'


export { GlobalStateContext, Create }

// interface IModalStates {
//     NewAddress: ModalState,
//     NewOutput: ModalState
// }

interface GlobalState {
    addrs: AddressContainer,
    txs: Container<Transaction>,
    creator: Creator,
    // modals: IModalStates
}

const GlobalStateContext = createContext<GlobalState>({ addrs: new AddressContainer(), txs: new Container('id'), creator: new Creator() })

const Create = () => {
    return (
        <GlobalStateContext.Provider value={{ addrs: new AddressContainer(getAddresses()), txs: new Container('id'), creator: new Creator() }}>
            <ModalContextProvider context={NewAddressContext}>
                <ModalContextProvider context={NewOutputContext}>
                    <div className='main'>
                        <AddressesView />
                        <TransactionsView />
                        <CreatorView />
                        <NewAddressModal />
                        <NewOutputModal />
                    </div>
                </ModalContextProvider>
            </ModalContextProvider>
        </GlobalStateContext.Provider>
    );
}