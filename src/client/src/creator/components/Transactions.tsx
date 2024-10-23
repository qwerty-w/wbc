import { useContext, useRef } from 'react'
import { useNavigate } from 'react-router'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'

import { formateDate, setClipboard, toBitcoins, wrapString } from '../../core/utils/Utils'
import { ContextMenuItem, ContextMenuDivider, ContextMenuView } from '../../core/components/ContextMenu'
import { TransactionInfoView } from '../../core/components/BaseTransaction'
import { GlobalStore } from '../TransactionCreator'
import { Input } from './Creator'


const StyledTransactions = styled.div`
    width: 390px;
    /* min-width: 369px; */
    height: 476px;
    padding: 21px 25px;
    border-radius: 20px;
    background: #FFF;

    display: flex;
    flex-direction: column;
    gap: 21px;
`
const StyledTransaction = styled.div<{ $selected?: boolean }>`
    min-width: 315px;
    min-height: 86px;
    padding: 10px 14px;
    background-color: ${props => props.$selected ? '#dfdfdf' : '#f2f2f2'};
    border-radius: 20px;
    user-select: none;

    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;

    &:hover {
        cursor: pointer;
        background-color: #e7e7e7;
    }
    &.onmenu {
        background-color: #e7e7e7;
    }
`


export class Transaction {
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

export const getTransactions = (): Transaction[] => {  // TODO
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

type PropsWithTransaction = {
    tx: Transaction
}

const TransactionView = observer(({ tx }: PropsWithTransaction) => {
    const { inps } = useContext(GlobalStore).creator
    const ref = useRef<HTMLDivElement>(null)
    const navigate = useNavigate()
    return (
        <ContextMenuView items={
            <>
                <ContextMenuItem name='View detail' onClick={ev => { navigate(`/transaction/${tx.id}`) }} />
                <ContextMenuDivider/>
                <ContextMenuItem name='Copy ID' onClick={ () => setClipboard(tx.id) } />
                <ContextMenuItem name='Copy confirmations' onClick={ () => setClipboard(tx.confs) } />
                <ContextMenuItem name='Copy date' onClick={ () => setClipboard(tx.formattedFee) } />
                <ContextMenuItem name='Copy amount' onClick={ () => setClipboard(tx.btcAmount) } />
                <ContextMenuItem name='Copy fee' onClick={ () => setClipboard(tx.btcFee) } />
            </>
        } effect={ menu => ref.current?.classList[menu.isShowed ? 'add' : 'remove' ]('onmenu') }>
            <StyledTransaction $selected={inps.has(tx.id)} ref={ref}
                               onClick={() => !inps.has(tx.id) ? inps.add(new Input(tx.id, tx.amount)) : inps.remove(tx.id)}>
                <TransactionInfoView.left id={tx.wrappedID} confs={tx.confs} date={tx.date} gap='3px' />
                <TransactionInfoView.right amount={tx.btcAmount} fee={tx.formattedFee} />
            </StyledTransaction>
        </ContextMenuView>
    )
})

export const TransactionsView = observer(() => {
    const { txs, creator } = useContext(GlobalStore)
    return (
        <ContextMenuView items={
            <>
                <ContextMenuItem name='Select all' onClick={ev => creator.inps.extend(txs.arr.filter(tx => !creator.inps.has(tx.id)).map(tx => new Input(tx.id, tx.amount)))} />
            </>
        }>
            <StyledTransactions>
                {
                    txs.arr.map(tx => <TransactionView key={tx.id} tx={tx} />)
                }
            </StyledTransactions>
        </ContextMenuView>
    )
})
