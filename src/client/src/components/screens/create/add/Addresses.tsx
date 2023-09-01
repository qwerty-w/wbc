import React from 'react'
import './Addresses.css'

const { default: ArrowSvg } = require('./icons/arrow.svg') as { default: string }
const { default: AddressIcon } = require('./icons/butterfly.svg') as { default: string }

export interface IAddress {
    str: string,
    name: string
}

export function Address({ str, name }: IAddress) {
    return (
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

export function Addresses() {
    const addresses: IAddress[] = getAddresses()
    return (
        <div className='add'>
            {
                addresses.map((address, index) => <Address key={index} str={address.str} name={address.name} />)
            }
        </div>
    )
}