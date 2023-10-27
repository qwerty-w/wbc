import React, { useEffect, useState } from 'react'
import { observable, action, computed, makeAutoObservable, makeObservable } from 'mobx'
import { observer } from 'mobx-react-lite'
import styled from 'styled-components'


const StyledMain = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 22px;
`
const StyledTimer = styled.div<{ $width: string, $height: string }>`
    position: relative;
    width: ${props => props.$width};
    height: ${props => props.$height};
`
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
})``
const StyledCircleSVG = styled.svg`
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: visible;
    transform: rotateY(-180deg) rotateZ(-90deg);
`


export class CircleTimer {
    public ms: number
    public radius: number
    public circumference: number
    public offset: number

    public passed = 0
    public frequency = 10
    public started = false

    constructor(public size: number, public seconds: number) {
        this.ms = seconds * 1000
        this.radius = size / 2
        this.circumference = size * Math.PI
        this.offset = this.circumference / this.ms * this.frequency

        makeObservable(this, {
            passed: observable,
            started: observable,
            remaining: computed,
            start: action,
            reset: action
        })
    }
    get remaining() {
        return this.seconds - Math.trunc(this.passed / this.offset * this.frequency / 1000)
    }
    start() {
        if (this.started) return

        this.started = true
        const interval = setInterval(() => {
            this.passed += this.offset

            if (this.passed >= this.circumference) {
                clearInterval(interval)
                this.reset()
            }
        }, this.frequency)
    }
    reset() {
        this.started = false
        this.passed = 0
    }
}

type CircleTimerViewProps = {
    timer: CircleTimer,
    color: string,
    strokeWidth: string
}
export const CircleTimerView = observer(({ timer, color, strokeWidth }: CircleTimerViewProps) => {
    return (
        <StyledTimer $width={timer.size + 'px'} $height={timer.size + 'px'}>
            <StyledCircleSVG>
                <StyledCircle $r={timer.radius} $circumference={timer.circumference} $passed={timer.passed} $strokeColor={color} $strokeWidth={strokeWidth} />
            </StyledCircleSVG>
        </StyledTimer>
    )
})

export const View = observer(() => {
    const [timer] = useState(new CircleTimer(10, 10))
    const [tts, set] = useState(10)

    const st = () => {
        var tt = 9
        setInterval(() => set(tt--), 1000)
    }

    return (
        <StyledMain>
            <div style={{ display: 'flex', gap: '20px' }}>
                <div>
                    <span>Remaining: {timer.remaining}</span>
                </div>

                <button onClick={() => {timer.start(); st()}}>Start</button>
            </div>
            <CircleTimerView timer={timer} color='black' strokeWidth='0.5px' />
            <div><span>TT: {tts}</span></div>
        </StyledMain>
    )
})