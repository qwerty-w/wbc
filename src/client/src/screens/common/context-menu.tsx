import React, { PropsWithChildren, useEffect, useState, useRef, ReactElement, cloneElement } from "react";
import { createPortal } from 'react-dom'
import { makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite';
import styled from 'styled-components'


const StyledContextMenu = styled.div`
    position: absolute;
    top: 0;
    left: 0;

    width: 180px;
    background-color: black;
    border-radius: 3px;
    outline: none;
    padding: 8px 0px;

    user-select: none;
    font-size: 12px;    
`
const StyeldContextMenuBackground = styled.div`
    position: fixed;
    top: 0;
    left: 0;

    width: 100%;
    height: 100%;
    z-index: 3;
`
const StyledContextMenuContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0px;
`
const StyledContextMenuItem = styled.div`
    width: 100%;
    height: 24px;
    cursor: pointer;

    display: flex;
    align-items: center;

    &:hover {
        background-color: #ED9B60;
    }

    span {
        margin: 0 16px;
        color: white;
    }
`
const StyledContextMenuDivider = styled.div`
    width: 100%;
    padding: 8px 0px;  
`
const StyledContextMenuDividerLine = styled.div`
    height: 1px;
    background-color: #383838;
`


interface IContextMenuItemProps {
    name: string,
    onClick: (ev: React.MouseEvent<HTMLDivElement, MouseEvent>) => void
}

export const ContextMenuItem = ({ name, onClick }: IContextMenuItemProps) => {
    return <StyledContextMenuItem onMouseUp={ev => {if (ev.button === 0) { onClick(ev); } else if (ev.button === 2) { ev.preventDefault(); ev.stopPropagation() }}}>
        <span>{name}</span>
    </StyledContextMenuItem>
}

export const ContextMenuDivider =() => {
    return (
        <StyledContextMenuDivider onMouseUp={ev => { ev.stopPropagation() }}>
            <StyledContextMenuDividerLine />
        </StyledContextMenuDivider>
    )
}

export type ContextMenuPos = {
    top: number,
    left: number
}

class ContextMenu {
    constructor(public isShowed: boolean = false, public position: ContextMenuPos = { top: 0, left: 0 }) {
        makeAutoObservable(this)
    }
    show(pos: ContextMenuPos) {
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

export const ContextMenuView = observer(({ items, effect, children }: IContextMenuProps) => {
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
                    <StyledContextMenu ref={ref}
                         className="contextmenu"
                         tabIndex={0}
                         onContextMenu={ev => { ev.stopPropagation(); ev.preventDefault() }}
                         onBlur={() => { menu.hide() }}
                         style={{ zIndex: 4, top: menu.position.top - 5, left: menu.position.left - 5 }}>
                        <StyledContextMenuContainer onMouseUp={() => { menu.hide() }}>
                            { items }
                        </StyledContextMenuContainer>
                    </StyledContextMenu>
                    <StyeldContextMenuBackground onContextMenu={ev => ev.stopPropagation()} />
                </div>
            ), (document.getElementById('root') as HTMLElement)) }
        </>
    )
})
