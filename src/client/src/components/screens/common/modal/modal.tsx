import './modal.css'
import { PropsWithChildren, useRef, useState, useContext } from 'react'

export { type ModalShowType, ModalContextProvider, Modal }


type ModalShowType = { 
    isShowed: boolean,
    setIsShowed: React.Dispatch<React.SetStateAction<boolean>>
}

interface IModalContextProps extends PropsWithChildren {
    context: React.Context<ModalShowType>
}

function ModalContextProvider({ context, children }: IModalContextProps) { 
    const [isShowed, setIsShowed] = useState(false)
    return (
        <context.Provider value={{ isShowed, setIsShowed }}>
            {children}
        </context.Provider>
    )
}

function Modal({ context, children }: IModalContextProps) {
    const { isShowed, setIsShowed } = useContext(context)
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
