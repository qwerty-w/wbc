import './contextmenu.css'
import React, { PropsWithChildren, useEffect, useState, useRef, ReactElement, cloneElement } from "react";
import { makeAutoObservable } from 'mobx'
import { createPortal } from 'react-dom'
import { observer } from 'mobx-react-lite';

export { type IContextMenuPos, ContextMenuItem, ContextMenuDivider, ContextMenuView }



interface IContextMenuItemProps {
    name: string,
    onClick: (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

const ContextMenuItem = ({ name, onClick }: IContextMenuItemProps) => {
    return <div className='contextmenu__item' onMouseUp={ev => {if (ev.button === 0) { onClick(ev); } else if (ev.button === 2) { ev.preventDefault(); ev.stopPropagation() }}}>
        <span>{name}</span>
    </div>
}

const ContextMenuDivider =() => {
    return (
        <div onMouseUp={ev => { ev.stopPropagation() }} className="contextmenu__divider">
            <div className='contextmenu__divider-line' />
        </div>
    )
}

interface IContextMenuPos {
    top: number,
    left: number
}

class ContextMenu {
    constructor(public isShowed: boolean = false, public position: IContextMenuPos = { top: 0, left: 0 }) {
        makeAutoObservable(this)
    }
    show(pos: IContextMenuPos) {
        this.isShowed = true
        this.position = pos
    }
    hide() {
        this.isShowed = false
    }
}

interface IContextMenuProps extends PropsWithChildren {
    items: ReactElement<HTMLUListElement>,
    effect?: (menu: ContextMenu) => void,
}

const ContextMenuView = observer(({ items, effect, children }: IContextMenuProps) => {
    const ref = useRef<HTMLDivElement>(null)
    const [menu] = useState(new ContextMenu())

    useEffect(() => {
        if (menu.isShowed) {
            (ref.current as HTMLDivElement).focus()
        }
        if (effect) {
            effect(menu)
        }
    }, [menu.isShowed])

    window.addEventListener('keydown', ev => {
        if (ev.key == 'Escape') {
            menu.hide()
        }
    })

    if (!menu.isShowed) {
        return cloneElement((children as ReactElement), { onContextMenu: (ev: React.MouseEvent) => {
            ev.preventDefault()
            ev.stopPropagation()
            menu.show({ top: ev.clientY, left: ev.clientX })
        } })
    }

    return (
        <>
            { children }
            { createPortal((
                <div>
                    <div ref={ref}
                         className="contextmenu"
                         tabIndex={0}
                         onContextMenu={ev => { ev.stopPropagation(); ev.preventDefault() }}
                         onBlur={() => { menu.hide() }}
                         style={{ zIndex: 4, top: menu.position.top - 5, left: menu.position.left - 5 }}>
                        <div className='contextmenu__container' onMouseUp={() => { menu.hide() }}>
                            { items }
                        </div>
                    </div>
                    <div onContextMenu={ev => ev.stopPropagation()} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 3 }}></div>
                </div>
            ), (document.getElementById('root') as HTMLElement)) }
        </>
    )
})
