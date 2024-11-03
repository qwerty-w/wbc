import { makeObservable, observable, action} from 'mobx'


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