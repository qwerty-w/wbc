import { useState } from 'react'

import './Create.css'
import { Addresses } from './add/Addresses'
import { Transactions } from './txs/Transactions'
import { Creator } from './crt/Creator'

import { TransactionProvider } from './txs/context'
import { IOProvider } from './crt/context'

function Create() {
    return (
    <TransactionProvider>
        <IOProvider>
            <div className='main'>
                <Addresses />
                <Transactions />
                <Creator />
            </div>
        </IOProvider>
    </TransactionProvider>
    );
}

export default Create;
