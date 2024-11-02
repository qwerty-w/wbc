import * as types from "./types";
import { createClient } from "./client";


const client = createClient('/explorer')


export const getHeadBlock = async (): Promise<number> => {
    return (await client.get<{ blockheight: number }>('/head')).data.blockheight
}

export const getAddress = async (address: string): Promise<types.AddressDetail> => {
    return (await client.get(`/address/${address}`)).data
}

export const getAddressTransactions = async (
    address: string,
    params: {
        length?: number,
        offset?: number,
        last_seen_txid?: string
    } = {}

): Promise<Array<types.Transaction>> => {
    return (await client.get(`/address/${address}/transactions`, {
        params
    })).data
}

export const getAddressUnspent = async (address: string): Promise<Array<types.TransactionUnspent>> => {
    return (await client.get<Array<types.TransactionUnspent>>(`/address/${address}/unspent`, {
        params: {
            include_transaction: true,
            // cached: ?
        }
    })).data
}

export const getTransaction = async (txid: string): Promise<types.Transaction> => {
    return (await client.get<types.Transaction>(`/transaction/${txid}`, {
        params: {
            detail: true,
            cached: true
        }
    })).data
}

export const pushTransaction = async (serialized: string): Promise<types.Transaction> => {
    return (await client.post<types.Transaction>('/transaction', { serialized })).data
}