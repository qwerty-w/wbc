import './NewOutput.css'
import { createContext, useContext, useState, useEffect } from 'react'
import { ModalShowType, Modal } from '../../common/modal/modal'
import { toSatoshis, FiltredInput, FiltredInputView, BTCamountInputView } from '../../../../utils'
import { GlobalStateContext } from '../Create'
import { Output } from '../crt/Creator'
import { observer } from 'mobx-react-lite'

export { NewOutputContext, NewOutputModal }

const NewOutputContext = createContext<ModalShowType>({ isShowed: false, setIsShowed: () => {} })

const NewOutputModal = observer(() => {
    const { isShowed, setIsShowed } = useContext(NewOutputContext)
    const creator = useContext(GlobalStateContext).creator
    const { outs } = creator

    const [continueDisabled, setContinueDisabled] = useState(true)
    
    const [address] = useState(new FiltredInput((pos, value) => { return { pos, value } }))
    const [amount] = useState(new FiltredInput((pos, value) => { return { pos, value } }, undefined, '0'))

    useEffect(() => { address.value === '' ? setContinueDisabled(true) : setContinueDisabled(false) }, [address.value])
    useEffect(() => { address.setInvalid(false); amount.setInvalid(false) }, [isShowed])

    const onContinue = () => {
        const [addr, am] = [address.value, toSatoshis(Number(amount.value))]
        address.setInvalid(addr === '' || !addr.split('').every(char => '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.includes(char)))
        amount.setInvalid(am <= 0 || Number.isNaN(am) || am > creator.remainder)

        if (address.isInvalid || amount.isInvalid) {
            return 
        }

        outs.add(new Output(addr, am))
        setIsShowed(false)
    }

    return (
        <Modal context={NewOutputContext}>
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
        </Modal>
    )
})