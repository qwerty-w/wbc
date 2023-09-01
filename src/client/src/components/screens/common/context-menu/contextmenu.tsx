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

interface IContextMenuState {
    isShowed: boolean,
    setIsShowed: React.Dispatch<React.SetStateAction<boolean>>,
    pos: IContextMenuPos
}

interface IContextMenuProps {
    state: IContextMenuState,
    children: ReactElement | ReactElement[]
}

function ContextMenuItem({ name, onClick }: IContextMenuItemProps) {
    return <li onMouseUp={ev => onClick(ev)}><span>{name}</span></li>
}

function ContextMenuDivider() {
    return <div className="contextmenu__divider"></div>
}

function ContextMenu({ state, children }: IContextMenuProps) {
    const contextMenuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (state.isShowed) {
            (contextMenuRef.current as HTMLDivElement).focus()
        }
    }, [state.isShowed])
    window.addEventListener('keydown', ev => {
        if (ev.key == 'Escape') {
            state.setIsShowed(false)
        }
    })

    if (!state.isShowed) {
        return <></>
    }
    return (
        <div ref={contextMenuRef} className="contextmenu" tabIndex={0} onBlur={ev => {state.setIsShowed(false)}} style={{top: state.pos.top - 5, left: state.pos.left - 5}}>
            <ul onMouseUp={ev => state.setIsShowed(false)}>
                { children }
            </ul>
        </div>
    )
}
