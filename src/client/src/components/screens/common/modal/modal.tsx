import './modal.css'
import { PropsWithChildren, useRef, useState, useContext } from 'react'
import { observable, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'

export { Modal, ModalView }


class Modal {
    constructor(public isShowed: boolean = false) {
        makeObservable(this, {
            isShowed: observable,
            setShowed: action
        })
    }
    setShowed(val: boolean) {
        this.isShowed = val
    }
}

interface IModalContextProps extends PropsWithChildren {
    modal: Modal
}

const ModalView = observer(({ modal, children }: IModalContextProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [mouseDownElement, setMouseDownElement] = useState<EventTarget>()

    window.addEventListener('keydown', ev => {
        if (ev.key == 'Escape') {
            modal.setShowed(false)
        }
    })

    return (
        <>
            { modal.isShowed && <div className="modal"
                ref={ref}
                onMouseDown={ev => { setMouseDownElement(ev.target) }}
                onMouseUp={ev => { if (ev.button == 0 && ev.target === ref.current && ref.current === mouseDownElement) { modal.setShowed(false) } }}
            >
                { children }
            </div> }
        </>
    )
})
