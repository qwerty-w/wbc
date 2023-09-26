import styled from 'styled-components'
export { StyledContinueButton as ContinueButton } from '../../../common/screen'


export const Creator = styled.div`
    min-width: 380px;
    width: 410px;
    height: 476px;
    border-radius: 20px;
    background: #FFF;
    display: flex;
    flex-direction: column;
`
export const VerticalLine = styled.div`
    width: 1px;
    margin: 5px 8px;
    background-color: #F2F2F2;
`
export const HorizontalLine = styled.div`
    height: 1px;
    margin: 0px 13px;
    background-color: #F2F2F2;
`
export const Top = styled.div`
    flex-basis: 352px;
    display: flex;
    padding: 7px 8px;
`
export const TopSide = styled.div`
    width: 50%;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 7px;
`
export const TopSideLabel = styled.span`
    font-size: 12px;
    font-weight: 400;
`
export const ioItems = styled.div`
    width: 100%;

    display: flex;
    flex-direction: column;
    gap: 7px;
`
export const ioItem = styled.div`
    position: relative;
    height: 58px;
    padding-top: 12px;
    padding-bottom: 13px;
    background-color: #F2F2F2;
    border-radius: 20px;

    display: flex;
    flex-direction: column;
    align-items: center;

    &::before {
        content: "";

        position: absolute;
        top: 10px;
        right: 10px;
        width: 7px;
        height: 7px;

        background-image: url("/icons/external-link.svg");
        background-size: contain;
        cursor: pointer;
    }
`
export const ioID = styled.span<{ $label?: boolean }>`
    color: ${props => props.$label ? '#999' : '#ED9B60'};
    font-size: 12px;
    font-weight: 400;
`
export const ioAmount = styled.span`
    font-size: 14px;
    font-weight: 500;

    &::after {
        content: ' BTC';
    }
`
export const Input = styled(ioItem)`
    ${ioAmount}::before {
        content: '+';
    }
`
export const Output = styled(ioItem)`
    ${ioAmount}::before {
        content: '-';
    }
`
export const BottomBlock = styled.div`
    flex-grow: 1;
    padding: 18px 25px;
`
export const Bottom = styled.div<{ $segwit?: boolean }>`
    position: relative;
    height: 100%;
    padding: 11px 22px;

    background-color: #F2F2F2;
    border-radius: 20px;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    &::before {
        content: "";

        position: absolute;
        width: ${props => props.$segwit ? '8px' : '10px'};
        height: ${props => props.$segwit ? '10px' : '10px'};
        background-image: url("/icons/segwit-${props => props.$segwit ? 'lock' : 'unlock'}.svg");
        right: 12px;
        bottom: 7px;
        background-size: contain;
    }

    & input {
        width: 60px;
        border: 0px;
        border-radius: 20px;
        text-align: center;
        font-weight: 500;

        outline: none;
        appearance: none;
        -moz-appearance: textfield;
    }
    & input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
`
export const BottomRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
`
export const BottomItem = styled.div`
    height: 100%;

    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
`
export const BottomLabel = styled.span`
    font-size: 9px;
    font-weight: 400;
`
export const BottomCentralValue = styled.span`
    width: 128px;
    font-size: 16px;
    font-weight: 500;
    text-align: center;
`