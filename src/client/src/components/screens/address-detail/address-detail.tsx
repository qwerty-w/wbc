import './address-detail.css'
import { useParams } from 'react-router-dom'
import { toBitcoins } from '../../../utils'
import * as txs from '../create/txs/Transactions'

export { AddressDetailView }


const { default: qrSVG } = require('../common/detail-icons/qr-code.svg')
const { default: copySVG } = require('../common/detail-icons/copy.svg')
const { default: walletSVG } = require('./icons/wallet.svg')
const { default: transactionInSVG } = require('./icons/tx-in.svg')
const { default: transactionOutSVG } = require('./icons/tx-out.svg')

interface ITopProps {
    str: string
}

class BottomTransaction extends txs.Transaction {
    type: 'in' | 'out'

    constructor(id: string, confs: number, s_timestamp: number, amount: number, fee: number, type: 'in' | 'out') {
        super(id, confs, s_timestamp, amount, fee)
        this.type = type
    }
}

const TopView = ({ str }: ITopProps) => {
    return (
        <div className='address-detail__top'>
            <div className='address-detail__top-string'><span>{str}</span></div>
            <div className='address-detail__top-opt'>

                <div className='address-detail__top-buttons'>
                    <div className='address-detail__top-qr detail-top-button'>
                        <img src={qrSVG} alt="qr" />
                    </div>
                    <div className='address-detail__top-copy detail-top-button'>
                        <img src={copySVG} alt="copy" />
                    </div>
                </div>
                <div className='address-detail__top-type'>
                    <div className='address-detail__top-type-wallet'>
                        <img src={walletSVG} alt="." />
                    </div>
                    <span>P2WPKH</span>
                </div>
            </div>
        </div>
    )
}

interface IBottomTransactionProps {
    tx: BottomTransaction
}

const BottomTransactionView = ({ tx }: IBottomTransactionProps) => {
    return (
        <div className='address-detail__bot-tx'>
            <div className='address-detail__bot-tx-left'>
                <img src={tx.type === 'in' ? transactionInSVG : transactionOutSVG} alt={tx.type} />
                <txs.TransactionLeftView tx={tx} />
            </div>
            <txs.TransactionRightView tx={tx} />
        </div>
    )
}

interface IAddressDetailInfo {
    balance: number,
    txCount: number,
    received: number,
    sent: number,
    txs: BottomTransaction[]
}

interface IBottomProps {
    info: IAddressDetailInfo
}

const BottomView = ({ info }: IBottomProps) => {
    return (
        <div className='address-detail__bot'>
            <div className='address-detail__bot-info'>
                <div className='address-detail__bot-info-item'>
                    <span className='address-detail__bot-info-label'>Balance</span>
                    <span className='address-detail__bot-info-value'>{toBitcoins(info.balance)}</span>
                </div>
                <div className='address-detail__bot-info-item'>
                    <span className='address-detail__bot-info-label'>Transactions count</span>
                    <span className='address-detail__bot-info-value'>{info.txCount}</span>
                </div>
                <div className='address-detail__bot-info-item'>
                    <span className='address-detail__bot-info-label'>Total received</span>
                    <span className='address-detail__bot-info-value'>{toBitcoins(info.received)}</span>
                </div>
                <div className='address-detail__bot-info-item'>
                    <span className='address-detail__bot-info-label'>Total sent</span>
                    <span className='address-detail__bot-info-value'>{toBitcoins(info.sent)}</span>
                </div>
            </div>
            <div className='address-detail__bot-txs'>
                { info.txs.map(tx => <BottomTransactionView tx={tx} />) }
            </div>
        </div>
    )
}

function getAddressInfo(address: string): IAddressDetailInfo {
    return {
        balance: 18161861,
        txCount: 1180,
        received: 2240745028,
        sent: 2224103871,
        txs: [
            new BottomTransaction('96f4f76166b6f368ac6a9901446db7b27c057cb441f01589fe32b0d5d95f7cf7',
                4, 1694930749, 97261894, 8721, 'in')
        ]
    }
}

const AddressDetailView = () => {
    const address = useParams().addr

    if (!address) {
        return <></>
    }

    const inf = getAddressInfo(address)

    return (
        <div className='address-detail-main'>
            <TopView str={address}/>
            <BottomView info={inf}/>
        </div>
    )
}