import { useContext, useEffect, useRef } from "react";
import { observable, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite';

import { Modal, ModalView } from '../../common/modal'
import { GlobalStore } from '../../create-transaction';
import * as styled from './styles/styled-new-address'


const TypeSelector = () => {
    return (
        <styled.Select>
            <option value="P2PKH">P2PKH</option>
            <option value="P2SH">P2SH</option>
            <option value="P2WPKH">P2WPKH</option>
            <option value="P2WSH">P2WSH</option>
        </styled.Select>
    )
}

const KeyFormatSelector = () => {
    return (
        <styled.Select>
            <option value="WIF">WIF</option>
            <option value="Hex">Hex</option>
            <option value="Base64">Base64</option>
            <option value="Base58">Base58</option>
        </styled.Select>
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
        <styled.Switcher>
            <styled.SwitcherOption className={`${switchTo === 'import' ? 'selected' : ''}`} $side="left" ref={createRef} onClick={createOnClick}><span>Create</span></styled.SwitcherOption>
            <styled.SwitcherOption className={`${switchTo === 'create' ? 'selected' : ''}`} $side="right" ref={importRef} onClick={importOnClick}><span>Import</span></styled.SwitcherOption>
        </styled.Switcher>
    )
}

export class NewAddressModal extends Modal {
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
        <styled.Create>
            <styled.Top>
                <Switcher animation={newaddr.animatedSwitcher} switchTo='create' importOnClick={() => { newaddr.setCurrentWindow('import') }} />
                <styled.CreateName>
                    <styled.GeneralInput />
                    <styled.Label>Name</styled.Label>
                </styled.CreateName>
            </styled.Top>
            <styled.CreateBottom>
                <styled.Item>
                    <TypeSelector />
                    <styled.Label>Type</styled.Label>
                </styled.Item>
                <styled.ContinueButton />
            </styled.CreateBottom>
        </styled.Create>
    )
}

const ImportAddress = ({ newaddr }: INewAddressModalWindowProps) => {
    return (
        <styled.Import>
            <styled.Top>
                <Switcher animation={newaddr.animatedSwitcher} switchTo='import' createOnClick={() => { newaddr.setCurrentWindow('create') }} />
                <styled.ImportKey>
                    <styled.GeneralInput />
                    <styled.Label>Key</styled.Label>
                </styled.ImportKey>
            </styled.Top>
            <styled.ImportBottom>
                <styled.ImportSelectItems>
                    <styled.Item>
                        <TypeSelector />
                        <styled.Label>Type</styled.Label>
                    </styled.Item>
                    <styled.Item>
                        <KeyFormatSelector />
                        <styled.Label>Format</styled.Label>
                    </styled.Item>
                </styled.ImportSelectItems>
                <styled.ContinueButton />
            </styled.ImportBottom>
        </styled.Import>
    )
}

export const NewAddressModalView = observer(() => {
    const { newaddr } = useContext(GlobalStore).modals
    useEffect(() => { newaddr.setAnimatedSwitcher(newaddr.isShowed) }, [newaddr.isShowed])  // no anim for first open

    return (
        <ModalView modal={newaddr}>
            { newaddr.currentWindow === 'create' ? <CreateAddress newaddr={newaddr} /> : <ImportAddress newaddr={newaddr} /> }
        </ModalView>
    )
})
