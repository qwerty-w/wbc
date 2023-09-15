import './NewOutput.css'
import { createContext, useContext, useState, useRef, useEffect } from 'react'
import { ModalShowType, Modal } from '../../common/modal/modal'
import { toSatoshis, BTCamountInput, IFiltredInputStateInstance, FiltredInput } from '../../../../utils'
import { GlobalStateContext } from '../Create'
import { Output } from '../crt/Creator'

export { NewOutputContext, NewOutputModal }

const NewOutputContext = createContext<ModalShowType>({ isShowed: false, setIsShowed: () => {} })

function NewOutputModal() {
    const { isShowed, setIsShowed } = useContext(NewOutputContext)
    const { outs } = useContext(GlobalStateContext).creator

    const [continueDisabled, setContinueDisabled] = useState(true)
    const [addressState, setAddressState] = useState<IFiltredInputStateInstance>({ currentValue: String(), isInvalid: false })
    const [amountState, setAmountState] = useState<IFiltredInputStateInstance>({ currentValue: String(), isInvalid: false })

    useEffect(() => {addressState.currentValue === '' ? setContinueDisabled(true) : setContinueDisabled(false) }, [addressState])
    useEffect(() => {setAddressState({ ...addressState, isInvalid: false }); setAmountState({ ...amountState, isInvalid: false })}, [isShowed])

    const onContinue = () => {
        const address = addressState.currentValue
        const amount = toSatoshis(Number(amountState.currentValue))
        var invalid = false

        if (amount <= 0 || Number.isNaN(amount)) {
            setAmountState({ ...amountState, isInvalid: true })
            invalid = true
        }
        else {
            setAmountState({ ...amountState, isInvalid: false })
        }
        if (address === '' || !address.split('').every(char => '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.includes(char))) {
            setAddressState({ ...addressState, isInvalid: true })
            invalid = true
        }
        else {
            setAddressState({ ...addressState, isInvalid: false })
        }
        if (!invalid) {
            outs.add(new Output(addressState.currentValue, amount))
            setIsShowed(false)
        }
    }

    return (
        <Modal context={NewOutputContext}>
            <div className='new-out'>
                <div className='new-out__addr new-out__item'>
                    <FiltredInput filter={(pos, value) => {
                        return { pos, value }
                    }} state={{ ins: addressState, set: setAddressState }}/>
                    <span className='new-out__item-label'>Address</span>
                </div>
                <div className='new-out__bot'>
                    <div className='new-out__amount new-out__item'>
                        <BTCamountInput state={{ ins: amountState, set: setAmountState }} defaultValue='0'/>
                        <span className='new-out__item-label'>Amount</span>
                    </div>
                    <button className={`new-out__continue${continueDisabled ? ' disabled' : ''}`} disabled={continueDisabled} onClick={onContinue}>Continue</button>
                </div>
            </div>
        </Modal>
    )
}