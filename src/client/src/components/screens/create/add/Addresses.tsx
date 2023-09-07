import './Addresses.css'
import { setBuffer } from '../../../../utils'
import { ContextMenu, ContextMenuDivider, ContextMenuItem } from '../../common/context-menu/contextmenu'

const { default: ArrowSvg } = require('./icons/arrow.svg') as { default: string }
const { default: AddressIcon } = require('./icons/butterfly.svg') as { default: string }

export { type IAddress, Address, Addresses }

interface IAddress {
    str: string,
    name: string
}

interface IAddressProps extends IAddress { 
    setNewAddressVisibility: React.Dispatch<React.SetStateAction<boolean>>
}

function Address({ str, name, setNewAddressVisibility }: IAddressProps) {
    return (
        <ContextMenu items={
            <>
                <ContextMenuItem name='Add new address' onClick={ ev => { setNewAddressVisibility(true) } } />
                <ContextMenuDivider />
                <ContextMenuItem name='Copy name' onClick={ ev => { setBuffer(name) } } />
                <ContextMenuItem name='Copy address' onClick={ ev => { setBuffer(str) } } />
                <ContextMenuItem name='Copy emoji' onClick={ ev => { setBuffer('🦋') } } />  {/* TODO */}
            </>
        }>
            <div className="address">
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

interface IAddressesProps {
    setNewAddressVisibility: React.Dispatch<React.SetStateAction<boolean>>
}

function Addresses({ setNewAddressVisibility }: IAddressesProps) {
    const addresses: IAddress[] = getAddresses()
    return (
        <ContextMenu items={
            <>
                <ContextMenuItem name='Add new address' onClick={ ev => { setNewAddressVisibility(true) } } />
            </>
        }>
            <div className='add'>
                {
                    addresses.map((address, index) => <Address key={index} setNewAddressVisibility={setNewAddressVisibility} {...address} />)
                }
            </div>
        </ContextMenu>
    )
}