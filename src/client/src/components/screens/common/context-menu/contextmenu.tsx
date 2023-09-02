import React, { PropsWithChildren, useEffect, useRef } from "react";
import './contextmenu.css'

export { type IContextMenuPos, onContextMenu, ContextMenuItem, ContextMenuDivider, ContextMenu }

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
    setPos: React.Dispatch<React.SetStateAction<IContextMenuPos>>,
}

interface IContextMenuProps extends PropsWithChildren {
    state: IContextMenuState
}

function onContextMenu(state: IContextMenuState) {
    return (ev: React.MouseEvent) => {
        ev.preventDefault()
        state.setPos({top: ev.clientY, left: ev.clientX})
        state.setIsShowed(true)
        ev.stopPropagation()
    }
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
