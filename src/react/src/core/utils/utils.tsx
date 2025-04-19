import Decimal from "decimal.js"


const NumberFormatter = Intl.NumberFormat('en', { notation: 'compact', minimumFractionDigits: 1, maximumFractionDigits: 1 })
const Base58Regexp = new RegExp(/^[1-9ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/)


export function formatSatoshis(v: number) {
    return v < 1000 ? String(v) : NumberFormatter.format(v)
}

export function zeroFill(val: string | number, length: number = 2): string {
    return String(val).padStart(length, '0')
}

export const isDigitChar = (char: string): boolean => '0123456789'.includes(char)

export function isSingleChar(v: string, index: number): boolean {
    for (let i = 0; i < index; i++) {
        if (v[i] == v[index]) return false
    }
    for (let i = index + 1; i < v.length; i++) {
        if (v[i] == v[index]) return false
    }
    return true
}

export function formateDate(secTimestamp: number) {
    let msTimestamp = secTimestamp * 1000
    var date = new Date(msTimestamp)
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

export async function setClipboard(text: any) {
    await navigator.clipboard.writeText(text)
}

export function isBase58String(str: string): boolean {
    return Base58Regexp.test(str)
}

export function removeChar(str: string, index: number): string {
    return str.substring(0, index) + str.substring(index + 1, str.length)
}