import { ReactNode } from 'react'
import styled, { css } from 'styled-components'


export const StyledContinueButton = styled.button.attrs<{ 
    $width: string,
    $height: string,
    $borderRadius?: string,
    $fontSize?: string,
    $text?: string,
}>(props => {
    return { children: props.$text || 'Continue' }
})`
    ${props => css`
        width: ${props.$width};
        height: ${props.$height};
        border-radius: ${props.$borderRadius || '20px'};
        font-size: ${props.$fontSize || '14px'};
    `}

    border: none;
    background-color: #ED9B60;
    color: #FFF;

    &:hover {
        cursor: pointer;
        background-color: #E5965D;
    }
    &:disabled {
        cursor: default;
        opacity: .3;
    }
`
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
