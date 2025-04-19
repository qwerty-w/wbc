import { useContext, createContext } from 'react'
import styled from 'styled-components'

import { Container } from '../core/utils/container'
import { head, HeadBlock } from '../core/lib/headblock'
import { AddressContainer, AddressesView, getAddresses }  from './components/Addresses'
import { Transaction, TransactionsView } from './components/Transactions'
import { Creator, CreatorView } from './components/Creator'
import { NewAddressModal, NewAddressModalView } from './components/NewAddressModal'
import { NewOutputModal, NewOutputModalView } from './components/NewOutputModal'
import { Popup, PopupView } from '../core/components/Popup'


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
    popup: Popup,
    head: HeadBlock
}

export const GlobalStore = createContext<IGlobalStore>({
    addrs: new AddressContainer(getAddresses()),
    txs: new Container('id'),
    creator: new Creator(),
    modals: {
        newaddr: new NewAddressModal(),
        newout: new NewOutputModal()
    },
    popup: new Popup(10),
    head
})

export const TransactionCreatorView = () => {
    const store = useContext(GlobalStore)
    ;(window as any).store = store
    return (
        <GlobalStore.Provider value={store}>
            <StyledCreate>
                <AddressesView/>
                <TransactionsView/>
                <CreatorView/>
                <NewAddressModalView/>
                <NewOutputModalView/>
                <PopupView popup={store.popup}/>
            </StyledCreate>
        </GlobalStore.Provider>
    );
}