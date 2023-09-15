import './Addresses.css'
import { useContext, useRef } from 'react'
import { makeObservable, observable, action } from 'mobx'
import { observer } from 'mobx-react-lite'

import { Container, setBuffer } from '../../../../utils'
import { ContextMenuItem, ContextMenuDivider, ContextMenuView  } from '../../common/context-menu/contextmenu'
import { GlobalStore } from '../Create'
import { getTransactions } from '../txs/Transactions'

const { default: ArrowSvg } = require('./icons/arrow.svg') as { default: string }
const { default: AddressIcon } = require('./icons/butterfly.svg') as { default: string }

export { Address, AddressContainer, getAddresses, AddressesView }


class Address {
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

class AddressContainer extends Container<Address> {
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

const getAddresses = (): Array<Address> => {  // TODO
    return [
        new Address('address-string', 'My address #1')
    ]
}

interface IAddressViewProps {
    address: Address
}

const AddressView = observer(({ address }: IAddressViewProps) => {
    const { addrs, txs, modals } = useContext(GlobalStore)
    const ref = useRef<HTMLDivElement>(null)
    return (
        <ContextMenuView items={
            <>
                <ContextMenuItem name='Add new address' onClick={ ev => { modals.newaddr.setShowed(true) } } />
                <ContextMenuDivider />
                <ContextMenuItem name='Copy name' onClick={ ev => { setBuffer(address.name) } } />
                <ContextMenuItem name='Copy address' onClick={ ev => { setBuffer(address.str) } } />
                <ContextMenuItem name='Copy emoji' onClick={ ev => { setBuffer('🦋') } } />  {/* TODO */}
            </>
        } effect={menu => { menu.isShowed ? (ref.current as HTMLDivElement).style.backgroundColor = '#E7E7E7' : ref.current?.removeAttribute('style') }}>
            <div className={`address ${addrs.current === address.str ? 'selected' : ''}`} ref={ref} onClick={() => {
                if (txs.isEmpty()) {
                    txs.extend(getTransactions())
                }
                addrs.setCurrent(address.str)
            }}>
                <div className="address__left">
                    <img src={AddressIcon} alt="ico" />
                </div>
                <div className="address__right">
                    <span className="address__name">{address.name}</span>
                    <div className="address__arrow">
                        <img src={ArrowSvg} alt="-->" />       
                    </div>
                </div>
            </div>
        </ContextMenuView>
    )
})

const AddressesView = observer(() => {
    const { newaddr } = useContext(GlobalStore).modals
    const { addrs } = useContext(GlobalStore)

    return (
        <ContextMenuView items={
            <>
                <ContextMenuItem name='Add new address' onClick={ ev => { newaddr.setShowed(true) } } />
            </>
        }>
            <div className='add'>
                {
                    addrs.arr.map(address => <AddressView key={address.str} address={address} />)
                }
            </div>
        </ContextMenuView>
    )
})