import { useContext, useState, useEffect, useRef } from 'react'
import { observable, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'

import { isBase58String, removeChar, toSatoshis } from '../../core/utils/utils'
import { BitcoinAmountTextInputView, FilteredTextInputView, useFiltredTextInputRef } from '../../core/components/TextInput'
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
    const addressRef = useFiltredTextInputRef()
    const amountRef = useFiltredTextInputRef()

    useEffect(() => {
        var disabled = false
        if (addressRef.current?.value == '') disabled = true
        if (!amountRef.current || Number(amountRef.current.value) == 0) disabled = true
        setContinueDisabled(disabled)
    }, [addressRef.current?.value, amountRef.current?.value])
    useEffect(() => { addressRef.current?.setInvalid(false); amountRef.current?.setInvalid(false) }, [newout.isShowed])

    const onContinue = () => {
        const [address, amount] = [addressRef.current?.value, toSatoshis(Number(amountRef.current?.value))]
        if (!address || !amount) return
        addressRef.current?.setInvalid(!isBase58String(address))
        amountRef.current?.setInvalid(amount <= 0 || Number.isNaN(amount) || amount > creator.remainder)

        if (addressRef.current?.invalid || amountRef.current?.invalid) return
        creator.outs.add(new Output(address, amount))
        newout.hide()
    }

    return (
        <ModalView modal={newout} onEnter={onContinue}>
            <StyledNewOutput>
                <StyledAddress>
                    <FilteredTextInputView inputRef={addressRef}/>
                    <styledModal.Label>Address</styledModal.Label>
                </StyledAddress>
                <StyledBottom>
                    <StyledAmount>
                        <BitcoinAmountTextInputView inputRef={amountRef}/>
                        <styledModal.Label>Amount</styledModal.Label>
                    </StyledAmount>
                    <StyledContinueButton $width='107px' $height='40px' disabled={continueDisabled} onClick={onContinue} />
                </StyledBottom>
            </StyledNewOutput>
        </ModalView>
    )
})