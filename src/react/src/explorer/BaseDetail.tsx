import { ReactElement, ReactNode } from "react"
import styled, { WebTarget } from 'styled-components'

import { setClipboard } from "../core/utils/utils"


const StyledDetail = styled.div`
    width: 100%;
    height: 100%;
    padding-top: 10%;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 43px;
`
const StyledTop = styled.div`
    display: flex;
    flex-direction: column;
    gap: 9px;
`
const StyledString = styled.div`
    width: 1040px;
    height: 99px;
    background-color: #fff;
    border-radius: 32px;

    display: flex;
    justify-content: center;
    align-items: center;
`
const StyledStringSpan = styled.div<{ $size?: string }>`
    color: #ED9B60;
    font-size: ${props => props.$size || '36px'};
    font-weight: 800;
`
const StyledOptions = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 0px 20px;
`
const StyledRightLeftOptions = styled.div`
    display: flex;
    gap: 11px;
`
const StyledBottom = styled.div`
    width: 1040px;
    height: 483px;
    background-color: #fff;
    border-radius: 32px;

    display: flex;
    justify-content: center;
    align-items: center;
`
export const StyledOption = styled.div<{ $width: string, $height: string, $borderRadius: string }>`
    width: ${props => props.$width};
    height: ${props => props.$height};
    background-color: #fff;
    border-radius: ${props => props.$borderRadius};

    display: flex;
    justify-content: center;
    align-items: center;
`
export const StyledOptionButton = styled(StyledOption)`
    &:hover {
        background-color: #fbfbfb;
        cursor: pointer;
    }
    &:active {
        background-color: #f9f9f9;
        transform: scale(0.97);
    }
`
export const StyledInfo = styled.div`
    background-color: #f2f2f2;

    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
`
export const StyledInfoItem = styled.div`
    width: 100%;
    height: 100%;
    padding-top: 10px;
    padding-left: 15px;
    background-color: #fff;

    display: flex;
    flex-direction: column;
`
export const StyledInfoLabel = styled.span`
    color: rgba(64, 64, 64, 0.70);
    font-size: 14px;
    font-weight: 500;
`
export const StyledInfoValue = styled.span`
    font-size: 31px;
    font-weight: 500;
`


interface IInfoItemViewProps {
    label: ReactNode,
    value: ReactNode,
    asStyledItem?: WebTarget,
    asStyledLabel?: WebTarget,
    asStyledValue?: WebTarget
}

export const InfoItemView = ( props: IInfoItemViewProps ) => {
    return (
        <StyledInfoItem as={ props.asStyledItem }>
            <StyledInfoLabel as={ props.asStyledLabel }>{ props.label }</StyledInfoLabel>
            <StyledInfoValue as={ props.asStyledValue }>{ props.value }</StyledInfoValue>
        </StyledInfoItem>
    )
}

export const QrButton = ({ data }: { data: string }) => {
    return (
        <StyledOptionButton $width='46px' $height='33px' $borderRadius='9px' onClick={() => {}}>
            <img src="/icons/qr-code.svg" alt="qr" />
        </StyledOptionButton>
    )
}

export const CopyButton = ({ string }: { string: string }) => {  // todo: add popup
    return (
        <StyledOptionButton $width='46px' $height='33px' $borderRadius='9px' onClick={() => { setClipboard(string) }}>
            <img src="/icons/copy.svg" alt="copy" />
        </StyledOptionButton>
    )
}

interface IDetailViewProps {
    string: ReactElement<HTMLSpanElement> | string,
    stringFontSize?: string,
    options: { left: ReactNode, right: ReactNode }
    bottom: ReactNode
}

export const DetailView = ({ string, stringFontSize, options, bottom }: IDetailViewProps) => {
    return (
        <StyledDetail>
            <StyledTop>
                <StyledString>
                    <StyledStringSpan $size={ stringFontSize }>{ string }</StyledStringSpan>
                </StyledString>
                <StyledOptions>
                    <StyledRightLeftOptions>{ options.left }</StyledRightLeftOptions>
                    <StyledRightLeftOptions>{ options.right }</StyledRightLeftOptions>
                </StyledOptions>
            </StyledTop>
            <StyledBottom>
                { bottom }
            </StyledBottom>
        </StyledDetail>
    )
}