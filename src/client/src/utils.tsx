

export function wrapString(str: string, letters: number = 4) {
    return str.slice(0, letters) + '-' + str.slice(-letters)
}

export function toSatoshis(num: number) {
    return num * 10 ** 8
}

export function toBitcoins(num: number) {
    return num / 10 ** 8
}