import { useState } from 'react'

import './Create.css'
import { Addresses } from './add/Addresses'
import { Transactions } from './txs/Transactions'
import { Creator } from './crt/Creator'

import { TransactionProvider } from './txs/context'
import { IOProvider } from './crt/context'

import { IContextMenuAction, ContextMenu } from '../common/context-menu/contextmenu'


function Create() {
    const [contextMenuState, setContextMenuState] = useState(true)

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
