import React, { PropsWithChildren } from 'react'
import { observable, action, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'


type StyledCircleProps = {
    $r: number,
    $circumference: number,
    $passed: number,
    $strokeColor: string,
    $strokeWidth: string
    $fillColor?: string,
}
const StyledCircle = styled.circle.attrs<StyledCircleProps>(props => {
    return {
        r: props.$r,
        cx: props.$r,
        cy: props.$r,
        strokeDasharray: props.$circumference,
        strokeDashoffset: props.$passed,
        strokeLinecap: 'round',
        style: {
            stroke: props.$strokeColor,
            strokeWidth: props.$strokeWidth,
            fill: props.$fillColor || 'none',
        }
    }
})`
`
const StyledCircleSVG = styled.svg.attrs<{ $size: number }>(props => {
    return {
        width: props.$size + 'px',
        height: props.$size + 'px',
        viewBox: `0 0 ${props.$size} ${props.$size}`
    }
})`
    transform: rotate(-90deg) rotateX(180deg);
`


export class CircleTimer {
    public ms: number
    public radius: number
    public circumference: number
    public offset: number

    public passed = 0
    public frequency = 10
    public started = false

    constructor(public size: number, public seconds: number, public onend?: CallableFunction, public keepPassed: boolean = false) {
        this.ms = seconds * 1000
        this.radius = size / 2
        this.circumference = size * Math.PI
        this.offset = this.circumference / this.ms * this.frequency

        makeObservable(this, {
            passed: observable,
            started: observable,
            remaining: computed,
            pass: action,
            start: action,
            reset: action
        })
    }
    get remaining() {
        return this.seconds - Math.trunc(this.passed / this.offset * this.frequency / 1000)
    }
    pass() {
        this.passed += this.offset
    }
    start() {
        if (this.started) return

        this.started = true
        const interval = setInterval(() => {
            this.pass()

            if (this.passed >= this.circumference) {
                clearInterval(interval)
                if (this.onend) this.onend()
                this.reset()
            }
        }, this.frequency)
    }
    reset() {
        this.started = false
        if (!this.keepPassed) { this.passed = 0 }
    }
}

type CircleTimerViewProps = PropsWithChildren & {
    timer: CircleTimer,
    color: string,
    strokeWidth: string,
}
export const CircleTimerView = observer(({ timer, color, strokeWidth }: CircleTimerViewProps) => {
    return (
        <StyledCircleSVG $size={timer.size}>
            <StyledCircle $r={timer.radius} $circumference={timer.circumference} $passed={timer.passed} $strokeColor={color} $strokeWidth={strokeWidth} />
        </StyledCircleSVG>
    )
})
