import { useState } from 'react'

import './Create.css'
import { Addresses } from './add/Addresses'
import { Transactions } from './txs/Transactions'
import { Creator } from './crt/Creator'

import { NewAddress } from './new-address/NewAddress'

import { TransactionProvider } from './txs/context'
import { IOProvider } from './crt/context'

function Create() {
    const [NewAddressIsVisible, setNewAddressVisibility] = useState<boolean>(false)
    return (
        <TransactionProvider>
            <IOProvider>
                <div className='main'>
                    <button onClick={() => setNewAddressVisibility(true)}>Change new <br />address visible</button>
                    <Addresses />
                    <Transactions />
                    <Creator />
                    {NewAddressIsVisible && <NewAddress setVisibility={setNewAddressVisibility}/>}
                </div>
            </IOProvider>
        </TransactionProvider>
    );
}

export default Create;
