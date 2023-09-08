import './Addresses.css'
import { useContext, useRef } from 'react'
import { setBuffer } from '../../../../utils'
import { ContextMenu, ContextMenuDivider, ContextMenuItem } from '../../common/context-menu/contextmenu'
import { NewAddressContext } from '../new-address/NewAddress'

const { default: ArrowSvg } = require('./icons/arrow.svg') as { default: string }
const { default: AddressIcon } = require('./icons/butterfly.svg') as { default: string }

export { type IAddress, Address, Addresses }

interface IAddress {
    str: string,
    name: string
}

function Address({ str, name }: IAddress) {
    const ref = useRef<HTMLDivElement>(null)
    const setNewAddressIsShowed = useContext(NewAddressContext).setIsShowed
    return (
        <ContextMenu items={
            <>
                <ContextMenuItem name='Add new address' onClick={ ev => { setNewAddressIsShowed(true) } } />
                <ContextMenuDivider />
                <ContextMenuItem name='Copy name' onClick={ ev => { setBuffer(name) } } />
                <ContextMenuItem name='Copy address' onClick={ ev => { setBuffer(str) } } />
                <ContextMenuItem name='Copy emoji' onClick={ ev => { setBuffer('🦋') } } />  {/* TODO */}
            </>
        } effect={isShowed => { isShowed ?
                                (ref.current as HTMLDivElement).style.backgroundColor = '#E7E7E7' : 
                                ref.current?.removeAttribute('style') }}>
            <div className="address" ref={ref}>
                <div className="address__left">
                    <img src={AddressIcon} alt="ico" />
                </div>
                <div className="address__right">
                    <span className="address__name">{name}</span>
                    <div className="address__arrow">
                        <img src={ArrowSvg} alt="-->" />       
                    </div>
                </div>
            </div>
        </ContextMenu>
    )
}

function getAddresses(): IAddress[] {  // TODO
    return [
        {
            str: 'address-string',
            name: 'My address #1'
        }
    ]
}

function Addresses() {
    const setNewAddressIsShowed = useContext(NewAddressContext).setIsShowed
    const addresses: IAddress[] = getAddresses()
    return (
        <ContextMenu items={
            <>
                <ContextMenuItem name='Add new address' onClick={ ev => { setNewAddressIsShowed(true) } } />
            </>
        }>
            <div className='add'>
                {
                    addresses.map((address, index) => <Address key={index} {...address} />)
                }
            </div>
        </ContextMenu>
    )
}