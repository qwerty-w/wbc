import { getHeadBlock } from "../api/explorer"
import { action, makeObservable, observable } from "mobx"


export class HeadBlock {
    constructor(public height: number = -1) {
        makeObservable(this, {
            height: observable,
            update: action
        })
        this.update()
    }

    update(height?: number) {
        if (height) {
            this.height = height
            return
        }
        getHeadBlock().then(height => this.height = height)
    }
}

export const head = new HeadBlock();
(window as any).head = head