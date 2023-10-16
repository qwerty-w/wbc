import React, { ComponentPropsWithRef, ElementType, PropsWithChildren, PropsWithRef, ReactElement, createRef, forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { BrowserRouter, Routes, Route, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { observable, computed, action, makeAutoObservable, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'

import styled, { css, keyframes } from 'styled-components'



const StyledPopup = styled.div.attrs<{ $top?: string,  $transition?: number }>(props => {
    const style = {
        top: props.$top || '0',
        transition: props.$transition !== undefined ? `top ${props.$transition}ms` : ''  // fixme: undefined ?
    }
    return { style }
})`
    position: fixed;
    right: 5%;

    width: 215px;

    border-radius: 0px 0px 20px 20px;
    background-color: #fff;
    overflow: hidden;

    display: flex;
    flex-direction: column;
    align-items: center;
`
const StyledItemLeft = styled.div`
    width: 41px;
    padding: 0px 13px;

    display: flex;
    justify-content: center;
    align-items: center;
`
const StyledItemRight = styled.div`
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
const StyledItemFlex = styled.div`
    overflow: hidden;
    display: flex;
    flex-shrink: 0;
`
const StyledItem = styled.div.attrs<{ $height?: string, $transition?: number }>(props => {
    const style = {
        height: props.$height,
        transition: props.$transition ? `height ${props.$transition}ms` : undefined
    }
    return { style }
})`
    width: 100%;
    min-height: ${props => props.$height === undefined ? '35px' : undefined};

    display: flex;
    flex-direction: column;
    flex-shrink: 0;

    &:last-child ${StyledItemRight} {
        border-bottom: 1px solid rgba(0, 0, 0, 0);
    }
`

export enum ItemType {
    INFO = 'INFO',
    WARN = 'WARNING',
    ERROR = 'ERROR'
}
enum ItemStatus {
    MOUNTING = 'MOUNTING',
    RENDERED = 'RENDERED',  // rendered, end of add animation
    UNMOUNTING = 'UNMOUNTING'  // wait for del handler
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

    public key: number
    public status: ItemStatus
    public height: number | null = null
    public ref: React.RefObject<HTMLDivElement>

    constructor(public type: ItemType, public text: string) {
        this.key = 0
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
    setStatus(status: ItemStatus) {
        this.status = status
    }
    updateHeight() {
        this.height = this.ref.current ? getHeight(this.ref) : null
    }
}

class ItemContainer {
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

enum PopupLock {
    onadd = 'onadd',
    ondel = 'ondel'
}
type PopupPendingQueue = {
    onadd: Item[],
    ondel: number
}

export class Popup {
    public height: number | null = null
    public ref: React.RefObject<HTMLDivElement>
    public items: ItemContainer = new ItemContainer()
    public count: number = 0
    public locked: Record<PopupLock, boolean> = { onadd: false, ondel: false }
    public pending: PopupPendingQueue = { onadd: [], ondel: 0 }

    constructor() {
        this.ref = createRef()
        makeObservable(this, {
            items: observable,
            height: observable,
            add: action,
            del: action,
            updateHeight: action,
            clear: action
        })
    }
    lock(type: PopupLock) {
        this.locked[type] = true
    }
    unlock(type: PopupLock) {
        this.locked[type] = false

        if (type === PopupLock.onadd && this.pending.onadd.length) {
            this.add(this.pending.onadd.pop() as Item)
        }
        else if (type === PopupLock.ondel && this.pending.ondel) {
            this.pending.ondel--
            this.del()
        }
    }
    add(item: Item) {
        item.key = this.count++

        if (this.locked.onadd) {
            return this.pending.onadd.unshift(item)
        }
        this.items.add(item)
        this.lock(PopupLock.onadd)
    }
    del() {
        // todo
        const tail = this.items.tail()

        if (this.locked.ondel) {
            this.pending.ondel++
            return
        }

        if (tail?.status === ItemStatus.RENDERED) {
            tail.setStatus(ItemStatus.UNMOUNTING)
            this.lock(PopupLock.ondel)
        }
    }
    updateHeight() {
        this.height = this.ref.current ? getHeight(this.ref) : null
    }
    clear() {  // todo: animate
        this.height = 0
        this.items.clear()
    }
}

type BasePopupItemViewProps = {
    item: Item,
    height?: string,
    transition?: number
}

const BasePopupItemView = ({ item, height, transition }: BasePopupItemViewProps) => {
    return (
        <StyledItem id={String(parseInt(item.text.replace(/[^\d\.]*/g, '')))} $height={height} $transition={transition} ref={item.ref}>
            <StyledItemFlex>
                <StyledItemLeft><img src={item.icoUrl} alt={item.icoAlt}/></StyledItemLeft>
                <StyledItemRight>
                    <span>{ item.text }</span>
                </StyledItemRight>
            </StyledItemFlex>
        </StyledItem>
    )
}

export const PopupItemView = observer(({ popup, item }: { popup: Popup, item: Item }) => {

    useEffect(() => {
        console.log('Item ', item.key, ' is mount')

        return () => {
            console.log('Item ', item.key, 'is unmount')
        }
    }, [])

    useEffect(() => {
        console.log('render', item.key)
    })

    if (item.status !== ItemStatus.UNMOUNTING) {
        return <BasePopupItemView item={item} />
    }

    return <Transition start={true} timeout={1800} callback={
        state => {
            switch (state) {
                case TransitionState.BASE:
                    return <BasePopupItemView item={item} height={(item.height as number) + 'px'} />

                case TransitionState.ENTERING:
                    return <BasePopupItemView item={item} height={'0'} transition={2000} />

                case TransitionState.ENTERED:
                    popup.items.arr.splice(popup.items.arr.findIndex(object => object === item), 1)
                    popup.unlock(PopupLock.ondel)
            }
        }
    } />
})

enum TransitionState {
    BASE = 'BASE',
    ENTERING = 'ENTERING',
    ENTERED = 'ENTERED'
}

type TransitionProps = {
    start: boolean,
    timeout: number,
    callback: (state: TransitionState, reset: () => void) => void
}

const Transition = ({ start, timeout, callback }: TransitionProps) => {
    const [state, setState] = useState(TransitionState.BASE)
    const reset = () => setState(TransitionState.BASE)

    useEffect(() => {
        if (start && timeout > 0) {
            setTimeout(() => {
                setState(TransitionState.ENTERING)
                setTimeout(() => setState(TransitionState.ENTERED), timeout)
            }, 10)
        }
    }, [start])
    return <>{ callback(state, reset) }</>
}

type BasePopupViewProps = {
    popup: Popup,
    top?: string,
    transition?: number
}

const BasePopupView = ({ popup, top, transition }: BasePopupViewProps) => {
    useEffect(() => {
        console.log('mount BasePopupView')
        return () => console.log('unmount BasePopupView')
    }, [])
    useEffect(() => {
        console.log('render BasePopupView')
    })

    return (
        <StyledPopup id="popup" $top={top} $transition={transition} ref={popup.ref}>
            {
                popup.items.arr.map((item) => <PopupItemView key={item.key} popup={popup} item={item} />)
            }
        </StyledPopup>
    )
}

export const PopupView = observer(({ popup }: { popup: Popup }) => {
    const top = popup.items.peek()

    useLayoutEffect(() => {
        top?.updateHeight()
        popup.updateHeight()  // todo: remove
    })

    if (!popup.items.arr.length || [popup, top].some(object => object?.height === null) || top.status !== ItemStatus.MOUNTING) {
        return <Transition start={false} timeout={0} callback={() => <BasePopupView popup={popup} />} />
    }

    return <Transition start={true} timeout={1700} callback={
        (state, reset) => {
            console.log('state:', state)
            switch (state) {
                case TransitionState.BASE:
                    return <BasePopupView popup={popup} top={'-' + top.height + 'px'} />

                case TransitionState.ENTERING:
                    return <BasePopupView popup={popup} transition={2000} />

                case TransitionState.ENTERED:
                    top.setStatus(ItemStatus.RENDERED)
                    popup.unlock(PopupLock.onadd)
                    reset()
            }
            return <BasePopupView popup={popup} />
        }
    } />
})
