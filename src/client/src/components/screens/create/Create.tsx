import './Create.css'
import { Addresses } from './add/Addresses'
import { Transactions } from './txs/Transactions'
import { Creator } from './crt/Creator'
import { TransactionProvider } from './txs/context'
import { IOProvider } from './crt/context'
import { ModalContextProvider } from '../common/modal/modal'
import { NewAddressModal, NewAddressContext } from './new-address/NewAddress'
import { NewOutputModal, NewOutputContext } from './new-output/NewOutput'

function Create() {
    return (
        <TransactionProvider>
            <IOProvider>
                <ModalContextProvider context={NewAddressContext}>
                    <ModalContextProvider context={NewOutputContext}>
                        <div className='main'>
                            <Addresses />
                            <Transactions />
                            <Creator />
                            <NewAddressModal />
                            <NewOutputModal />
                        </div>
                    </ModalContextProvider>
                </ModalContextProvider>
            </IOProvider>
        </TransactionProvider>
    );
}

export default Create;
