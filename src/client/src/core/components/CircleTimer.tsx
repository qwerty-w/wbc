import React, { PropsWithChildren } from 'react'
import { observable, action, computed, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'
import Decimal from 'decimal.js'


type StyledCircleProps = {
    $center: number,
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
        cx: props.$center,
        cy: props.$center,
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
        width: props.$size,
        height: props.$size
    }
})`
    transform: rotate(-90deg) rotateX(180deg);
`


export class CircleTimer {
    public ms: number
    public radius: number
    public circumference: Decimal
    public offset: Decimal
    public interval?: NodeJS.Timeout

    public passed = new Decimal(0)
    public frequency = 10
    public started = false

    constructor(public size: number, public strokeWidth: number, public seconds: number, public onend?: (timer: CircleTimer) => void, public resettable: boolean = true ) {
        this.ms = seconds * 1000
        this.radius = (size - strokeWidth) / 2
        this.circumference = new Decimal(size).mul(Math.PI)
        this.offset = this.circumference.div(this.ms).mul(this.frequency)

        makeObservable(this, {
            passed: observable,
            started: observable,
            remaining: computed,
            pass: action,
            start: action,
            stop: action,
            reset: action
        })
    }
    get remaining() {
        return this.seconds - Math.trunc(+this.passed.div(this.offset).mul(this.frequency).div(1000))
    }
    pass() {
        this.passed = this.passed.add(this.offset)
    }
    start() {
        if (this.started) return

        this.started = true
        this.interval = setInterval(() => {
            this.pass()

            if (+this.passed >= +this.circumference) {
                if (this.onend) this.onend(this)
                this[this.resettable ? 'reset' : 'stop']()
            }
        }, this.frequency)
    }
    stop() {
        this.started = false
        if (this.interval) clearInterval(this.interval)
    }
    reset() {
        this.stop()
        this.passed = new Decimal(0)
    }
}

type CircleTimerViewProps = PropsWithChildren & {
    timer: CircleTimer,
    color: string
}
export const CircleTimerView = observer(({ timer, color }: CircleTimerViewProps) => {
    return (
        <StyledCircleSVG $size={timer.size}>
            <StyledCircle $center={timer.size / 2} $r={timer.radius} $circumference={+timer.circumference} $passed={+timer.passed} $strokeColor={color} $strokeWidth={timer.strokeWidth + 'px'} />
        </StyledCircleSVG>
    )
})