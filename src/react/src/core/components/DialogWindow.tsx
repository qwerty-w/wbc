import styled from 'styled-components'
import { FilteredTextInput } from './TextInput'


export const StyledLabel = styled.span`
    font-size: 13px;
    font-weight: 500;
    color: #999;
`
export const StyledItem = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
export const StyledTextInput = styled.input.attrs({
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


interface IDialogWindowProps {
    label: string
    children: React.ReactNode
}


export const DialogWindow = ({ label, children }: IDialogWindowProps) => {
    return (
        <div>
            <Label>{ label }</Label>
            { children }
        </div>
    )
}


export const DialogWindowItemView = ({ label, children }: IDialogWindowProps) => {
    return (
        <Item>
            <Label>{ label }</Label>
            { children }
        </Item>
    )
}
