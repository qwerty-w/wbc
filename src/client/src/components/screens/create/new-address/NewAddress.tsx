import './NewAddress.css'
import { useContext, useEffect, useRef } from "react";
import { observable, action, makeObservable } from 'mobx'
import { Modal, ModalView } from '../../common/modal/modal'
import { observer } from 'mobx-react-lite';
import { GlobalStore } from '../Create';


export { NewAddressModal, NewAddressModalView }


const TypeSelector = () => {
    return (
        <select className='new-addr__type-selector'>
            <option value="P2PKH">P2PKH</option>
            <option value="P2SH">P2SH</option>
            <option value="P2WPKH">P2WPKH</option>
            <option value="P2WSH">P2WSH</option>
        </select>
    )
}

const KeyFormatSelector = () => {
    return (
        <select className='import-addr__format-selector'>
            <option value="WIF">WIF</option>
            <option value="Hex">Hex</option>
            <option value="Base64">Base64</option>
            <option value="Base58">Base58</option>
        </select>
    )
}

interface ISwitcherProps {
    switchTo: 'create' | 'import',
    animation?: boolean,
    createOnClick?: (ev: React.MouseEvent) => void,
    importOnClick?: (ev: React.MouseEvent) => void,
}

const Switcher = ({ switchTo, animation = true, createOnClick, importOnClick }: ISwitcherProps) => {
    const createRef = useRef<HTMLDivElement>(null)
    const importRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        (async function toggle() {
            let refs = [createRef, importRef];
            const [cur, nxt] = switchTo === 'create' ? refs.reverse() : refs;

            if (animation) {
                await new Promise((resolve) => { setTimeout(resolve, 10) });
            }

            cur.current?.classList.remove('selected');
            nxt.current?.classList.add('selected');
        })()
    })

    return (
        <div className='new-addr__switcher'>
            <div className={`new-addr__switcher-option new-addr__switcher-create-option ${switchTo === 'import' ? 'selected' : ''}`} ref={createRef} onClick={createOnClick}><span>Create</span></div>
            <div className={`new-addr__switcher-option new-addr__switcher-import-option ${switchTo === 'create' ? 'selected' : ''}`} ref={importRef} onClick={importOnClick}><span>Import</span></div>
        </div>
    )
}

class NewAddressModal extends Modal {
    currentWindow: 'create' | 'import' = 'create'
    animatedSwitcher: boolean = false

    constructor() {
        super()
        makeObservable(this, {
            currentWindow: observable,
            animatedSwitcher: observable,
            setCurrentWindow: action,
            setAnimatedSwitcher: action,
        })
    }
    setCurrentWindow(window: 'create' | 'import') {
        this.currentWindow = window
    }
    setAnimatedSwitcher(val: boolean) {
        this.animatedSwitcher = val
    }
}

interface INewAddressModalWindowProps {
    newaddr: NewAddressModal
}

const CreateAddress = ({ newaddr }: INewAddressModalWindowProps) => {
    return (
        <div className="create-addr new-addr">
            <div className='new-addr__top'>
                <Switcher animation={newaddr.animatedSwitcher} switchTo='create' importOnClick={() => { newaddr.setCurrentWindow('import') }} />
                <div className='create-addr__name new-addr__item'>
                    <input className='new-addr__main-inp' id='create-addr__name-inp' type="text" />
                    <span className='new-addr__label'>Name</span>
                </div>
            </div>
            <div className='create-addr__bottom'>
                <div className='create-addr__type new-addr__item'>
                    <TypeSelector/>
                    <div className='new-addr__label'>Type</div>
                </div>
                <button className='new-addr__continue' id='create-addr__continue'>Continue</button>
            </div>
        </div>
    )
}

const ImportAddress = ({ newaddr }: INewAddressModalWindowProps) => {
    return (
        <div className="import-addr new-addr">
            <div className='new-addr__top'>
                <div className='new-addr__switcher'>
                    <Switcher animation={newaddr.animatedSwitcher} switchTo='import' createOnClick={() => { newaddr.setCurrentWindow('create') }} />
                </div>
                <div className='import-addr__key new-addr__item'>
                    <input className='new-addr__main-inp' id="import-addr__key-inp" type="text" />
                    <span className='new-addr__label'>Key</span>
                </div>
            </div>
            <div className='import-addr__bottom'>
                <div className='import-addr__tf'>
                    <div className='new-addr__item'>
                        <TypeSelector/>
                        <span className='new-addr__label'>Type</span>
                    </div>
                    <div className='new-addr__item'>
                        <KeyFormatSelector/>
                        <span className='new-addr__label'>Format</span>
                    </div>
                </div>
                <button className='new-addr__continue' id='import-addr__continue'>Continue</button>
            </div>
        </div>
    )
}

const NewAddressModalView = observer(() => {
    const { newaddr } = useContext(GlobalStore).modals
    useEffect(() => { newaddr.setAnimatedSwitcher(newaddr.isShowed) }, [newaddr.isShowed])  // no anim for first open

    return (
        <ModalView modal={newaddr}>
            { newaddr.currentWindow === 'create' ? <CreateAddress newaddr={newaddr} /> : <ImportAddress newaddr={newaddr} /> }
        </ModalView>
    )
})
