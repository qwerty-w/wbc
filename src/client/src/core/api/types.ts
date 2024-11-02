
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

export interface TransactionInput {
    txid: string
    vout: number
    amount: number
    is_segwit: boolean
    is_coinbase: boolean
    script: string
    witness: string
}

export interface TransactionOutput {
    pkscript: string,
    amount: number,
    address?: string
}

export interface Transaction {
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
    inputs: Array<TransactionInput>
    outputs: Array<TransactionOutput>
}

export interface Unspent {
    txid: string
    vout: number
    amount: number
    address: string
}

export interface TransactionUnspent {
    transaction: Transaction,
    unspent: Array<Unspent>
}