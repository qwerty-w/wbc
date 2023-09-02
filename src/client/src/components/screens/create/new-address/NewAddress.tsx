import './NewAddress.css'
import { useState, useEffect, useRef } from "react";
import { Modal } from '../../common/modal/modal'


export { type INewAddressState, NewAddress }

interface INewAddressState {
    currentWindow: "create" | "import",
    setCurrentWindow: React.Dispatch<React.SetStateAction<"create" | "import">>,
    animatedSwitcher: boolean
}

interface NewAddressOptionProps {
    state: INewAddressState
}

function TypeSelector() {
    return (
        <select className='new-addr__type-selector'>
            <option value="P2PKH">P2PKH</option>
            <option value="P2SH">P2SH</option>
            <option value="P2WPKH">P2WPKH</option>
            <option value="P2WSH">P2WSH</option>
        </select>
    )
}

function KeyFormatSelector() {
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

function Switcher({ switchTo, animation = true, createOnClick, importOnClick }: ISwitcherProps) {
    const createRef = useRef<HTMLDivElement>(null)
    const importRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        (async function toggle() {
            let refs = [createRef, importRef];
            const [cur, nxt] = switchTo == 'create' ? refs.reverse() : refs;

            if (animation) {
                await new Promise((resolve) => { setTimeout(resolve, 10) });
            }

            cur.current?.classList.remove('selected');
            nxt.current?.classList.add('selected');
        })()
    })

    return (
        <div className='new-addr__switcher'>
            <div className={`new-addr__switcher-option new-addr__switcher-create-option ${switchTo == 'import' ? 'selected' : ''}`} ref={createRef} onClick={createOnClick}><span>Create</span></div>
            <div className={`new-addr__switcher-option new-addr__switcher-import-option ${switchTo == 'create' ? 'selected' : ''}`} ref={importRef} onClick={importOnClick}><span>Import</span></div>
        </div>
    )
}

function CreateAddress({ state }: NewAddressOptionProps) {
    return (
        <div className="create-addr new-addr">
            <Switcher animation={state.animatedSwitcher} switchTo='create' importOnClick={() => { state.setCurrentWindow('import') }} />
            <div className='create-addr__name new-addr__item'>
                <input className='new-addr__main-inp' id='create-addr__name-inp' type="text" />
                <span className='new-addr__label'>Name</span>
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

function ImportAddress({ state }: NewAddressOptionProps) {
    return (
        <div className="import-addr new-addr">
            <div className='new-addr__switcher'>
                <Switcher switchTo='import' createOnClick={() => { state.setCurrentWindow('create') }} />
            </div>
            <div className='import-addr__key new-addr__item'>
                <input className='new-addr__main-inp' id="import-addr__key-inp" type="text" />
                <span className='new-addr__label'>Key</span>
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

interface INewAddressProps {
    setVisibility: React.Dispatch<React.SetStateAction<boolean>>
}

function NewAddress({ setVisibility }: INewAddressProps) {
    const [currentWindow, setCurrentWindow] = useState<'create' | 'import'>('create')
    const [firstOpen, setFirstOpen] = useState(true)
    const state = { currentWindow: currentWindow, setCurrentWindow: setCurrentWindow, animatedSwitcher: !firstOpen }
    useEffect(() => setFirstOpen(false), [])  // after mount

    return (
        <Modal setVisibility={setVisibility}>
            { currentWindow == 'create' ? <CreateAddress state={state} /> : <ImportAddress state={state}/> }
        </Modal>
    )
}
