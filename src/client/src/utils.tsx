

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