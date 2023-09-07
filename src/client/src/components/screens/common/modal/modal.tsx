import './modal.css'
import { PropsWithChildren, useRef, useState } from 'react'

export { Modal }


interface IModalProps extends PropsWithChildren {
    setVisibility: React.Dispatch<React.SetStateAction<boolean>>
}

function Modal({ setVisibility, children }: IModalProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [mouseDownElement, setMouseDownElement] = useState<EventTarget>()
    return (
        <div className="modal"
             ref={ref}
             onMouseDown={ev => { setMouseDownElement(ev.target) }}
             onMouseUp={ev => { if (ev.target === ref.current && ref.current === mouseDownElement) { setVisibility(false) } }}
        >
            { children }
        </div>
    )
}
