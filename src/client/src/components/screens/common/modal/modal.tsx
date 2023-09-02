import './modal.css'
import { PropsWithChildren, useRef } from 'react'

export { Modal }


interface ModalProps extends PropsWithChildren {
    setVisibility: React.Dispatch<React.SetStateAction<boolean>>
}

function Modal({ setVisibility, children }: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null)
    return (
        <div className="modal" ref={modalRef} onClick={ev => { if (ev.target === modalRef.current) { setVisibility(false) } }}>
            { children }
        </div>
    )
}
