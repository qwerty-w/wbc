import React, { createRef, useEffect, useLayoutEffect, useState } from "react"
import { observable, action, makeObservable, autorun } from 'mobx'
import { observer } from 'mobx-react-lite'

import styled from 'styled-components'
import { CircleTimer, CircleTimerView } from "./circle-timer"


const StyledPopup = styled.div.attrs<{ $top?: string, $height?: string, $transition?: number, $transitionType?: string }>(props => {
    const style = {
        top: props.$top || '0',
        transition: props.$transition !== undefined ? `${props.$transitionType || 'top'} ${props.$transition}ms` : undefined,
        height: props.$height
    }
    return { style }
})`
    position: fixed;
    right: 5%;

    width: 215px;

    border-radius: 0px 0px 20px 20px;
    background-color: #fff;

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
    width: 100%;
    padding: 10px 0px;
    padding-right: 13px;
    border-bottom: 1px solid #f2f2f2;
    overflow: hidden;

    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;

    & span {
        color: #404040;
        font-size: 12px;
        font-weight: 500;
        overflow: hidden;
    }
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
    RENDERED = 'RENDERED',
    UNMOUNTING = 'UNMOUNTING'
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

type OptionalItem = Item | undefined

class ItemContainer {
    public arr: Item[] = []

    constructor() {
        makeObservable(this, {
            arr: observable,
            add: action,
            remove: action,
            pop: action,
            clear: action
        })
    }
    vertices(): (OptionalItem)[] {
        return [this.peek(), this.tail()]
    }
    peek(): OptionalItem {
        return this.arr[0]
    }
    tail(): OptionalItem {
        return this.arr.slice(-1)[0]
    }
    add(item: Item): number {
        return this.arr.unshift(item)
    }
    remove(item: Item): boolean {
        const index = this.arr.findIndex(object => object === item)

        if (index < 0) {
            return false
        }

        this.arr.splice(index, 1)
        return true
    }
    pop(): OptionalItem {
        return this.arr.pop()
    }
    clear() {
        this.arr = []
    }
}

enum PopupLock {
    onadd = 'onadd',
    ondel = 'ondel',
    onclear = 'onclear'
}
type PopupPendingQueue = {
    onadd: Item[],
    ondel: number
}

export class Popup {
    public height: number | null = null
    public ref: React.RefObject<HTMLDivElement>
    public items: ItemContainer = new ItemContainer()
    public clearing: boolean = false
    public count: number = 0
    public locked: Record<PopupLock, boolean> = { onadd: false, ondel: false, onclear: false }
    public pending: PopupPendingQueue = { onadd: [], ondel: 0 }

    constructor() {
        this.ref = createRef()
        makeObservable(this, {
            items: observable,
            height: observable,
            clearing: observable,
            add: action,
            del: action,
            updateHeight: action,
            clear: action,
            finishClearing: action
        })
    }
    updateHeight() {
        this.height = this.ref.current ? getHeight(this.ref) : null
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
            if (item.status === ItemStatus.RENDERED && !this.locked.onclear) {
                this.unlock(PopupLock.onadd)
            }
        })
    }
    info(text: string) {
        this.add(new Item(ItemType.INFO, text))
    }
    warning(text: string) {
        this.add(new Item(ItemType.WARN, text))
    }
    error(text: string) {
        this.add(new Item(ItemType.ERROR, text))
    }
    del() {
        if (!this.items.arr.length) {
            return
        }

        if (this.locked.ondel) {
            this.pending.ondel++
            return
        }

        const tail = this.items.tail()
        const lock = () => this.lock(PopupLock.ondel)
        const unlock = () => this.unlock(PopupLock.ondel)

        switch (tail?.status) {
            case ItemStatus.MOUNTING:
                autorun(() => {
                    if (tail.status === ItemStatus.RENDERED) {
                        setTimeout(() => { unlock(); this.del() }, 0)  // setTimeout for render item with .RENDERED status
                    }
                })
                lock()
                break

            case ItemStatus.RENDERED:
                tail.setStatus(ItemStatus.UNMOUNTING)
                lock()
        }
    }
    clear() {
        if (this.locked.onclear) {
            return
        }
        this.lock(PopupLock.onclear)

        if (this.locked.onadd) {
            const head = this.items.peek()
            autorun(() => {
                if (head?.status === ItemStatus.RENDERED) {
                    this.clearing = true
                }
            })
        }
        else {
            this.lock(PopupLock.onadd)
            this.clearing = true
        }
    }
    finishClearing() {
        this.items.clear()
        this.clearing = false
        this.unlock(PopupLock.onclear)
        this.unlock(PopupLock.onadd)

        this.unlock(PopupLock.ondel)
        this.pending.ondel = 0
    }
}

type BasePopupItemViewProps = {
    item: Item,
    height?: string,
    transition?: number
}

const BasePopupItemView = ({ item, height, transition }: BasePopupItemViewProps) => {
    const [timer] = useState(new CircleTimer(20, 30))

    return (
        <StyledItem $height={height} $transition={transition} ref={item.ref}>
            <StyledItemLeft><img src={item.icoUrl} alt={item.icoAlt}/></StyledItemLeft>
            <StyledItemRight>
                <span>{ item.text }</span>
                <div style={{ flexShrink: 0 }}>
                    <CircleTimerView timer={timer} color="#d9d9d9" strokeWidth="0.5px" />
                </div>
            </StyledItemRight>
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
                    popup.items.remove(item)
                    popup.unlock(PopupLock.ondel)
                    return <BasePopupItemView item={item} height={'0'} />
            }
        }
    } />
})

type BasePopupViewProps = {
    popup: Popup,
    top?: string,
    height?: string,
    transition?: number,
    transitionType?: string
}

const BasePopupView = ({ popup, top, height, transition, transitionType }: BasePopupViewProps) => {
    return (
        <StyledPopup $top={top} $height={height} $transition={transition} $transitionType={transitionType} ref={popup.ref}>
            {
                popup.items.arr.map((item) => <PopupItemView key={item.key} popup={popup} item={item} />)
            }
        </StyledPopup>
    )
}

export const PopupView = observer(({ popup }: { popup: Popup }) => {
    const top = popup.items.peek()
    const transition = {
        add: useState(new Transition())[0],
        clearing: useState(new Transition())[0]
    }

    const onadd = (state: TransitionState) => {
        switch (state) {
            case TransitionState.ENTER:
                return <BasePopupView popup={popup} top={'-' + top?.height + 'px'} />

            case TransitionState.ENTERING:
                return <BasePopupView popup={popup} transition={400} />

            // @ts-ignore
            case TransitionState.ENTERED:
                top?.setStatus(ItemStatus.RENDERED)
                transition.add.reset()

            case TransitionState.DEFAULT:
                return <BasePopupView popup={popup} />
        }
    }
    const onclearing = (state: TransitionState) => {
        switch (state) {
            case TransitionState.ENTER:
                return <BasePopupView popup={popup} height={popup.height + 'px'} />

            case TransitionState.ENTERING:
                return <BasePopupView popup={popup} height='0' transition={800} transitionType='height' />

            // @ts-ignore
            case TransitionState.ENTERED:
                popup.finishClearing()
                transition.clearing.reset()

            case TransitionState.DEFAULT:
                return <BasePopupView popup={popup} />
        }
    }

    useLayoutEffect(() => {
        top?.updateHeight()
        popup.updateHeight()
    })
    useEffect(() => {
        if (top && top.height !== null && top.status === ItemStatus.MOUNTING) {
            transition.add.start()
        }
        if (popup.clearing) {
            transition.clearing.start()
        }
    })

    return <TransitionView transition={!popup.clearing ? transition.add : transition.clearing} timeout={!popup.clearing ? 350 : 750} callback={!popup.clearing ? onadd : onclearing} />
})
