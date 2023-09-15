import './NewOutput.css'
import { useContext, useState, useEffect } from 'react'
import { observable, action, makeObservable } from 'mobx'
import { Modal, ModalView } from '../../common/modal/modal'
import { toSatoshis, FiltredInput, FiltredInputView, BTCamountInputView } from '../../../../utils'
import { GlobalStore } from '../Create'
import { Output } from '../crt/Creator'
import { observer } from 'mobx-react-lite'

export { NewOutputModal, NewOutputModalView }


class NewOutputModal extends Modal {
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

const NewOutputModalView = observer(() => {
    const { creator, modals: { newout } } = useContext(GlobalStore)
    const [continueDisabled, setContinueDisabled] = useState(true)
    
    const [address] = useState(new FiltredInput((pos, value) => { return { pos, value } }))
    const [amount] = useState(new FiltredInput((pos, value) => { return { pos, value } }, undefined, '0'))

    useEffect(() => { setContinueDisabled(address.value === '') }, [address.value])
    useEffect(() => { address.setInvalid(false); amount.setInvalid(false) }, [newout.isShowed])

    const onContinue = () => {
        const [addr, am] = [address.value, toSatoshis(Number(amount.value))]
        address.setInvalid(addr === '' || !addr.split('').every(char => '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.includes(char)))
        amount.setInvalid(am <= 0 || Number.isNaN(am) || am > creator.remainder)

        if (address.isInvalid || amount.isInvalid) {
            return 
        }

        creator.outs.add(new Output(addr, am))
        newout.setShowed(false)
    }

    return (
        <ModalView modal={newout}>
            <div className='new-out'>
                <div className='new-out__addr new-out__item'>
                    <FiltredInputView inp={address} />
                    <span className='new-out__item-label'>Address</span>
                </div>
                <div className='new-out__bot'>
                    <div className='new-out__amount new-out__item'>
                        <BTCamountInputView inp={amount} />
                        <span className='new-out__item-label'>Amount</span>
                    </div>
                    <button className={`new-out__continue${continueDisabled ? ' disabled' : ''}`} disabled={continueDisabled} onClick={onContinue}>Continue</button>
                </div>
            </div>
        </ModalView>
    )
})