import React, { useEffect, useRef, useState } from "react"
import { BrowserRouter, Routes, Route, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { observable, computed, action, makeAutoObservable, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import styled, { css, keyframes } from 'styled-components'

import { PopupView, Popup, Item, ItemType } from './popup'
import * as timer from './circle-timer'


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
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 20px;

    & div {
        width: 100%;
        display: flex;
        justify-content: space-around;
    }
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
    user-select: none;

    &:hover {
        cursor: pointer;
        opacity: 1;
    }
    &:active {
        transform: scale(.95);
    }
`


export const MainView = () => {
    const [popup] = useState(new Popup())
    const [counter, setCounter] = useState(0)
    const [armCounter, setArmCounter] = useState(0)

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
        // add(undefined)
        // add(undefined)
        popup.del()
        setArmCounter(armCounter + 1)
    }

    return (
        <StyledMain>
            <StyledBox>
                <div>
                    <StyledButton onClick={add}>Add</StyledButton>
                    <StyledButton onClick={addBig}>Add big</StyledButton>
                    <StyledButton onClick={addRemove}>Add and Remove</StyledButton>
                    <StyledButton onClick={() => popup.del()}>Remove</StyledButton>
                </div>
                <div>
                    <StyledButton onClick={() => popup.clear()}>Clear</StyledButton>
                </div>
            </StyledBox>
            <StyledBox>This is Box !</StyledBox>
            <PopupView popup={popup}/>
        </StyledMain>
    )
}

class MyList {
    keys: string[] = []

    constructor() {
        makeObservable(this, {
            keys: observable,
            add: action,
            remove: action
        })
    }
    add(key: string) {
        this.keys.push(key)
    }
    remove() {
        this.keys.pop()
    }
}

const InnerView = React.memo(({ name, counter }: {name: string, counter: number}) => {
    const [state, setState] = useState(true)

    useEffect(() => {
        console.log(`mount ${name}`)
        return () => console.log(`unmount ${name}`)
    }, [])
    useEffect(() => {
        console.log(`render ${name}`)
    })

    return (
        <>
            <span>Counter { counter } \ Name {name} </span>
            <button onClick={() => setState(!state)}>Change inner state {String(state)}</button>
        </>
    )
})

const WrapperView = ({list, counter, setCounter, short, setShort, inp, setInp, background}: any) => {
    return (
        <div style={{ background: background }}>
            { list.keys.map((key: any) => <InnerView key={key} name={key} counter={counter} />) }
            <input value={inp} onChange={e => setInp(e.target.value) } />
            <button onClick={() => list.add(inp)}>Add list</button>
            <button onClick={() => setCounter(counter + 1)}>+counter</button>
            <button onClick={() => setShort(!short)}>Short</button>
        </div>
    )
}

const TestView = observer(() => {
    const [counter, setCounter] = useState(0)
    const [inp, setInp] = useState('')
    const [list] = useState<MyList>(new MyList())
    const x = list.keys.length

    const [short, setShort] = useState(false)

    if (short) {
        return <WrapperView list={list} counter={counter} setCounter={setCounter} short={short} setShort={setShort} inp={inp} setInp={setInp} background="red" />
    }

    return (
        <WrapperView list={list} counter={counter} setCounter={setCounter} short={short} setShort={setShort} inp={inp} setInp={setInp} background="green" />
    )
})

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainView />} />
                <Route path="/test" element={<TestView />} />
                <Route path="/timer" element={<timer.View />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App