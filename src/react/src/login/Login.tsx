import React, { useState } from "react";
import styled from "styled-components";
import { FilteredTextInputView, useFiltredTextInputRef } from "../core/components/TextInput";
import { StyledContinueButton } from "../core/components/ContinueButton";

const StyledLogin = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
`
const StyledLoginWindow = styled.div`
    width: 500px;
    height: 240px;
    border-radius: 9px;
    background: #fff;
    margin-top: 17%;
`
const StyledTextInputDiv = styled.div`
    & input {
        background-color: #f2f2f2;
        width: 400px;
        height: 50px;
        border-radius: 7px;
    }
`


export const LoginWindowView = () => {
    const usernameRef = useFiltredTextInputRef()
    const [password, setPassword] = useState<string>()
    return (
        <StyledLogin>
            <StyledLoginWindow>
            <div>
                <StyledTextInputDiv>
                    <FilteredTextInputView inputRef={usernameRef}/>
                </StyledTextInputDiv>
                <StyledTextInputDiv>
                    <input value={password} onChange={e => setPassword(e.target.value)}/>
                </StyledTextInputDiv>
            </div>
                <StyledContinueButton $width="100px" $height="35px" $borderRadius="10px" $fontSize="14px" $text="Continue"/>
            </StyledLoginWindow>
        </StyledLogin>
    )
}