import { useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { makeObservable, observable, action } from 'mobx'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'

import { GlobalStore } from '../TransactionCreator'
import { Container } from '../../core/utils/Container'
import { ContextMenuItem, ContextMenuDivider, ContextMenuView  } from '../../core/components/ContextMenu'
import { getTransactions } from './Transactions'
import { setClipboard } from '../../core/utils/Utils'


const StyledAddresses = styled.div`
    min-width: 290px;
    width: 390px;
    min-height: 400px;
    height: 476px;
    border-radius: 20px;
    background: #FFF;

    display: flex;
    flex-direction: column;
`
const StyledAddressLeft = styled.div`
    min-width: 78px;

    display: flex;
    justify-content: center;
    align-items: center;
`
const StyledAddressRight = styled.div`
    width: 80%;
    border-bottom: 1px solid #DFDFDF;

    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
`
const StyledAddress = styled.div<{ $selected?: boolean }>`
    min-height: 59px;
    padding-top: 5px;
    background-color: ${props => props.$selected ? '#dfdfdf' : 'unset'};

    display: flex;
    flex-direction: row;

    &:first-child {
        border-radius: 20px 20px 0px 0px;
    }
    &:hover {
        cursor: pointer;
        background-color: #e7e7e7;
    }
    &:hover > ${StyledAddressRight} {
        border-bottom-color: #e7e7e7;
    }
    &.onmenu {
        background-color: #e7e7e7;
    }
`
const StyledAddressName = styled.div`
    font-size: 14px;
    font-weight: 500;
`
const StyledArrow = styled.div`
    margin-right: 26px;
`


export class Address {
    constructor(public str: string, public name: string, public icon?: any) {
        makeObservable(this, {
            name: observable,
            changeName: action
        })
    }
    changeName(name: string) {
        this.name = name
    }
}

export class AddressContainer extends Container<Address> {
    constructor(iter?: Iterable<Address>, public current: string | null = null) {
        super('str', iter)
        makeObservable(this, {
            current: observable,
            setCurrent: action
        })
    }
    setCurrent(addressString: string) {
        this.current = addressString
    }
}

export const getAddresses = (): Array<Address> => {  // TODO
    return [
        new Address('address-string', 'My address #1')
    ]
}

const AddressView = observer(({ address }: { address: Address }) => {
    const { addrs, txs, modals } = useContext(GlobalStore)
    const ref = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    return (
        <ContextMenuView items={
            <>
                <ContextMenuItem name='View detail' onClick={ev => { navigate(`/address/${address.str}`) }} />
                <ContextMenuDivider />
                <ContextMenuItem name='Copy name' onClick={ ev => { setClipboard(address.name) } } />
                <ContextMenuItem name='Copy address' onClick={ ev => { setClipboard(address.str) } } />
                <ContextMenuItem name='Copy emoji' onClick={ ev => { setClipboard('🦋') } } />  {/* TODO */}
                <ContextMenuDivider />
                <ContextMenuItem name='Add new address' onClick={ ev => { modals.newaddr.show() } } />
            </>
        } effect={menu => ref.current?.classList[menu.isShowed ? 'add' : 'remove']('onmenu')}>
            <StyledAddress $selected={addrs.current === address.str} ref={ref} onClick={() => {
                txs.clear()
                txs.extend(getTransactions())
                addrs.setCurrent(address.str)
            }}>
                <StyledAddressLeft>
                    <img src="/icons/butterfly.svg" alt="ico" />
                </StyledAddressLeft>
                <StyledAddressRight>
                    <StyledAddressName>{address.name}</StyledAddressName>
                    <StyledArrow>
                        <img src="/icons/arrow.svg" alt="-->" />
                    </StyledArrow>
                </StyledAddressRight>
            </StyledAddress>
        </ContextMenuView>
    )
})

export const AddressesView = observer(() => {
    const { newaddr } = useContext(GlobalStore).modals
    const { addrs } = useContext(GlobalStore)

    return (
        <ContextMenuView items={
            <>
                <ContextMenuItem name='Add new address' onClick={ ev => { newaddr.show() } } />
            </>
        }>
            <StyledAddresses>
                {
                    addrs.arr.map(address => <AddressView key={address.str} address={address} />)
                }
            </StyledAddresses>
        </ContextMenuView>
    )
})