import React, { createRef, useEffect, useLayoutEffect, useState } from "react"
import { observable, action, makeObservable, autorun } from 'mobx'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'

import { Transition, TransitionView, TransitionState } from './transition'
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

    width: 250px;
    border-radius: 0px 0px 20px 20px;
    background-color: #fff;
    overflow: hidden;

    display: flex;
    flex-direction: column;
    align-items: center;
`
const StyledItemLeft = styled.div`
    padding: 0px 13px;

    display: flex;
    justify-content: center;
    align-items: center;
`
const StyledItemTimerSeconds = styled.span`
    font-size: 10px;
    color: #d9d9d9;
`
const StyledItemTimer = styled.div`
    position: relative;
    width: 20px;
    height: 20px;
    overflow: hidden;

    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;

    & svg {
        position: absolute;
    }
`
const StyledItemRight = styled.div`
    padding: 10px 0px;
    padding-right: 13px;
    border-bottom: 1px solid #f2f2f2;
    overflow: hidden;

    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 13px;
    flex-grow: 1;

    & > span {
        color: #404040;
        font-size: 12px;
        font-weight: 500;
        overflow: hidden;
    }
`
const StyledItemContainer = styled.div.attrs<{ $shift?: string, $ms?: number }>(props => {
    const style = {
        position: props.$shift && 'relative' as any,
        left: props.$shift,
        transition: props.$ms !== undefined ? `left ${props.$ms}ms` : undefined
    }
    return { style }
})`
    display: flex;
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
    overflow: hidden;

    &:last-child ${StyledItemRight} {
        border-bottom: 1px solid rgba(0, 0, 0, 0);
    }
`

function getHeight(ref: React.RefObject<HTMLDivElement>): number {
    return ref.current ? ref.current.getBoundingClientRect().height : 0
}

function randint(min: number, max: number): number {
    return Math.random() * (max - min) + min;
}

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
    public triggered: boolean = false
    public height: number | null = null
    public timer?: CircleTimer
    public ref: React.RefObject<HTMLDivElement>

    public shifting = {
        shift: 0,
        passed: 0,
        pxrange: [7, 8],
        delay: 10,
        transition: 50,
        timeout: 800
    }

    constructor(public type: ItemType, public text: string, public lifetime: number = 10) {
        this.key = NaN
        this.status = ItemStatus.MOUNTING
        this.ref = createRef()

        makeObservable(this, {
            status: observable,
            triggered: observable,
            height: observable,
            shifting: observable,
            setShift: action,
            trigger: action,
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
    setShift(value: number) {
        this.shifting.shift = value
    }
    setShiftPassed(value: number) {
        this.shifting.passed = value
    }
    protected _trigger() {
        const { pxrange, delay, timeout } = this.shifting
        const rand = (side: 0 | 1 | Boolean) => randint(pxrange[0], pxrange[1]) * (side ? 1 : -1)  // 0 - left (-px); 1 - right (px)

        setTimeout(() => {
            this.setShift(rand(Math.round(randint(0, 1)) as 0 | 1))  // random start side
            const interval = setInterval(() => {
                this.setShift(rand(this.shifting.shift < 0))
                this.setShiftPassed(this.shifting.passed + delay)

                if (this.shifting.passed >= timeout) {
                    clearInterval(interval)
                    this.trigger(false)
                }
            }, delay)
        }, 10)
    }
    trigger(state: boolean = true) {
        switch ([this.triggered, state].join(' ')) {
            case 'true true':
                return this.setShiftPassed(Math.trunc(this.shifting.timeout / 2))

            case 'true false':
                this.setShift(0)
                this.setShiftPassed(0)
                this.triggered = false
                return

            case 'false true':
                this.triggered = true
                this._trigger()
        }
    }
    setStatus(status: ItemStatus) {
        this.status = status
    }
    updateHeight() {
        this.height = this.ref.current ? getHeight(this.ref) : null
    }
    setTimer(timer: CircleTimer) {
        this.timer = timer
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
        if (item.timer?.started) item.timer.stop()
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
        this.arr.slice().forEach(item => this.remove(item))
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
            // @ts-ignore
            _clear: action,
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
            this.add(this.pending.onadd.pop() as Item)
        }
        else if (type === PopupLock.ondel && this.pending.ondel) {
            this.pending.ondel--
            this.del()
        }
    }
    add(item: Item) {
        if (!item.key) {
            item.key = this.count++
        }

        const duplicate = this.items.arr.find(i => i === item || i.text === item.text)
        if (duplicate) {
            return duplicate.trigger()
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
    info(text: string, lifetime?: number) {
        this.add(new Item(ItemType.INFO, text, lifetime))
    }
    warning(text: string, lifetime?: number) {
        this.add(new Item(ItemType.WARN, text, lifetime))
    }
    error(text: string, lifetime?: number) {
        this.add(new Item(ItemType.ERROR, text, lifetime))
    }
    del() {        
        if (!this.items.arr.length) {
            return
        }

        if (this.locked.ondel && this.pending.ondel < this.items.arr.length) {
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
    protected _clear() {  // for mobx strict-mode warning
        this.clearing = true
    }
    clear() {
        if (this.locked.onclear || !this.items.arr.length || !this.ref.current) {
            return
        }
        this.lock(PopupLock.onclear)

        if (this.locked.onadd) {
            const head = this.items.peek()
            autorun(() => {
                if (head?.status === ItemStatus.RENDERED) {
                    this._clear()
                }
            })
        }
        else {
            this.lock(PopupLock.onadd)
            this._clear()
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

const BasePopupItemTimerView = observer(({ popup, item }: { popup: Popup, item: Item }) => {
    const [timer] = useState(new CircleTimer(20, 0.5, item.lifetime, () => { if (item.status !== ItemStatus.UNMOUNTING) popup.del() }, false))

    useEffect(() => {
        item.setTimer(timer)
        timer.start()
    }, [])

    return (
        <StyledItemTimer>
            <CircleTimerView timer={timer} color="#d9d9d9" />
            { timer.remaining > 0 ? <StyledItemTimerSeconds>{ timer.remaining }</StyledItemTimerSeconds> : undefined }
        </StyledItemTimer>
    )
})

type BasePopupItemViewProps = {
    popup: Popup,
    item: Item,
    height?: string,
    transition?: number
}

const BasePopupItemView = observer(({ popup, item, height, transition }: BasePopupItemViewProps) => {
    return (
        <StyledItem $height={height} $transition={transition} ref={item.ref}>
            <StyledItemContainer $shift={ item.triggered ? item.shifting.shift + 'px' : undefined } $ms={ item.triggered ? item.shifting.transition : undefined }>
                <StyledItemLeft><img src={item.icoUrl} alt={item.icoAlt}/></StyledItemLeft>
                <StyledItemRight>
                    <span>{ item.text }</span>
                    <BasePopupItemTimerView popup={popup} item={item} />
                </StyledItemRight>
            </StyledItemContainer>
        </StyledItem>
    )
})

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
                    return <BasePopupItemView popup={popup} item={item} />

                case TransitionState.ENTER:
                    return <BasePopupItemView popup={popup} item={item} height={(item.height as number) + 'px'} />

                case TransitionState.ENTERING:
                    return <BasePopupItemView popup={popup} item={item} height={'0'} transition={400} />

                case TransitionState.ENTERED:
                    popup.items.remove(item)
                    popup.unlock(PopupLock.ondel)
                    return <BasePopupItemView popup={popup} item={item} height={'0'} />
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
    const top = popup.items.peek()  // top item
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
                popup.updateHeight()
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
    }, [top])
    
    if (top && top.height !== null && top.status === ItemStatus.MOUNTING && !transition.add.started) {
        transition.add.start()
    }
    if (popup.clearing && !transition.clearing.started) {
        transition.clearing.start()
    }

    const add = !transition.clearing.started
    return <TransitionView transition={add ? transition.add : transition.clearing} timeout={add ? 350 : 750} callback={add ? onadd : onclearing} />
})