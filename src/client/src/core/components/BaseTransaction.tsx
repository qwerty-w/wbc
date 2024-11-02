import { ReactNode } from 'react'
import styled, { css } from 'styled-components'
import * as apitypes from '../../core/api/types'
import { formatSatoshis, toBitcoins, wrapString } from '../../core/utils/Utils'


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


interface ITransactionFormattedValues {
    fee: string
    id: string
    inamount: string
    outamount: string
}

export class Transaction implements apitypes.Transaction {
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
        public inputs: Array<apitypes.TransactionInput>,
        public outputs: Array<apitypes.TransactionOutput>
    ) {
        this.formatted = {
            id: wrapString(this.id),
            inamount: String(toBitcoins(this.inamount)),
            outamount: String(toBitcoins(this.outamount)),
            fee: formatSatoshis(this.fee)
        }
    }
}


type TransactionDetailsLeftProps = {
    id: ReactNode,
    confs: ReactNode,
    date: ReactNode,
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
    left: ({ id, confs, date, fontSize, gap }: TransactionDetailsLeftProps) => {
        return (
            <StyledTransactionLeftDetails $fontSize={fontSize} $gap={gap}>
                <div>
                    <StyledTransactionDetailsItem $label>ID: </StyledTransactionDetailsItem>
                    <StyledTransactionDetailsItem>{id}</StyledTransactionDetailsItem>
                </div>
                <div>
                    <StyledTransactionDetailsItem $label>Confirmations: </StyledTransactionDetailsItem>
                    <StyledTransactionDetailsItem>{confs}</StyledTransactionDetailsItem>
                </div>
                <div>
                    <StyledTransactionDetailsItem $label>Date: </StyledTransactionDetailsItem>
                    <StyledTransactionDetailsItem>{date}</StyledTransactionDetailsItem>
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
