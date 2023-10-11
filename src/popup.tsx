import React, { ComponentPropsWithRef, ElementType, PropsWithChildren, PropsWithRef, ReactElement, createRef, forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { BrowserRouter, Routes, Route, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { observable, computed, action, makeAutoObservable, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'

import styled, { css, keyframes } from 'styled-components'


const StyledPopup = styled.div<{ $top?: string, $height?: string, $addAnim?: boolean, $removeAnim?: boolean, $animation?: AnimationType }>`
    position: fixed;
    top: ${props => props.$top || '0' };
    right: 5%;

    width: 215px;
    height: ${props => props.$height || ""};

    border-radius: 0px 0px 20px 20px;
    background-color: #fff;
    overflow: hidden;

    display: flex;
    flex-direction: column;
    align-items: center;

    animation: ${props => props.$animation ? keyframes`
        from {
            top: ${props.$animation.from.top}px;
            height: ${props.$animation.from.height}px;
        }
        to {
            top: 0px;
            height: ${props.$animation.to.height}px;
        }
    ` : undefined} 2s;
    /* animation-fill-mode: forwards; */
`
const StyledPopupLeft = styled.div`
    width: 41px;
    padding: 0px 13px;
    display: flex;
    justify-content: center;
    align-items: center;
`
const StyledPopupRight = styled.div`
    flex-grow: 1;
    padding: 10px 0px;
    padding-right: 13px;
    border-bottom: 1px solid #f2f2f2;
    overflow: hidden;

    display: flex;
    align-items: center;

    & span {
        color: #404040;
        font-size: 12px;
        font-weight: 500;
        overflow: hidden;
    }
`
const StyledPopupItem = styled.div`
    width: 100%;
    min-height: 35px;
    flex-shrink: 0;

    display: flex;

    &:last-child ${StyledPopupRight} {
        border-bottom: 1px solid rgba(0, 0, 0, 0);
    }
`


type AnimationType = {
    from: {
        height: number,
        top: number
    }
    to: {
        height: number,
        top: number
    }
}

export enum ItemType {
    INFO = 'INFO',
    WARN = 'WARNING',
    ERROR = 'ERROR'
}
enum ItemStatus {
    MOUNTING = 'MOUNT_PENDING',
    RENDERED = 'RENDERED',  // rendered, end of add animation
    UNMOUNTING = 'UNMOUNTING',  // wait for del handler
}

const getHeight = (ref: React.RefObject<HTMLDivElement>): number => {
    return ref.current ? ref.current.getBoundingClientRect().height : 0
}

export class Item {
    private static icons: Record<ItemType, string> = {
        [ItemType.INFO]: 'info.svg',
        [ItemType.WARN]: 'warning.svg',
        [ItemType.ERROR]: 'error.svg'
    }
    private static iconsAlt: Record<ItemType, string> = {
        [ItemType.INFO]: 'inf',
        [ItemType.WARN]: 'warn',
        [ItemType.ERROR]: 'err'
    }

    public status: ItemStatus
    public height: number | null = null
    public ref: React.RefObject<HTMLDivElement>

    constructor(public type: ItemType, public text: string) {
        this.status = ItemStatus.MOUNTING
        this.ref = createRef()

        makeObservable(this, {
            status: observable,
            height: observable,
            setStatus: action,
            updateHeight: action
        })
    }
    get icoUrl() {
        return `/icons/popup/${Item.icons[this.type]}`
    }
    get icoAlt() {
        return Item.iconsAlt[this.type]
    }
    statusIs(...statuses: ItemStatus[] | any[]) {
        return statuses.includes(this.status)
    }
    setStatus(status: ItemStatus) {
        this.status = status
    }
    updateHeight() {
        this.height = this.ref.current ? getHeight(this.ref) : null
    }
}

class ItemContainer {  // queue
    public arr: Item[]

    constructor() {
        this.arr = []
        makeObservable(this, {
            arr: observable,
            add: action,
            pop: action
        })
    }
    vertices() {
        return [this.peek(), this.tail()]
    }
    peek() {
        return this.arr[0]
    }
    tail() {
        return this.arr.slice(-1)[0]
    }
    add(item: Item) {
        return this.arr.unshift(item)
    }
    pop() {
        return this.arr.pop()
    }
    clear() {
        this.arr = []
    }
}

export class Popup {
    public items: ItemContainer = new ItemContainer()
    public height: number | null = null
    public ref: React.RefObject<HTMLDivElement>
    public locked: boolean = false
    public pending: Item[] = []

    constructor() {
        this.ref = createRef()
        makeObservable(this, {
            items: observable,
            height: observable,
            add: action,
            remove: action,
            updateHeight: action,
            clear: action
        })
    }
    lock() {
        this.locked = true
    }
    unlock() {
        this.locked = false

        const pending = this.pending.pop()
        if (pending) {
            this.add(pending)
        }
    }
    add(item: Item) {
        if (this.locked) {
            return this.pending.unshift(item)
        }
        this.items.add(item)
        this.lock()
    }
    have(...statuses: ItemStatus[]) {
        return this.items.arr.some(item => item.statusIs(statuses))
    }
    remove() {
        const item = Array.from(this.items.arr).reverse().find(item => item.statusIs(ItemStatus.RENDERED))  // todo: подписаться на изменение статуса, когда статус станет rendered - удалить
        item?.setStatus(ItemStatus.UNMOUNTING)
    }
    updateHeight() {
        this.height = this.ref.current ? getHeight(this.ref) : null
    }
    clear() {  // todo: animate
        this.height = 0
        this.items.clear()
    }
}

type PopupItemViewProps = JSX.IntrinsicElements["div"] & {
    item: Item
}

export const PopupItemView = forwardRef<HTMLDivElement, PopupItemViewProps>(({ item }: PopupItemViewProps, ref) => {
    return (
        <StyledPopupItem id={String(parseInt(item.text.replace(/[^\d\.]*/g, '')))} ref={ref}>
            <StyledPopupLeft><img src={item.icoUrl} alt={item.icoAlt}/></StyledPopupLeft>
            <StyledPopupRight>
                <span>{ item.text }</span>
            </StyledPopupRight>
        </StyledPopupItem>
    )
})

type BasePopupViewProps = {
    popup: Popup,
    animation?: AnimationType
}

const BasePopupView = ({ popup, animation }: BasePopupViewProps) => {
    const { items } = popup
    const top = items.peek()
    const start = items.arr.findIndex(item => item === top)

    return (
        <StyledPopup
            $animation={animation}
            ref={popup.ref}>
                {
                    popup.items.arr.slice(start).map((item, index) => <PopupItemView key={index} item={item} ref={item.ref} />)
                }
        </StyledPopup>
    )
}

const Transition = ({ timeout, x }: { timeout: number, x: any }) => {
    const [state, setState] = useState('entering')
    useEffect(() => {
        setTimeout(() => {
            setState('entered')
        }, timeout)
    })
    return <>{ x(state) }</>
}

export const PopupView = observer(({ popup }: { popup: Popup }) => {
    const [top, bot] = popup.items.vertices()

    useLayoutEffect(() => {
        top?.updateHeight()
        bot?.updateHeight()
        popup.updateHeight()
    })

    if (!popup.items.arr.length || [popup, top, bot].some(object => object?.height === null) || [top, bot].every(item => item?.status === ItemStatus.RENDERED)) {
        return <BasePopupView popup={popup} />
    }

    return (
        <Transition timeout={1600} x=
            {
                (state: any) => {
                    if (state === 'entering') {
                        const animation = {
                            from: {
                                top: top?.status === ItemStatus.MOUNTING ? -(top.height as number) : 0,
                                height: (popup.height as number)
                            },
                            to: {
                                top: 0,
                                height: bot?.status === ItemStatus.UNMOUNTING ? (popup.height as number) - (bot?.height as number) : (popup.height as number)
                            }
                        }
                        return <BasePopupView popup={popup} animation={animation} />
                    }
                    else if (state === 'entered') {
                        top?.setStatus(ItemStatus.RENDERED)

                        if (bot?.status === ItemStatus.UNMOUNTING) {
                            popup.items.pop()
                        }
                        popup.unlock()
                    }
                    return <BasePopupView popup={popup} />

                }
            } />
    )
})
