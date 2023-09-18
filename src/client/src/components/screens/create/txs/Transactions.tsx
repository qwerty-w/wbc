import './Transactions.css'
import { useContext, useRef } from 'react'
import { formateDate, setBuffer, toBitcoins, wrapString } from '../../../../utils'
import { ContextMenuItem, ContextMenuDivider, ContextMenuView } from '../../common/context-menu/contextmenu'
import { GlobalStore } from '../Create'
import { Input } from '../crt/Creator'
import { observer } from 'mobx-react-lite'

export { getTransactions, TransactionLeftView, TransactionRightView, Transaction, TransactionsView }


class Transaction {
    feeFormatter = Intl.NumberFormat('en', { notation: 'compact', minimumFractionDigits: 1, maximumFractionDigits: 1 });

    constructor(public id: string, public confs: number, public s_timestamp: number, public amount: number, public fee: number) {}
    get date() {
        return formateDate(this.s_timestamp)
    }
    get formattedFee() {
        return this.fee < 1000 ? String(this.fee) : this.feeFormatter.format(this.fee)
    }
    get wrappedID() { 
        return wrapString(this.id)    
    }
    get btcAmount() {
        return toBitcoins(this.amount)
    }
    get btcFee() {
        return toBitcoins(this.fee)
    }
}

const getTransactions = (): Transaction[] => {  // TODO
    return [
        new Transaction(
            '4902f9e3fad8473d2a13c4a07efca3c01df38643e8a3d375858c34e869c7bf63',
            0,
            1688334358,
            3612443,
            4000
        ),
        new Transaction(
            'fg10f9e3fad8473d2a13c4a07efca3c01df38643e8a3d375858c34e869c7lk92',
            0,
            1688334358,
            3612443,
            4000
        )
    ]
}

interface IPropsWithTransaction {
    tx: Transaction
}

const FormattedDate = ({ tx }: IPropsWithTransaction) => {
    return (
        <div className="transaction__date">
            <span className="transaction__date-label">Date:</span>&nbsp;
            <span className="transaction__date-value">{tx.date}</span>
        </div>
    )
}

const Fee = ({ tx }: IPropsWithTransaction) => {
    return (
        <div className="transaction__fee">
            <span className="transaction__fee-label">Fee</span>&nbsp;
            <span className="transaction__fee-value">{tx.formattedFee}</span>
        </div>
    )
}

const TransactionLeftView = ({ tx }: IPropsWithTransaction) => {
    return (
        <div className="transaction__left"> 
            <div className="transaction__id">
                <span className="transaction__id-label">ID:</span>&nbsp;
                <span className="transaction__id-value">{tx.wrappedID}</span>
            </div>
            <div className="transaction__confs">
                <span className="transaction__confs-label">Confirmations:</span>&nbsp;
                <span className="transaction__confs-value">{tx.confs}</span>
            </div>
            <FormattedDate tx={tx} />
        </div>
    )
}

const TransactionRightView = ({ tx }: IPropsWithTransaction) => {
    return (
        <div className="transaction__right">
            <span className="transaction__amount">{tx.btcAmount}</span>
            <Fee tx={tx} />
        </div>
    )
}

const TransactionView = observer(({ tx }: IPropsWithTransaction) => {
    const { inps } = useContext(GlobalStore).creator
    const currentTransaction = useRef<HTMLDivElement>(null)
    return (
        <ContextMenuView items={
            <>
                <ContextMenuItem name='View detail' onClick={ev => {  }} />
                <ContextMenuDivider/>
                <ContextMenuItem name='Copy ID' onClick={ () => setBuffer(tx.id) } />
                <ContextMenuItem name='Copy confirmations' onClick={ () => setBuffer(tx.confs) } />
                <ContextMenuItem name='Copy date' onClick={ () => setBuffer(tx.formattedFee) } />
                <ContextMenuItem name='Copy amount' onClick={ () => setBuffer(tx.btcAmount) } />
                <ContextMenuItem name='Copy fee' onClick={ () => setBuffer(tx.btcFee) } />
            </>
        } effect={menu => menu.isShowed ? (currentTransaction.current as HTMLDivElement).style.backgroundColor = '#E7E7E7' : currentTransaction.current?.removeAttribute('style')}>
            <div className={`transaction tx ${inps.has(tx.id) ? 'selected' : ''}`}
                 ref={currentTransaction}
                 onClick={() => !inps.has(tx.id) ? inps.add(new Input(tx.id, tx.amount)) : inps.remove(tx.id)}>
                <TransactionLeftView tx={tx} />
                <TransactionRightView tx={tx} />
            </div>
        </ContextMenuView>
    )
})

const TransactionsView = observer(() => {
    const { txs, creator } = useContext(GlobalStore)
    return (
        <ContextMenuView items={
            <>
                <ContextMenuItem name='Select all' onClick={ev => creator.inps.extend(txs.arr.filter(tx => !creator.inps.has(tx.id)).map(tx => new Input(tx.id, tx.amount)))} />
            </>
        }>
            <div className='txs'>
                {
                    txs.arr.map(tx => <TransactionView key={tx.id} tx={tx} />)
                }
            </div>
        </ContextMenuView>
    )
})
