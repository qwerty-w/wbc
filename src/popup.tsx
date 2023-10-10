import React, { ComponentPropsWithRef, ElementType, PropsWithRef, ReactElement, forwardRef, useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { BrowserRouter, Routes, Route, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { observable, computed, action, makeAutoObservable, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'

import styled, { css } from 'styled-components'


// ms
const ADD_ANIMATION_DURATION = 400
const REMOVE_ANIMATION_DURATION = 400

const StyledMain = styled.div`
    width: 100%;
    height: 100%;
    background-color: #f2f2f2;
    font-family: 'Inter';
    font-weight: 500;

    display: flex;
    justify-content: center;
    align-items: center;
    gap: 30px;
`
const StyledBox = styled.div`
    width: 400px;
    height: 400px;
    background-color: #fff;
    color: #404040;
    border-radius: 20px;

    display: flex;
    justify-content: space-around;
    align-items: center;
`
const StyledButton = styled.button`
    width: 80px;
    height: 40px;

    outline: none;
    border: none;
    border-radius: 14px;
    color: #fff;
    background-color: #ED9B60;
    opacity: 0.9;

    transition: transform .2s;

    &:hover {
        cursor: pointer;
        opacity: 1;
    }
    &:active {
        transform: scale(.95);
    }
`
const StyledPopup = styled.div<{ $top?: string, $height?: string, $addAnim?: boolean, $removeAnim?: boolean }>`
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

    transition: ${props => [
        props.$addAnim && `top ${ADD_ANIMATION_DURATION / 1000}s`,
        props.$removeAnim && `height ${REMOVE_ANIMATION_DURATION / 1000}s`
    ].filter(v => v).join(', ')};
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


enum ItemType {
    INFO = 'INFO',
    WARN = 'WARNING',
    ERROR = 'ERROR'
}
enum ItemStatus {
    PENDING = 'PENDING',  // waiting for add handler
    MOUNTING = 'MOUNTING',  // calculate height
    PREPARED = 'PREPARED',  // handled before add animation
    ADDING = 'ADDING',  // start add animation

    RENDERED = 'RENDERED',  // rendered, end of add animation

    UNMOUNTING = 'UNMOUNTING',  // wait for del handler
    HANDLING = 'HANDLING',  // handled before del animation
    DELETING = 'DELETING'  // animation is playing, delete after
}

class Item {
    public status: ItemStatus
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

    constructor(public type: ItemType, public text: string) {
        this.status = ItemStatus.PENDING
        makeObservable(this, {
            status: observable,
            setStatus: action
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
    peek() {
        const find = (status: ItemStatus, reverse: boolean = true) => {
            return reverse ? this.arr.slice().reverse().find(item => item.statusIs(status)) : this.arr.find(item => item.statusIs(status))
        }

        return find(ItemStatus.MOUNTING) || find(ItemStatus.PREPARED) || find(ItemStatus.ADDING) || find(ItemStatus.PENDING) || find(ItemStatus.RENDERED)

        const items: Partial<Record<ItemStatus, Item | undefined>> = {
            [ItemStatus.MOUNTING]: undefined,
            [ItemStatus.PENDING]: undefined,
            [ItemStatus.RENDERED]: undefined,
        }

        const renderedIndex = this.arr.findIndex(item => item.statusIs(ItemStatus.RENDERED))

        for (let item of this.arr.slice(0, renderedIndex > 0 ? renderedIndex : undefined).reverse()) {
            if (item.statusIs(ItemStatus.PENDING, ItemStatus.MOUNTING)) {
                return item
            }
        }

        return this.arr[renderedIndex]
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
}

type PopupItemViewProps = JSX.IntrinsicElements["div"] & {
    item: Item
}

const PopupItemView = forwardRef<HTMLDivElement, PopupItemViewProps>(({ item }: PopupItemViewProps, ref) => {
    return (
        <StyledPopupItem ref={ref}>
            <StyledPopupLeft><img src={item.icoUrl} alt={item.icoAlt}/></StyledPopupLeft>
            <StyledPopupRight>
                <span>{ item.text }</span>
            </StyledPopupRight>
        </StyledPopupItem>
    )
})

type ExtendedItemType = {
    item?: Item,
    ref: React.RefObject<HTMLDivElement>,
    height: {
        value: number,
        set: React.Dispatch<React.SetStateAction<number>>
    },
    remove: () => void
}

const useExtendedItem = (item?: Item, onRemove?: () => void): ExtendedItemType => {
    const [value, set] = useState<number>(0)
    return {
        item,
        ref: useRef<HTMLDivElement>(null),
        height: { value, set },
        remove: () => {
            if (onRemove) {
                onRemove()
            }
            set(0)
        }
    }
}

const useVertices = (items: ItemContainer) => {
    return [useExtendedItem(items.peek()), useExtendedItem(items.tail(), () => items.pop())]
}

const getHeight = (ref: React.RefObject<HTMLDivElement>): number => {
    return ref.current ? ref.current.getBoundingClientRect().height : 0
}

class Popup {
    public items: ItemContainer = new ItemContainer()
    public height: number = 0

    constructor() {
        makeAutoObservable(this)
    }
    add(item: Item) {
        this.items.add(item)
    }
    have(...statuses: ItemStatus[]) {
        return this.items.arr.some(item => item.statusIs(statuses))
    }
    remove() {
        const item = Array.from(this.items.arr).reverse().find(item => item.statusIs(ItemStatus.RENDERED))  // todo: подписаться на изменение статуса, когда статус станет rendered - удалить
        item?.setStatus(ItemStatus.UNMOUNTING)
    }
    setHeight(value: number) {
        this.height = value
    }
}

const PopupView = observer(({ popup }: { popup: Popup }) => {
    const [top, bot] = useVertices(popup.items)
    const popupRef = useRef<HTMLDivElement>(null)

    if (top.item?.statusIs(ItemStatus.PENDING)) {
        top.item.setStatus(ItemStatus.MOUNTING)
    }

    useLayoutEffect(() => {
        if (top.item?.statusIs(ItemStatus.MOUNTING)) {
            const topHeight = getHeight(top.ref)
            top.height.set(topHeight)
            popup.setHeight(popup.height + topHeight)

            top.item.setStatus(ItemStatus.PREPARED)
        }
        
    })
    useEffect(() => {
        if (top.item?.status === ItemStatus.PREPARED) {
            setTimeout(() => top.item?.setStatus(ItemStatus.ADDING), 20)  // start animation through 20ms
            setTimeout(() => top.item?.setStatus(ItemStatus.RENDERED), ADD_ANIMATION_DURATION + 20)
        }

        if (bot.item?.statusIs(ItemStatus.UNMOUNTING)) {
            setTimeout(() => {  // start remove animation
                popup.setHeight(popup.height - getHeight(bot.ref))  // - 1px cause last-child haven't border
                bot.item?.setStatus(ItemStatus.DELETING)

                setTimeout(() => bot.remove(), REMOVE_ANIMATION_DURATION + 10)  // delete item after end of remove animation
            }, 20)

            bot.item.setStatus(ItemStatus.HANDLING)
        }
    })

    return (
        <StyledPopup
        $top={top.item?.status === ItemStatus.PREPARED ? -top.height.value + 'px': undefined}
        $addAnim={top.item?.statusIs(ItemStatus.ADDING)}
        $height={popup.height + 'px'}
        $removeAnim={bot.item?.statusIs(ItemStatus.DELETING)}
        ref={popupRef}>
            {
                popup.items.arr.filter(item => !item.statusIs(ItemStatus.PENDING)).map(
                    (item, index, arr) => <PopupItemView key={index} item={item} ref={!index ? top.ref : index === arr.length - 1 ? bot.ref : undefined}/>
                )
            }
        </StyledPopup>
    )
})

export const MainView = () => {
    const [popup] = useState(new Popup())
    const [counter, setCounter] = useState(0)

    const add = (ev?: any, item?: Item) => {
        const newItem: Item = item ? item : new Item(ItemType.INFO, 'Transactionhasbeencreatedand repeated ' + counter)

        popup.add(newItem)
        setCounter(counter + 1)

    }
    const addBig = () => {
        add(undefined, new Item(ItemType.ERROR, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse sodales quam ut vestibulum ultrices.'))
    }
    const addRemove = () => {
        add(undefined)
        popup.remove()
    }

    return (
        <StyledMain>
            <StyledBox>
                <StyledButton onClick={add}>Add</StyledButton>
                <StyledButton onClick={addBig}>Add big</StyledButton>
                <StyledButton onClick={addRemove}>Add and Remove</StyledButton>
                <StyledButton onClick={() => popup.remove()}>Remove</StyledButton>
            </StyledBox>
            <StyledBox>This is Box !</StyledBox>
            <PopupView popup={popup}/>
        </StyledMain>
    )
}
