import styled from 'styled-components'


export const Label = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: #999;
`
export const Item = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
export const GeneralInput = styled.input.attrs({
    type: 'text'
})`
    width: 100%;
    height: 40px;
    padding: 0px 6px;

    background-color: #FFF;
    text-align: center;
    font-size: 20px;
    font-weight: 600;

    outline: none;
    border: none;
    border-radius: 20px;
`