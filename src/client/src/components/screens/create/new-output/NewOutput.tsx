import './NewOutput.css'
import { createContext } from 'react'
import { ModalShowType, Modal } from '../../common/modal/modal'
import { BTCamountInput } from '../../../../utils'

export { NewOutputContext, NewOutputModal }

const NewOutputContext = createContext<ModalShowType>({ isShowed: false, setIsShowed: () => {} })

function NewOutputModal() {
    return (
        <Modal context={NewOutputContext}>
            <div className='new-out'>
                <div className='new-out__addr new-out__item'>
                    <input type='text' />
                    <span className='new-out__item-label'>Address</span>
                </div>
                <div className='new-out__bot'>
                    <div className='new-out__amount new-out__item'>
                        <BTCamountInput />
                        <span className='new-out__item-label'>Amount</span>
                    </div>
                    <button className='new-out__continue'>Continue</button>
                </div>
            </div>
        </Modal>
    )
}