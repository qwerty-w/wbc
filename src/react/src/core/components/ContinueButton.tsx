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
