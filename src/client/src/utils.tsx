import { useState, useRef, useEffect } from "react"
import { makeObservable, observable, computed, action, IObservableFactory, IComputedFactory, IActionFactory } from 'mobx'


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
    add(value: T) {
        this.arr.push(value)
    }
    extend(iter: Iterable<T>) {
        this.arr = [...this.arr, ...iter]
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
    return num * 10 ** 8
}

export function toBitcoins(num: number) {
    return num / 10 ** 8
}

export async function setBuffer(text: any) {
    await navigator.clipboard.writeText(text)
}

export interface IFiltredInputStateInstance {
    currentValue: string,
    isInvalid: boolean
}

export interface IFiltredInputState {
    ins: IFiltredInputStateInstance,
    set: React.Dispatch<React.SetStateAction<IFiltredInputStateInstance>>
}

interface FiltredInputProps {
    filter: (pos: number, value: string) => { pos: number, value: string },
    state: IFiltredInputState,
    onBlur?: (value: string) => string,
    defaultValue?: string
}

export function FiltredInput({ filter, state, onBlur, defaultValue = '' }: FiltredInputProps) {
    const ref = useRef<HTMLInputElement>(null)
    const [value, setValue] = useState<string>(defaultValue)
    const [cursorPos, setCursorPos] = useState<number | null>(null)
    const [wasChanged, setWasChanged] = useState<boolean>(false)

    const toggleChange = () => { setWasChanged(!wasChanged) }

    useEffect(() => {
        if (cursorPos === null) { 
            return
        }
        ref.current?.setSelectionRange(cursorPos, cursorPos)
    }, [wasChanged])
    useEffect(() => state.set({ ...state.ins, currentValue: value }), [value])
 
    return (
        <input
            ref={ref}
            className={state.ins.isInvalid ? 'invalid' : undefined}
            type="text"
            value={value}
            onBlur={ev => {
                if (onBlur) {
                    setValue(onBlur(ev.target.value))
                }
            }}
            onChange={ev => {
                const { pos, value } = filter((ev.target.selectionStart as number), ev.target.value)
                setValue(value)
                setCursorPos(pos)
                toggleChange()
            }}
        /> 
    )
}

interface BTCamountInputProps {
    state: IFiltredInputState,
    defaultValue: string
}

export function BTCamountInput({ state, defaultValue }: BTCamountInputProps) {
    return <FiltredInput filter={(pos, raw) => { 
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
     }} onBlur={val => String(Number(val))} state={state} defaultValue={defaultValue}/>
}