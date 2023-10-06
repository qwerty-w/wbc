import { useState, useRef, useEffect } from "react"
import { makeObservable, observable, action} from 'mobx'
import { observer } from "mobx-react-lite"
import Decimal from "decimal.js"

import { StyledInput } from "./screen"


export class Container<T extends Record<string, any>> {
    arr: T[] = []

    constructor(public keyprop: string, iter?: Iterable<T>) {
        makeObservable(this, {
            arr: observable,
            add: action,
            extend: action,
            remove: action,
            clear: action
        })
        if (iter) {
            this.extend(iter)
        }
    }
    get count() {
        return this.arr.length
    }
    get(bykey: any) {
        return this.arr.find(item => item[this.keyprop] == bykey)
    }
    has(bykey: any) {
        return this.get(bykey) !== undefined
    }
    isEmpty() {
        return this.arr.length === 0
    }
    add(item: T) {
        if (!this.has(item[this.keyprop])) {
            this.arr.push(item)
        }
    }
    extend(iter: Iterable<T>) {
        for (let item of iter) {
            this.add(item)
        }
    }
    remove(bykey: any) {
        this.arr = this.arr.filter(item => item[this.keyprop] != bykey)
    }
    clear() {
        this.arr = []
    }
}

export function zeroFill(val: string | number, length: number = 2): string {
    return String(val).padStart(length, '0')
}

export function formateDate(s_timestamp: number) {
    let ms_timestamp = s_timestamp * 1000
    var date = new Date(ms_timestamp)
    return `${zeroFill(date.getDay())}.${zeroFill(date.getMonth())}.${date.getFullYear()}, ${zeroFill(date.getHours())}:${zeroFill(date.getMinutes())}:${zeroFill(date.getSeconds())}`
}

export function wrapString(str: string, letters: number = 4) {
    if (str.length > letters * 2) {
        return str.slice(0, letters) + '-' + str.slice(-letters)
    }
    return str
}

export function toSatoshis(num: number) {
    return new Decimal(num).mul(10 ** 8).toNumber()
}

export function toBitcoins(num: number) {
    return new Decimal(num).div(10 ** 8).toNumber()
}

export async function setBuffer(text: any) {
    await navigator.clipboard.writeText(text)
}

export class FiltredInput {
    value: string
    cursorPos: number

    constructor(public filter: (pos: number, value: string) => { pos: number, value: string },
                public onBlur?: (ev: React.FocusEvent<HTMLInputElement>, input: FiltredInput) => void, defaultValue: string = '',
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

interface IFiltredInputProps {
    inp: FiltredInput
}

export const FiltredInputView = observer(({ inp }: IFiltredInputProps) => {
    const ref = useRef<HTMLInputElement>(null)
    const [changed, setChanged] = useState<boolean>(false)

    const toggleChange = () => { setChanged(!changed) }

    useEffect(() => {
        ref.current?.setSelectionRange(inp.cursorPos, inp.cursorPos)
    }, [changed])
 
    return (
        <StyledInput
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

export const BTCamountInputView = ({ inp }: IFiltredInputProps) => {
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
    return <FiltredInputView inp={inp} />
}