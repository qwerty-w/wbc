import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { BrowserRouter, Routes, Route, useNavigate, Outlet, useLocation } from 'react-router-dom'
import { observable, computed, action, makeAutoObservable, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import styled, { css } from 'styled-components'

import { MainView } from './popup'


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