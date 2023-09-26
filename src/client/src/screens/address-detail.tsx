import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { toBitcoins } from './common/utils'
import * as detail from './common/detail'
import * as txs from './components/create-transaction/transactions'
import { TransactionInfoView } from './common/screen'


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


class Transaction extends txs.Transaction {
    type: 'in' | 'out'

    constructor(id: string, confs: number, s_timestamp: number, amount: number, fee: number, type: 'in' | 'out') {
        super(id, confs, s_timestamp, amount, fee)
        this.type = type
    }
}

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

const TransactionView = ({ tx }: { tx: Transaction }) => {
    return (
        <StyledTransaction>
            <StyledTransactionLeft>
                <img src={tx.type === 'in' ? '/icons/tx-in.svg' : '/icons/tx-out.svg'} alt={tx.type} />
                <TransactionInfoView.left id={tx.wrappedID} confs={tx.confs} date={tx.date} fontSize='14px' />
            </StyledTransactionLeft>
            <StyledTransactionRight>
                <TransactionInfoView.right amount={tx.btcAmount} fee={tx.formattedFee} amountFontSize='17px' feeFontSize='14px' />
            </StyledTransactionRight>
        </StyledTransaction>
    )
}

const BottomView = ({ info }: { info: IAddressDetailInfo }) => {
    return (
        <StyledBottom>
            <StyledInfo>
                <InfoItemView label='Balance' value={toBitcoins(info.balance)} />
                <InfoItemView label='Transactions count' value={info.txCount} />
                <InfoItemView label='Total received' value={toBitcoins(info.received)} />
                <InfoItemView label='Total sent' value={toBitcoins(info.sent)} />
            </StyledInfo>
            <StyledTransactionContainer>
                { info.txs.map(tx => <TransactionView key={tx.id} tx={tx} />) }
            </StyledTransactionContainer>
        </StyledBottom>
    )
}

interface IAddressDetailInfo {
    balance: number,
    txCount: number,
    received: number,
    sent: number,
    txs: Transaction[]
}

function getAddressInfo(address: string): IAddressDetailInfo {
    return {
        balance: 18161861,
        txCount: 1180,
        received: 2240745028,
        sent: 2224103871,
        txs: [
            new Transaction('96f4f76166b6f368ac6a9901446db7b27c057cb441f01589fe32b0d5d95f7cf7',
                4, 1694930749, 97261894, 8721, 'in')
        ]
    }
}

export const AddressDetailView = () => {
    const address = useParams().addr

    if (!address) {
        return <></>
    }

    const inf = getAddressInfo(address)

    return <detail.DetailView string={address}
                       options={{ left: <TopLeftOptionsView copyString={address} />, right: <TopRightOptionsView /> }}
                       bottom={<BottomView info={inf} />} />
}