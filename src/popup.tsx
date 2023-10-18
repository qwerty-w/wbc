import React, { ComponentPropsWithRef, ElementType, PropsWithChildren, PropsWithRef, ReactElement, createRef, forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { BrowserRouter, Routes, Route, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { observable, computed, action, makeAutoObservable, makeObservable, autorun } from 'mobx'
import { observer } from 'mobx-react-lite'

import styled, { css, keyframes } from 'styled-components'



const StyledPopup = styled.div.attrs<{ $top?: string,  $transition?: number }>(props => {
    const style = {
        top: props.$top || '0',
        transition: props.$transition !== undefined ? `top ${props.$transition}ms` : undefined
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

function getHeight(ref: React.RefObject<HTMLDivElement>): number {
    return ref.current ? ref.current.getBoundingClientRect().height : 0
}

enum TransitionState {
    DEFAULT = 'DEFAULT',
    ENTER = 'ENTER',
    ENTERING = 'ENTERING',
    ENTERED = 'ENTERED'
}

class Transition {
    public started: boolean = false
    public state: TransitionState = TransitionState.DEFAULT

    constructor() {
        makeObservable(this, {
            started: observable,
            state: observable,
            start: action,
            reset: action,
            setState: action
        })
    }
    start() {
        this.started = true
    }
    reset() {
        this.started = false
        this.state = TransitionState.DEFAULT
    }
    setState(state: TransitionState) {
        this.state = state
    }
}

type TransitionProps = {
    transition: Transition,
    timeout: number,
    callback: (state: TransitionState) => void
}

const TransitionView = observer(({ transition, timeout, callback }: TransitionProps) => {
    useEffect(() => {
        if (!transition.started) {
            return
        }

        switch (transition.state) {
            case TransitionState.DEFAULT:
                transition.setState(TransitionState.ENTER)
                break

            case TransitionState.ENTER:
                setTimeout(() => {
                    transition.setState(TransitionState.ENTERING)
                    setTimeout(() => transition.setState(TransitionState.ENTERED), timeout)
                }, 10)
        }
    }, [transition.started, transition.state])

    return <>{ callback(transition.state) }</>
})

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
        this.key = NaN
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
            this.add(this.pending.onadd.pop() as Item, false)
        }
        else if (type === PopupLock.ondel && this.pending.ondel) {
            this.pending.ondel--
            this.del()
        }
    }
    add(item: Item, setkey: boolean = true) {
        if (setkey) {
            item.key = this.count++
        }

        if (this.locked.onadd) {
            return this.pending.onadd.unshift(item)
        }
        this.items.add(item)
        this.lock(PopupLock.onadd)
        autorun(() => {
            if (item.status === ItemStatus.RENDERED) {
                this.unlock(PopupLock.onadd)
            }
        })
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
        <StyledItem $height={height} $transition={transition} ref={item.ref}>
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
    const [transition] = useState(new Transition())

    useEffect(() => {
        if (item.status === ItemStatus.UNMOUNTING) {
            transition.start()
        }
    }, [item.status])

    return <TransitionView transition={transition} timeout={350} callback={
        state => {
            
            switch (state) {
                case TransitionState.DEFAULT:
                    return <BasePopupItemView item={item} />

                case TransitionState.ENTER:
                    return <BasePopupItemView item={item} height={(item.height as number) + 'px'} />

                case TransitionState.ENTERING:
                    return <BasePopupItemView item={item} height={'0'} transition={400} />

                case TransitionState.ENTERED:
                    popup.items.arr.splice(popup.items.arr.findIndex(object => object === item), 1)
                    popup.unlock(PopupLock.ondel)
                    return <BasePopupItemView item={item} height={'0'} />
            }
        }
    } />
})

type BasePopupViewProps = {
    popup: Popup,
    top?: string,
    transition?: number
}

const BasePopupView = ({ popup, top, transition }: BasePopupViewProps) => {
    return (
        <StyledPopup $top={top} $transition={transition} ref={popup.ref}>
            {
                popup.items.arr.map((item) => <PopupItemView key={item.key} popup={popup} item={item} />)
            }
        </StyledPopup>
    )
}

export const PopupView = observer(({ popup }: { popup: Popup }) => {
    const top = popup.items.peek()
    const [transition] = useState(new Transition())

    useLayoutEffect(() => {
        top?.updateHeight()
        popup.updateHeight()
    })
    useEffect(() => {
        if (Boolean(popup.items.arr.length) && top?.height !== null && top.status === ItemStatus.MOUNTING) {
            transition.start()
        }
    })

    return <TransitionView transition={transition} timeout={350} callback={
        state => {
            switch (state) {
                case TransitionState.ENTER:
                    return <BasePopupView popup={popup} top={'-' + top.height + 'px'} />

                case TransitionState.ENTERING:
                    return <BasePopupView popup={popup} transition={400} />

                // @ts-ignore
                case TransitionState.ENTERED:
                    top.setStatus(ItemStatus.RENDERED)
                    transition.reset()

                case TransitionState.DEFAULT:
                    return <BasePopupView popup={popup} />
            }
        }
    } />
})
