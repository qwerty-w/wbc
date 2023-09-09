import { useState, useRef, useEffect } from "react"


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

export async function setBuffer(text: string) {
    await navigator.clipboard.writeText(text)
}

interface FiltredInputProps {
    filter: (pos: number, value: string) => { pos: number, value: string },
    onBlur: (value: string) => string
    defval?: string
}

export function FiltredInput({ filter, onBlur, defval = '' }: FiltredInputProps) {
    const ref = useRef<HTMLInputElement>(null)
    const [value, setValue] = useState<string>(defval)
    const [cursorPos, setCursorPos] = useState<number | null>(null)
    const [wasChanged, setWasChanged] = useState<boolean>(false)

    const toggleChange = () => { setWasChanged(!wasChanged) }
    
    useEffect(() => {
        if (cursorPos === null) { 
            return
        }

        ref.current?.setSelectionRange(cursorPos, cursorPos)
    }, [wasChanged])

    return (
        <input
            ref={ref}
            type="text"
            value={value}
            onBlur={ev => { setValue(onBlur(ev.target.value)) }}
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
    defval?: string
}

export function BTCamountInput({ defval = '' }: BTCamountInputProps) {
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
     }} onBlur={val => String(Number(val))} defval={defval} />
}