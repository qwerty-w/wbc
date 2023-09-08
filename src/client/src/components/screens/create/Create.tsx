import './Create.css'

import { Addresses } from './add/Addresses'
import { Transactions } from './txs/Transactions'
import { Creator } from './crt/Creator'

import { NewAddressModal, NewAddressContextProvider } from './new-address/NewAddress'

import { TransactionProvider } from './txs/context'
import { IOProvider } from './crt/context'

function Create() {
    return (
        <TransactionProvider>
            <IOProvider>
                <NewAddressContextProvider>
                    <div className='main'>
                        <Addresses />
                        <Transactions />
                        <Creator />
                        <NewAddressModal />
                    </div>
                </NewAddressContextProvider>
            </IOProvider>
        </TransactionProvider>
    );
}

export default Create;
