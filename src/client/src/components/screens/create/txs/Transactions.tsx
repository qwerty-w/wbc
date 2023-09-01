import { useContext } from 'react'
import './Transactions.css'
import { InputsContext } from '../crt/context'
import { toBitcoins, wrapString } from '../../../../utils'

export { type ITransaction, Transactions }

interface ITransaction {
    id: string,
    confs: number,
    s_timestamp: number,
    amount: number,
    fee: number
}

function zeroFill(val: string | number, length: number = 2): string {
    return String(val).padStart(length, '0')
}

function getDate(s_timestamp: number): string {
    let ms_timestamp = s_timestamp * 1000
    var date = new Date(ms_timestamp)
    return `${zeroFill(date.getDay())}.${zeroFill(date.getMonth())}.${date.getFullYear()}, ${zeroFill(date.getHours())}:${zeroFill(date.getMinutes())}:${zeroFill(date.getSeconds())}`
}

function wrapFee(fee: number): string {
    if (fee < 1000) {
        return String(fee)
    }
    let formatter = Intl.NumberFormat('en', { notation: 'compact', minimumFractionDigits: 1, maximumFractionDigits: 1 });
    return formatter.format(fee)
}

function Transaction({ id, confs, s_timestamp, amount, fee }: ITransaction) {
    const { inps, setInps } = useContext(InputsContext)

    return (
        <div className="transaction tx" onClick={e => {
            for (let inp of inps) {
                if (inp.txid === id) {
                    return
                }
            }
            setInps([...inps, { txid: id, amount: amount }])
        }}>
            <div className="transaction__left">
                <div className="transaction__id">
                    <span className="transaction__id-label">ID:</span>&nbsp;
                    <span className="transaction__id-value">{wrapString(id)}</span>
                </div>
                <div className="transaction__confs">
                    <span className="transaction__confs-label">Confirmations:</span>&nbsp;
                    <span className="transaction__confs-value">{confs}</span>
                </div>
                <div className="transaction__date">
                    <span className="transaction__date-label">Date:</span>&nbsp;
                    <span className="transaction__date-value">{getDate(s_timestamp)}</span>
                </div>
            </div>
            <div className="transaction__right">
                <span className="transaction__amount">{toBitcoins(amount)}</span>
                <div className="transaction__fee">
                    <span className="transaction__fee-label">Fee</span>&nbsp;
                    <span className="transaction__fee-value">{wrapFee(fee)}</span>
                </div>
            </div>
        </div>
    )
}

function getTransactions(): ITransaction[] {  // TODO
    return [
        {
            id: '4902f9e3fad8473d2a13c4a07efca3c01df38643e8a3d375858c34e869c7bf63',
            confs: 0,
            s_timestamp: 1688334358,
            amount: 3612443,
            fee: 4000
        },
        {
            id: 'fg10f9e3fad8473d2a13c4a07efca3c01df38643e8a3d375858c34e869c7lk92',
            confs: 0,
            s_timestamp: 1688334358,
            amount: 3612443,
            fee: 4000
        }
    ]
}

function Transactions() {
    var txs = getTransactions()
    return (
        <div className='txs'>
            {
                txs.map(tx => <Transaction key={tx.id} id={tx.id} confs={tx.confs} s_timestamp={tx.s_timestamp} amount={tx.amount} fee={tx.fee} />)
            }
        </div>
    )
}
