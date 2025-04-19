import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import * as apitypes from '../core/api/types'
import { getAddress, getAddressTransactions } from '../core/api/explorer'
import { toBitcoins } from '../core/utils/utils'
import * as detail from './BaseDetail'
import { AddressTransactionDirection, Transaction, TransactionInfoView } from '../core/components/BaseTransaction'
import { observer } from 'mobx-react-lite'


const StyledType = styled(detail.StyledOption)`
    gap: 6px;
    user-select: text;

    img {
        user-select: none;
    }
`
const StyledBottom = styled.div`
    width: 100%;
    height: 100%;
    padding: 37px 54px;

    display: flex;
    justify-content: space-between;
    align-items: center;
`
const StyledInfo = styled.div`
    width: 308px;
    height: 401px;
    border-radius: 20px;
    background-color: #f2f2f2;

    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    gap: 20px;

    padding: 20px 29px;
`
const StyledInfoItem = styled.div`
    border-radius: 18px;
`
const StyledTransactionContainer = styled.div`
    width: 570px;
    height: 401px;
    border: 1px solid #E0E0E0;
    border-radius: 20px;
    background-color: #f2f2f2;
`
const StyledTransaction = styled.div`
    height: 80px;
    padding: 13px 16px;
    background-color: #fff;
    border-bottom: 1px solid #E0E0E0;

    display: flex;
    justify-content: space-between;

    &:hover {
        background-color: #fdfdfd;
        cursor: pointer;
    }

    &:first-child {
        border-radius: 20px 20px 0px 0px;
    }
`
const StyledTransactionLeft = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;

    .transaction__left {
        height: 100%;
        font-size: 14px;

        gap: unset;
        justify-content: space-between;
    }
`
const StyledTransactionRight = styled.div`
    display: flex;
    align-items: center;

    .transaction__amount {
        font-size: 18px;
    }
    .transaction__fee {
        font-size: 14px;
    }
`

const TopLeftOptionsView = ({ copyString }: { copyString: string }) => {
    return (
        <>
            <detail.QrButton data=""/>
            <detail.CopyButton string={copyString} />
        </>
    )
}

const TopRightOptionsView = () => {
    return (
        <StyledType $width='120px' $height='33px' $borderRadius='10px'>
            <img src="/icons/wallet.svg" alt="." />
            <span>P2WPKH</span>
        </StyledType>
    )
}

const InfoItemView = ({ label, value }: { label: string, value: any }) => {
    return (
        <detail.InfoItemView label={label} value={value} asStyledItem={StyledInfoItem} />
    )
}

const TransactionView = observer(({ tx, direction }: { tx: Transaction, direction: AddressTransactionDirection }) => {
    return (
        <StyledTransaction>
            <StyledTransactionLeft>
                <img src={direction == 'in' ? '/icons/tx-in.svg' : '/icons/tx-out.svg'} alt={String(direction)} />
                <TransactionInfoView.left id={tx.formatted.id} confirmations={tx.confirmations} fontSize='14px' />
            </StyledTransactionLeft>
            <StyledTransactionRight>
                <TransactionInfoView.right amount={tx.formatted.inamount} fee={tx.formatted.fee} amountFontSize='17px' feeFontSize='14px' />
            </StyledTransactionRight>
        </StyledTransaction>
    )
})

const BottomView = ({ info, transactions }: { info: apitypes.AddressDetail, transactions: Array<Transaction> }) => {
    return (
        <StyledBottom>
            <StyledInfo>
                <InfoItemView label='Balance' value={toBitcoins(info.balance)} />
                <InfoItemView label='Transactions count' value={info.tx_count} />
                <InfoItemView label='Total received' value={toBitcoins(info.received)} />
                <InfoItemView label='Total sent' value={toBitcoins(info.spent)} />
            </StyledInfo>
            <StyledTransactionContainer>
                { transactions.map(tx => <TransactionView key={tx.id} tx={tx} direction={tx.getDirection(info.address)} />) }
            </StyledTransactionContainer>
        </StyledBottom>
    )
}

export const DetailedAddressView = () => {
    const address = useParams().addr
    const [info, setInfo] = useState<apitypes.AddressDetail | null>(null)
    const [transactions, setTransactions] = useState<Array<Transaction>>([])

    useEffect(() => {
        if (!address) return
        getAddress(address).then(info => setInfo(info))
        getAddressTransactions(address, { length: 5 }).then(
            transactions => setTransactions(
                transactions.map(tx => Transaction.fromObject(tx))
            )
        )
    }, [])

    return address ? <detail.DetailView
        string={info ? address : 'loading'}
        options={{ left: <TopLeftOptionsView copyString={address} />, right: <TopRightOptionsView /> }}
        bottom={<BottomView info={info ? info : {
            address: 'loading',
            received: -1,
            spent: -1,
            tx_count: -1,
            network: apitypes.NetworkType.mainnet,
            balance: -1
        }} transactions={transactions} />}
    /> : <>not found</>
}