import './Create.css'

import { useState } from 'react'

import { Addresses } from './add/Addresses'
import { Transactions } from './txs/Transactions'
import { Creator } from './crt/Creator'

import { NewAddress } from './new-address/NewAddress'

import { TransactionProvider } from './txs/context'
import { IOProvider } from './crt/context'

function Create() {
    const [newAddressIsVisible, setNewAddressVisibility] = useState<boolean>(false)
    return (
        <TransactionProvider>
            <IOProvider>
                <div className='main'>
                    <Addresses setNewAddressVisibility={setNewAddressVisibility} />
                    <Transactions />
                    <Creator />
                    {newAddressIsVisible && <NewAddress setVisibility={setNewAddressVisibility}/>}
                </div>
            </IOProvider>
        </TransactionProvider>
    );
}

export default Create;
