import { PropsWithChildren, useRef, useState } from 'react'
import { observable, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'


const StyledModal = styled.div`
    width: 100%;
    height: 100%;

    background-color: rgba(255, 255, 255, 0.8);

    position: absolute;
    top: 0;
    left: 0;

    display: flex;
    justify-content: center;
`


export class Modal {
    constructor(public isShowed: boolean = false) {
        makeObservable(this, {
            isShowed: observable,
            show: action,
            hide: action
        })
    }
    show() {
        this.isShowed = true
    }
    hide() {
        this.isShowed = false
    }
}

interface IModalContextProps extends PropsWithChildren {
    modal: Modal
}

export const ModalView = observer(({ modal, children }: IModalContextProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [mouseDownElement, setMouseDownElement] = useState<EventTarget>()

    window.addEventListener('keydown', ev => {
        if (ev.key == 'Escape') {
            modal.hide()
        }
    })

    return (
        <>
            { modal.isShowed && <StyledModal
                ref={ref}
                onMouseDown={ev => { setMouseDownElement(ev.target) }}
                onMouseUp={ev => { if (ev.button == 0 && ev.target === ref.current && ref.current === mouseDownElement) { modal.hide() } }}
            >
                { children }
            </StyledModal> }
        </>
    )
})
