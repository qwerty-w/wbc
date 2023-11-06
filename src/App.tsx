import React, { PropsWithChildren, useEffect, useRef, useState } from "react"
import { BrowserRouter, Routes, Route, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { observable, computed, action, makeAutoObservable, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import styled, { RuleSet, css, keyframes } from 'styled-components'

import { PopupView, Popup, Item, ItemType } from './popup'
import { CircleTimer, CircleTimerView } from './circle-timer'
import Decimal from "decimal.js"


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
const StyledTimerView = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 60px;
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
        add(undefined)
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

class Test {
    public list: MyList = new MyList()
    public spancolor: string = 'aqua'
    constructor() {
        makeObservable(this, {
            list: observable,
            spancolor: observable,
            toggleSpanColor: action
        })
    }

    toggleSpanColor() {
        this.spancolor = this.spancolor === 'aqua' ? 'lightblue' : 'aqua'
    }
}

const SpanView = observer(({ test, children }: { test: Test } & PropsWithChildren) => {
    console.log('span rerender')
    return <span style={{ color: test.spancolor }}>{ children }</span>
})

const InnerView = observer(({ test, name, counter }: {test: Test, name: string, counter: number}) => {
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
            <SpanView test={test}>{`Counter ${counter} \ Name ${name} `}</SpanView>
            <button onClick={() => setState(!state)}>Change inner state {String(state)}</button>
        </>
    )
})

const WrapperView = ({test, counter, setCounter, short, setShort, inp, setInp, background}: any) => {
    return (
        <div style={{ background: background }}>
            { test.list.keys.map((name: any) => <InnerView key={name} test={test} name={name} counter={counter} />) }
            <input value={inp} onChange={e => setInp(e.target.value) } />
            <button onClick={() => test.list.add(inp)}>Add list</button>
            <button onClick={() => setCounter(counter + 1)}>+counter</button>
            <button onClick={() => setShort(!short)}>Change parrent state</button>
            <button onClick={() => test.toggleSpanColor()}>Toggle span color</button>
        </div>
    )
}

const TestView = observer(() => {
    const [counter, setCounter] = useState(0)
    const [inp, setInp] = useState('')
    const [test] = useState(new Test())
    const x = test.list.keys.length

    const [short, setShort] = useState(false)

    if (short) {
        return <WrapperView test={test} counter={counter} setCounter={setCounter} short={short} setShort={setShort} inp={inp} setInp={setInp} background="red" />
    }

    return (
        <WrapperView test={test} counter={counter} setCounter={setCounter} short={short} setShort={setShort} inp={inp} setInp={setInp} background="green" />
    )
})


export const TimerView = observer(() => {
    const [timerProps, setTimerProps] = useState<any>([34, 0.5, 5, () => {}, false])
    // @ts-ignore
    const [timer, setTimer] = useState(new CircleTimer(...timerProps))
    const [get, set] = useState(15);

    (window as any).timer = timer;
    (window as any).d = Decimal;

    const st = () => {
        var val = get
        setInterval(() => {val--; set(val)}, 1000)
    }

    return (
        <StyledTimerView>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                    <span>Remaining: {timer.remaining}</span>
                </div>

                <button onClick={() => {timer.start(); st()}}>Start</button>
            </div>
            <div style={{ position: 'absolute' }}>
                <CircleTimerView timer={timer} color='black' />
            </div>
            <div>
                <div><span>TT: {get}</span></div>
                <button onClick={() => { timerProps[0]++; setTimerProps(timerProps);
                // @ts-ignore
                setTimer(new CircleTimer(...timerProps)) }}>+1 timer size</button>
                <button onClick={() => { timerProps[1] += 0.5; setTimerProps(timerProps); 
                // @ts-ignore
                setTimer(new CircleTimer(...timerProps)) }}>+0.5 timer stroke</button>
                            <button onClick={() => { timerProps[1] -= 0.5; setTimerProps(timerProps); 
                // @ts-ignore
                setTimer(new CircleTimer(...timerProps)) }}>-0.5 timer stroke</button>
            </div>
            
        </StyledTimerView>
    )
})

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainView />} />
                <Route path="/test" element={<TestView />} />
                <Route path="/timer" element={<TimerView />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App