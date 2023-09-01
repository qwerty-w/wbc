import React, { ReactElement, useEffect, useRef, useState } from "react";
import './contextmenu.css'

export { type IContextMenuPos, ContextMenuItem, ContextMenuDivider, ContextMenu }

interface IContextMenuPos {
    top: number,
    left: number
}

interface IContextMenuItemProps {
    name: string,
    onClick: (ev: React.MouseEvent<HTMLLIElement, MouseEvent>) => void
}

interface IContextMenuProps {
    isShowed: boolean,
    setIsShowed: React.Dispatch<React.SetStateAction<boolean>>
    pos: IContextMenuPos,
    children: ReactElement | ReactElement[]
}

function ContextMenuItem({ name, onClick }: IContextMenuItemProps) {
    return <li onMouseUp={ev => onClick(ev)}><span>{name}</span></li>
}

function ContextMenuDivider() {
    return <div className="contextmenu__divider"></div>
}

function ContextMenu({ isShowed, setIsShowed, pos, children }: IContextMenuProps) {
    const contextMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isShowed) {
            (contextMenuRef.current as HTMLDivElement).focus()
        }
    }, [isShowed])
    window.addEventListener('keydown', ev => {
        if (ev.key == 'Escape') {
            setIsShowed(false)
        }
    })

    if (!isShowed) {
        return <></>
    }
    return (
        <div ref={contextMenuRef} className="contextmenu" tabIndex={0} onBlur={ev => {setIsShowed(false)}} style={{top: pos.top - 5, left: pos.left - 5}}>
            <ul onMouseUp={ev => setIsShowed(false)}>
                { children }
            </ul>
        </div>
    )
}
