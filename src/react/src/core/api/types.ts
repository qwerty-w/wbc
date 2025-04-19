
export enum NetworkType {
    mainnet,
    testnet
}

export interface AddressDetail {
    address: string
    received: number
    spent: number
    tx_count: number
    network: NetworkType,
    balance: number
}

export interface ITransactionInput {
    txid: string
    vout: number
    amount: number
    is_segwit: boolean
    is_coinbase: boolean
    script: string
    witness: string
}

export interface ITransactionOutput {
    pkscript: string,
    amount: number,
    address?: string
}

export interface ITransaction {
    id: string,
    inamount: number
    outamount: number
    incount: number
    outcount: number
    version: number
    locktime: number
    size: number
    vsize: number
    weight: number
    is_segwit: boolean
    is_coinbase: boolean
    fee: number
    blockheight: number
    inputs: Array<ITransactionInput>
    outputs: Array<ITransactionOutput>
}

export interface IUnspent {
    txid: string
    vout: number
    amount: number
    address: string
}

export interface ITransactionUnspent {
    transaction: ITransaction,
    unspent: Array<IUnspent>
}