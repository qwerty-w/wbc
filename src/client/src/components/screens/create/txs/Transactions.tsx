import './Transactions.css'
import { useEffect, useContext, useRef, useState } from 'react'
import { InputsContext } from '../crt/context'
import { toBitcoins, wrapString } from '../../../../utils'
import { ContextMenu, ContextMenuDivider, ContextMenuItem, IContextMenuPos, onContextMenu } from '../../common/context-menu/contextmenu'

export { type ITransaction, Transactions }

interface ITransaction {
    id: string,
    confs: number,
    s_timestamp: number,
    amount: number,
    fee: number
}

interface IFeeProps {
    amount: number
}

interface IDateProps {
    s_timestamp: number
}

function zeroFill(val: string | number, length: number = 2): string {
    return String(val).padStart(length, '0')
}

function formateDate(s_timestamp: number) {
    let ms_timestamp = s_timestamp * 1000
    var date = new Date(ms_timestamp)
    return `${zeroFill(date.getDay())}.${zeroFill(date.getMonth())}.${date.getFullYear()}, ${zeroFill(date.getHours())}:${zeroFill(date.getMinutes())}:${zeroFill(date.getSeconds())}`
}

function FormattedDate({ s_timestamp }: IDateProps) {
    return (
        <div className="transaction__date">
            <span className="transaction__date-label">Date:</span>&nbsp;
            <span className="transaction__date-value">{formateDate(s_timestamp)}</span>
        </div>
    )
}

function Fee({ amount }: IFeeProps) {
    let formatter = Intl.NumberFormat('en', { notation: 'compact', minimumFractionDigits: 1, maximumFractionDigits: 1 });
    var fee = amount < 1000 ? String(amount) : formatter.format(amount)

    return (
        <div className="transaction__fee">
            <span className="transaction__fee-label">Fee</span>&nbsp;
            <span className="transaction__fee-value">{fee}</span>
        </div>
    )
}

function Transaction({ id, confs, s_timestamp, amount, fee }: ITransaction) {
    const { inps, setInps } = useContext(InputsContext)
    const currentTransaction = useRef<HTMLDivElement>(null)

    const [contextMenuIsShowed, setContextMenuIsShowed] = useState<boolean>(false)
    const [contextMenuPos, setContextMenuPos] = useState<IContextMenuPos>({ top: 0, left: 0 })
    const contextMenuState = { isShowed: contextMenuIsShowed, setIsShowed: setContextMenuIsShowed, pos: contextMenuPos, setPos: setContextMenuPos }

    const [isHovered, setIsHovered] = useState<boolean>(false)

    async function setBuffer(text: string) {
        await navigator.clipboard.writeText(text)
    }

    useEffect(() => {
        (currentTransaction.current as HTMLDivElement).style.backgroundColor = contextMenuIsShowed || isHovered ? '#E7E7E7' : '#F2F2F2'
    }, [contextMenuIsShowed, isHovered])

    return (
        <div className="transaction tx" ref={currentTransaction} onClick={ev => {
            for (let inp of inps) {
                if (inp.txid === id) {
                    return
                }
            }
            setInps([...inps, { txid: id, amount: amount }])
            currentTransaction.current?.classList.add('selected')
        }} onContextMenu={onContextMenu(contextMenuState)} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() =>setIsHovered(false)}>
            <div className="transaction__left">
                <div className="transaction__id">
                    <span className="transaction__id-label">ID:</span>&nbsp;
                    <span className="transaction__id-value">{wrapString(id)}</span>
                </div>
                <div className="transaction__confs">
                    <span className="transaction__confs-label">Confirmations:</span>&nbsp;
                    <span className="transaction__confs-value">{confs}</span>
                </div>
                <FormattedDate s_timestamp={s_timestamp} />
            </div>
            <div className="transaction__right">
                <span className="transaction__amount">{toBitcoins(amount)}</span>
                <Fee amount={fee} />
            </div>
            <ContextMenu state={contextMenuState}>
                <ContextMenuItem name='View detail' onClick={ev => {  }} />
                <ContextMenuDivider/>
                <ContextMenuItem name='Copy ID' onClick={ev => { setBuffer(id) }} />
                <ContextMenuItem name='Copy confirmations' onClick={ev => { setBuffer(String(confs)) }} />
                <ContextMenuItem name='Copy date' onClick={ev => { setBuffer(formateDate(s_timestamp)) }} />
                <ContextMenuItem name='Copy amount' onClick={ev => { setBuffer(String(toBitcoins(amount))) }} />
                <ContextMenuItem name='Copy fee' onClick={ev => { setBuffer(String(toBitcoins(fee))) }} />
            </ContextMenu>
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
                txs.map(tx => <Transaction key={tx.id} {...tx} />)
            }
        </div>
    )
}
