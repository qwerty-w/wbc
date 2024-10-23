import { useState, useRef, useEffect } from "react"
import { makeObservable, observable, action} from 'mobx'
import { observer } from "mobx-react-lite"
import styled from 'styled-components'


export const StyledTextInput = styled.input<{ $invalid?: boolean }>`
    color: ${ props => props.$invalid ? '#E73838' : 'unset' };
`

export class FiltredTextInput {
    value: string
    cursorPos: number

    constructor(public filter: (pos: number, value: string) => { pos: number, value: string },
                public onBlur?: (ev: React.FocusEvent<HTMLInputElement>, input: FiltredTextInput) => void, defaultValue: string = '',
                public isInvalid: boolean = false) {
        this.value = defaultValue
        this.cursorPos = 0
        makeObservable(this, {
            value: observable,
            cursorPos: observable,
            isInvalid: observable,
            setValue: action,
            setCursorPos: action,
            setInvalid: action
        })
    }
    setValue(val: string) {
        this.value = val
    }
    setCursorPos(pos: number) {
        this.cursorPos = pos
    }
    setInvalid(val: boolean) {
        this.isInvalid = val
    }
}

interface IFiltredTextInputProps {
    inp: FiltredTextInput
}

export const FiltredTextInputView = observer(({ inp }: IFiltredTextInputProps) => {
    const ref = useRef<HTMLInputElement>(null)
    const [changed, setChanged] = useState<boolean>(false)

    const toggleChange = () => { setChanged(!changed) }

    useEffect(() => {
        ref.current?.setSelectionRange(inp.cursorPos, inp.cursorPos)
    }, [changed])

    return (
        <StyledTextInput
            ref={ref}
            $invalid={inp.isInvalid}
            type="text"
            value={inp.value}
            onBlur={ev => { if (inp.onBlur) { inp.onBlur(ev, inp) } } }
            onChange={ev => {
                const { pos, value } = inp.filter((ev.target.selectionStart as number), ev.target.value)
                inp.setValue(value)
                inp.setCursorPos(pos)
                toggleChange()
            }}
        />
    )
})

export const BTCamountTextInputView = ({ inp }: IFiltredTextInputProps) => {
    inp.onBlur = (ev, inp) => inp.setValue(String(Number(inp.value)))
    inp.filter = (pos, raw) => {
        let value = ''

        for (let char of raw) {
            if ('0123456789'.includes(char)) {
                value += char
            }
            else if ('.,'.includes(char) && !value.includes('.')) {
                value += '.'
            }
            else {
                --pos
            }
        }

        return { pos, value }
    }
    return <FiltredTextInputView inp={inp} />
}