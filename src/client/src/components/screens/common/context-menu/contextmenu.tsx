import React, { ReactElement, useEffect, useRef, useState } from "react";
import './contextmenu.css'

export { type IContextMenuPos, ContextMenuItem, ContextMenu }

interface IContextMenuPos {
    top: number,
    left: number
}

interface IContextMenu {
    isShowed: boolean,
    pos: IContextMenuPos
}

interface IContextMenuItemProps {
    name: string,
    onclick: CallableFunction
}

function ContextMenuItem({ name, onclick }: IContextMenuItemProps) {
    return <div onMouseUp={ev => console.log(`act ${name} is clicked`)}><li><span>{name}</span></li></div>
}

interface IContextMenuProps {
    isShowed: boolean,
    setIsShowed: React.Dispatch<React.SetStateAction<boolean>>
    pos: IContextMenuPos,
    children: ReactElement
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
        <div ref={contextMenuRef} className="contextmenu" tabIndex={0} onBlur={ev => {setIsShowed(false)}} style={{top: pos.top, left: pos.left}}>
            <ul onMouseUp={ev => setIsShowed(false)}>
                { children }
            </ul>
        </div>
    )
}
