import { useContext, createContext } from 'react'
import styled from 'styled-components'

import { Container } from './common/utils'
import { AddressContainer, AddressesView, getAddresses }  from './components/create-transaction/addresses'
import { Transaction, TransactionsView } from './components/create-transaction/transactions'
import { Creator, CreatorView } from './components/create-transaction/creator'
import { NewAddressModal, NewAddressModalView } from './components/create-transaction/new-address-modal'
import { NewOutputModal, NewOutputModalView } from './components/create-transaction/new-output-modal'
import { Popup, PopupView } from './common/popup'


const StyledCreate = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    padding-top: 12%;
    gap: 64px;
`

interface IModals {
    newaddr: NewAddressModal,
    newout: NewOutputModal
}

interface IGlobalStore {
    addrs: AddressContainer,
    txs: Container<Transaction>,
    creator: Creator,
    modals: IModals,
    popup: Popup
}

export const GlobalStore = createContext<IGlobalStore>({
    addrs: new AddressContainer(getAddresses()),
    txs: new Container('id'),
    creator: new Creator(),
    modals: {
        newaddr: new NewAddressModal(),
        newout: new NewOutputModal()
    },
    popup: new Popup(10)
})

export const CreateView = () => {
    const store = useContext(GlobalStore)
    ;(window as any).store = store
    return (
        <GlobalStore.Provider value={store}>
            <StyledCreate>
                <AddressesView />
                <TransactionsView />
                <CreatorView />
                <NewAddressModalView />
                <NewOutputModalView />
                <PopupView popup={store.popup}/>
            </StyledCreate>
        </GlobalStore.Provider>
    );
}