import './modal.css'
import { PropsWithChildren, useRef, useState } from 'react'

export { Modal }


interface IModalProps extends PropsWithChildren {
    isShowed: boolean,
    setIsShowed: React.Dispatch<React.SetStateAction<boolean>>
}

function Modal({ isShowed, setIsShowed, children }: IModalProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [mouseDownElement, setMouseDownElement] = useState<EventTarget>()
    return (
        <>
            { isShowed && <div className="modal"
                ref={ref}
                onMouseDown={ev => { setMouseDownElement(ev.target) }}
                onMouseUp={ev => { if (ev.button == 0 && ev.target === ref.current && ref.current === mouseDownElement) { setIsShowed(false) } }}
            >
                { children }
            </div> }
        </>
    )
}
