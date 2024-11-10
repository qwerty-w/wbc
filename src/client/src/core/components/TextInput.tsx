import { useState, useRef, useEffect } from "react"
import { makeObservable, observable, action} from 'mobx'
import { observer } from "mobx-react-lite"
import styled from 'styled-components'
import { isDigitChar, isSingleChar, removeChar } from "../utils/utils"


export const StyledTextInput = styled.input<{ $invalid?: boolean }>`
    color: ${ props => props.$invalid ? '#E73838' : 'unset' };
`

interface IFilteredTextInputParams {
    oninput?: (value: string, cursorPos: number, e: React.ChangeEvent<HTMLInputElement>) => { value: string, cursorPos?: number }
    onblur?: (e: React.FocusEvent<HTMLInputElement>) => void
    defvalue?: string
    invalid?: boolean
}

export class FilteredTextInput {
    public oninput: IFilteredTextInputParams['oninput']
    public onblur: IFilteredTextInputParams['onblur']
    public value: string
    public cursorPos: number
    public invalid: boolean
    // need only for useEffect after every onChange() event
    // (for setSelectionRange)
    public changed: boolean

    constructor(
        {
            oninput,
            onblur,
            defvalue,
            invalid
        }: IFilteredTextInputParams = {}
    ) {
        this.oninput = oninput
        this.onblur = onblur
        this.value = defvalue || ''
        this.cursorPos = 0
        this.invalid = invalid || false
        this.changed = false
        makeObservable(this, {
            value: observable,
            cursorPos: observable,
            invalid: observable,
            changed: observable,
            setValue: action,
            setCursorPos: action,
            setInvalid: action,
            toggleChanged: action
        })
    }
    setValue(v: string) {
        this.value = v
    }
    setCursorPos(pos: number) {
        this.cursorPos = pos
    }
    setInvalid(val: boolean) {
        this.invalid = val
    }
    toggleChanged() {
        this.changed = !this.changed
    }
}

export const useFiltredTextInputRef = (): React.MutableRefObject<FilteredTextInput | undefined> => {
    return useRef<FilteredTextInput>()
}

type FilteredTextInputRef = React.MutableRefObject<FilteredTextInput | null | undefined>

interface IFilteredTextInputViewProps extends IFilteredTextInputParams {
    inputRef?: FilteredTextInputRef
}

export const FilteredTextInputView = observer((props: IFilteredTextInputViewProps) => {
    const elementRef = useRef<HTMLInputElement>(null)
    const [input] = useState<FilteredTextInput>(new FilteredTextInput(props))
    if (props.inputRef && !props.inputRef.current) props.inputRef.current = input

    useEffect(() => {
        elementRef.current?.setSelectionRange(input.cursorPos, input.cursorPos)
    }, [input.changed])

    return (
        <StyledTextInput
            ref={elementRef}
            $invalid={input.invalid}
            type="text"
            value={input.value}
            onBlur={input.onblur}
            onChange={e => {
                input.toggleChanged()
                var [value, cursorPos]: [string, number | undefined] = [e.target.value, e.target.selectionStart || 0]
                if (input.oninput) var { value, cursorPos } = input.oninput(value, cursorPos, e)
                input.setValue(value)
                input.setCursorPos(cursorPos || value.length)
            }}
        />
    )
})

interface PropsWithOnlyFilteredTextInputRef {
    inputRef?: FilteredTextInputRef
}

export const BitcoinAmountTextInputView = ({ inputRef }: PropsWithOnlyFilteredTextInputRef) => {
    return <FilteredTextInputView
        oninput={(value, cursorPos) => {
            if (!value) return { value, cursorPos }
            const index = cursorPos - 1
            const char = value[index]
            var skip = true

            if (char == '.' || char == ',') skip = !isSingleChar(value, index)
            else if (isDigitChar(char)) skip = false

            if (skip) {
                value = removeChar(value, index)
                cursorPos = index
            }
            return { value, cursorPos }
        }}
        onblur={e => inputRef?.current?.setValue(String(Number(inputRef.current.value)))}
        defvalue="0"
        inputRef={inputRef}
    />
}