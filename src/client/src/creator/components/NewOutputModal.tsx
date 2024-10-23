import { useContext, useState, useEffect } from 'react'
import { observable, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'

import { toSatoshis } from '../../core/utils/Utils'
import { FiltredTextInput, FiltredTextInputView, BTCamountTextInputView } from '../../core/components/TextInput'
import { StyledContinueButton } from '../../core/components/ContinueButton'
import { Modal, ModalView } from '../../core/components/Modal'
import { GlobalStore } from '../TransactionCreator'
import { Output } from './Creator'
import * as styledModal from '../styles/styled-modal'


const StyledNewOutput = styled.div`
    width: 580px;
    height: 160px;
    margin-top: 17%;
    padding: 23px 48px;

    border-radius: 20px;
    background-color: #F2F2F2;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;

    & input {
        background-color: #FFF;
        text-align: center;
        font-size: 20px;
        font-weight: 600;

        outline: none;
        border: none;
        border-radius: 20px;
    }
`
const StyledAddress = styled(styledModal.Item)`
    width: 100%;

    & input {
        width: 100%;
        height: 40px;
    }
`
const StyledBottom = styled.div`
    width: 100%;

    display: flex;
    justify-content: space-between;
    align-items: center;
`
const StyledAmount = styled(styledModal.Item)`
    & input {
        width: 130px;
        height: 38px;
    }
`


export class NewOutputModal extends Modal {
    continueIsDisabled: boolean = true

    constructor() {
        super()
        makeObservable(this, {
            continueIsDisabled: observable,
            setContinueIsDisable: action
        })
    }
    setContinueIsDisable(val: boolean) {
        this.continueIsDisabled = val
    }
}

export const NewOutputModalView = observer(() => {
    const { creator, modals: { newout } } = useContext(GlobalStore)
    const [continueDisabled, setContinueDisabled] = useState(true)

    const [address] = useState(new FiltredTextInput((pos, value) => { return { pos, value } }))
    const [amount] = useState(new FiltredTextInput((pos, value) => { return { pos, value } }, undefined, '0'))

    useEffect(() => setContinueDisabled(address.value === ''), [address.value])
    useEffect(() => { address.setInvalid(false); amount.setInvalid(false) }, [newout.isShowed])

    const onContinue = () => {
        const [addr, am] = [address.value, toSatoshis(Number(amount.value))]
        address.setInvalid(addr === '' || !addr.split('').every(char => '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.includes(char)) || creator.outs.has(addr))
        amount.setInvalid(am <= 0 || Number.isNaN(am) || am > creator.remainder)

        if (address.isInvalid || amount.isInvalid) {
            return
        }

        creator.outs.add(new Output(addr, am))
        newout.hide()
    }

    return (
        <ModalView modal={newout} onEnter={onContinue} >
            <StyledNewOutput>
                <StyledAddress>
                    <FiltredTextInputView inp={address} />
                    <styledModal.Label>Address</styledModal.Label>
                </StyledAddress>
                <StyledBottom>
                    <StyledAmount>
                        <BTCamountTextInputView inp={amount} />
                        <styledModal.Label>Amount</styledModal.Label>
                    </StyledAmount>
                    <StyledContinueButton $width='107px' $height='40px' disabled={continueDisabled} onClick={onContinue} />
                </StyledBottom>
            </StyledNewOutput>
        </ModalView>
    )
})