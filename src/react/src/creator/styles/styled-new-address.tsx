import styled, { css } from 'styled-components'

import { StyledContinueButton as GlobalContinueButton } from '../../core/components/ContinueButton'
import { Item } from './styled-modal'
export { Item, Label, GeneralInput } from './styled-modal'


export const NewAddress = styled.div`
    border-radius: 20px;
    background: #F2F2F2;
    margin-top: 17%;
    justify-content: space-between;
`
export const Switcher = styled.div`
    width: 144px;
    height: 25px;

    border: none;
    border-radius: 20px;
    background: #FFF;

    display: flex;
    flex-shrink: 0;
`
export const SwitcherOption = styled.div<{ $side: 'left' | 'right' }>`
    position: relative;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-grow: 1;

    user-select: none;

    &:hover {
        cursor: pointer;
    }
    & span {
        font-weight: 500;
        font-size: 14px;
        color: #404040;

        z-index: 2;
    }
    &:after {
        content: '';

        position: absolute;
        top: 0;
        width: 0;
        height: 100%;

        background-color: #DFDFDF;
        border: none;
        ${props => css`
            ${props.$side == 'left' ? 'right' : 'left'}: 0;
            border-top-${props.$side}-radius: 20px;
            border-bottom-${props.$side}-radius: 20px;
        `}

        transition: width .35s;
        z-index: 1;
    }
    &.selected::after {
        width: 100%;
    }
`
export const Top = styled.div`
    width: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
`
export const Select = styled.select`
    width: 84px;
    height: 36px;

    border: none;
    border-radius: 19px;
    background-color: #FFF;
    text-align: center;
    outline: none;
    user-select: none;

    color: #404040;
    font-size: 17px;
    font-weight: 500;

    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;

    &:hover {
        cursor: pointer;
    }
`
export const ContinueButton = () => <GlobalContinueButton $width='107px' $height='36px' />

export const Create = styled(NewAddress)`
    width: 664px;
    height: 193px;
    padding: 22px 55px 18px 55px;

    display: flex;
    flex-direction: column;
    align-items: center;
`
export const CreateName = styled(Item)`
    width: 100%;
`
export const CreateBottom = styled.div`
    width: 100%;

    display: flex;
    justify-content: space-between;
`

export const Import = styled(NewAddress)`
    width: 664px;
    height: 229px;
    padding: 22px 55px 18px 55px;

    display: flex;
    flex-direction: column;
    align-items: center;
`
export const ImportKey = styled(Item)`
    width: 100%;
`
export const ImportBottom = styled.div`
    width: 100%;

    display: flex;
    flex-direction: column;
    align-items: center;
`
export const ImportSelectItems = styled.div`
    width: 100%;

    display: flex;
    justify-content: space-between;
`