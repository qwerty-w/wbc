import './contextmenu.css'
import React, { PropsWithChildren, useState, useEffect, useRef, ReactElement, cloneElement } from "react";
import { createPortal } from 'react-dom'

export { type IContextMenuPos, ContextMenuItem, ContextMenuDivider, ContextMenu }

interface IContextMenuPos {
    top: number,
    left: number
}

interface IContextMenuItemProps {
    name: string,
    onClick: (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

interface IContextMenuState {
    isShowed: boolean,
    setIsShowed: React.Dispatch<React.SetStateAction<boolean>>,
    pos: IContextMenuPos
    setPos: React.Dispatch<React.SetStateAction<IContextMenuPos>>,
}

interface IContextMenuProps extends PropsWithChildren {
    items: ReactElement<HTMLUListElement>,
    effect?: (isShowed: boolean) => void,
}

function ContextMenuItem({ name, onClick }: IContextMenuItemProps) {
    return <div className='contextmenu__item' onMouseUp={ev => onClick(ev)}><span>{name}</span></div>
}

function ContextMenuDivider() {
    return (
        <div onMouseUp={ev => { ev.stopPropagation() }} className="contextmenu__divider">
            <div className='contextmenu__divider-line' />
        </div>
    )
}

function ContextMenu({ items, effect, children }: IContextMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)
    const [isShowed, setIsShowed] = useState<boolean>(false)
    const [pos, setPos] = useState<IContextMenuPos>({ top: 0, left: 0 })

    useEffect(() => {
        if (isShowed) {
            (menuRef.current as HTMLDivElement).focus()
        }
        if (effect) {
            effect(isShowed)
        }
    }, [isShowed])

    window.addEventListener('keydown', ev => {
        if (ev.key == 'Escape') {
            setIsShowed(false)
        }
    })

    if (!isShowed) {
        return cloneElement((children as ReactElement), { onContextMenu: (ev: React.MouseEvent) => {
            ev.preventDefault()
            ev.stopPropagation()
            setPos({ top: ev.clientY, left: ev.clientX })
            setIsShowed(true)
        } })
    }

    return (
        <>
            { children }
            { createPortal((
                <div>
                    <div ref={menuRef} className="contextmenu" tabIndex={0} onBlur={() => { setIsShowed(false) }} style={{ zIndex: 4, top: pos.top - 5, left: pos.left - 5 }}>
                        <div className='contextmenu__container' onMouseUp={() => { setIsShowed(false) }}>
                            { items }
                        </div>
                    </div>
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 3 }}></div>
                </div>
            ), (document.getElementById('root') as HTMLElement)) }
        </>
    )
}
