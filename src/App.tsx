import React, { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { BrowserRouter, Routes, Route, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { observable, computed, action, makeAutoObservable, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import styled, { css, keyframes } from 'styled-components'

import { PopupView, Popup, Item, ItemType } from './popup'


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
    const [armCounter, setArmCounter] = useState(0)
    const addRemove = () => {
        add(undefined)
        // add(undefined)
        // add(undefined)
        popup.remove()
        setArmCounter(armCounter + 1)
        console.log('pressed:', armCounter)
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

const App = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainView />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App