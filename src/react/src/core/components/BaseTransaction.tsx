import { ReactNode } from 'react'
import styled, { css } from 'styled-components'
import { computed, makeObservable } from 'mobx'

import * as apitypes from '../api/types'
import { HeadBlock, head as Head } from '../lib/headblock'
import { formatSatoshis, toBitcoins, wrapString } from '../utils/utils'


const StyledTransactionDetailsItem = styled.span<{ $label?: boolean }>`
    color: ${props => props.$label ? '#999' : '#ed9b60'};
`
const StyledTransactionDetailsAmount = styled.span`
    font-weight: 500;

    &::after {
        content: " BTC";
    }
`
const StyledTransactionDetailsFee = styled.span<{ $label?: boolean }>`
    color: ${props => props.$label ? '#999' : 'unset'};

    ${props => !props.$label ? css`
        &::after {
            content: " Sats"
        }
    ` : ''}
`
const StyledTransactionSideDetails = styled.div<{ $gap?: string }>`
    display: flex;
    flex-direction: column;
    gap: ${props => props.$gap || 'unset'};
    flex-shrink: 0;
`
const StyledTransactionLeftDetails = styled(StyledTransactionSideDetails)<{ $fontSize?: string }>`
    color: #999;
    font-size: ${props => props.$fontSize || '13px'};
`
const StyleTransactionRightDetails = styled(StyledTransactionSideDetails)<{ $amountFontSize?: string, $feeFontSize?: string }>`
    text-align: end;

    ${StyledTransactionDetailsAmount} {
        font-size: ${props => props.$amountFontSize || '14px'};
    }
    ${StyledTransactionDetailsFee} {
        font-size: ${props => props.$feeFontSize || '14px'};
    }
`

type TransactionDetailsLeftProps = {
    id: ReactNode,
    confirmations: ReactNode,
    fontSize?: string,
    gap?: string
}
type TransactionDetailsRightProps = {
    amount: ReactNode,
    fee: ReactNode,
    amountFontSize?: string,
    feeFontSize?: string,
    gap?: string
}

export const TransactionInfoView = {
    left: ({ id, confirmations, fontSize, gap }: TransactionDetailsLeftProps) => {
        return (
            <StyledTransactionLeftDetails $fontSize={fontSize} $gap={gap}>
                <div>
                    <StyledTransactionDetailsItem $label>ID: </StyledTransactionDetailsItem>
                    <StyledTransactionDetailsItem>{id}</StyledTransactionDetailsItem>
                </div>
                <div>
                    <StyledTransactionDetailsItem $label>Confirmations: </StyledTransactionDetailsItem>
                    <StyledTransactionDetailsItem>{confirmations}</StyledTransactionDetailsItem>
                </div>
                <div>
                    <StyledTransactionDetailsItem $label>Date: </StyledTransactionDetailsItem>
                    <StyledTransactionDetailsItem>27 Feb 2024, 17:49.01</StyledTransactionDetailsItem>
                </div>
            </StyledTransactionLeftDetails>
        )
    },
    right: ({ amount, fee, amountFontSize, feeFontSize, gap }: TransactionDetailsRightProps) => {
        return (
            <StyleTransactionRightDetails $amountFontSize={amountFontSize} $feeFontSize={feeFontSize} $gap={gap}>
                <StyledTransactionDetailsAmount>{amount}</StyledTransactionDetailsAmount>
                <div>
                    <StyledTransactionDetailsFee $label>Fee </StyledTransactionDetailsFee>
                    <StyledTransactionDetailsFee>{fee}</StyledTransactionDetailsFee>
                </div>
            </StyleTransactionRightDetails>
        )
    }
}


export type AddressTransactionDirection = 'in' | 'out'
interface ITransactionFormattedValues {
    fee: string
    id: string
    inamount: string
    outamount: string
}

export class Transaction implements apitypes.ITransaction {
    public formatted: ITransactionFormattedValues

    constructor(
        public id: string,
        public inamount: number,
        public outamount: number,
        public incount: number,
        public outcount: number,
        public version: number,
        public locktime: number,
        public size: number,
        public vsize: number,
        public weight: number,
        public is_segwit: boolean,
        public is_coinbase: boolean,
        public fee: number,
        public blockheight: number,
        public inputs: Array<apitypes.ITransactionInput>,
        public outputs: Array<apitypes.ITransactionOutput>,
        public head: HeadBlock = Head
    ) {
        this.formatted = {
            id: wrapString(this.id),
            inamount: String(toBitcoins(this.inamount)),
            outamount: String(toBitcoins(this.outamount)),
            fee: formatSatoshis(this.fee)
        }
        makeObservable(this, {
            confirmations: computed
        })
    }

    static fromObject(tx: apitypes.ITransaction): Transaction {
        // @ts-ignore
        return new Transaction(...Object.values(tx))
    }

    get confirmations(): number {
        return this.head.height == -1 || this.blockheight == -1 ? -1 : this.head.height - this.blockheight
    }

    getDirection(address: string): AddressTransactionDirection {
        return 'in' // todo:
    }
}
