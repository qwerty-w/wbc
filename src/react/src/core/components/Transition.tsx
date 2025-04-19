import { useEffect, ReactElement } from 'react'
import { observable, action, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'

export enum TransitionState {
    DEFAULT = 'DEFAULT',
    ENTER = 'ENTER',
    ENTERING = 'ENTERING',
    ENTERED = 'ENTERED'
}

export class Transition {
    public state: TransitionState = TransitionState.DEFAULT
    public started: boolean = false

    constructor() {
        makeObservable(this, {
            started: observable,
            state: observable,
            start: action,
            reset: action,
            setState: action
        })
    }
    start() {
        if (this.started) return
        this.started = true
        this.state = TransitionState.ENTER
    }
    reset() {
        this.started = false
        this.state = TransitionState.DEFAULT
    }
    setState(state: TransitionState) {
        this.state = state
    }
}

type TransitionProps = {
    transition: Transition,
    timeout: number,
    callback: (state: TransitionState) => ReactElement
}

export const TransitionView = observer(({ transition, timeout, callback }: TransitionProps) => {
    useEffect(() => {
        if (transition.started) {
            setTimeout(() => {
                transition.setState(TransitionState.ENTERING)
                setTimeout(() => transition.setState(TransitionState.ENTERED), timeout)
            }, 10)
        }
    }, [transition, transition.started])

    return callback(transition.state)
})