import { useContext, useState } from 'react'
import { observable, action, computed, makeObservable, makeAutoObservable } from 'mobx'
import { observer } from 'mobx-react-lite'

import { Container } from '../../core/utils/Container'
import { toBitcoins, wrapString } from '../../core/utils/Utils'
import { FiltredTextInput, BTCamountTextInputView } from '../../core/components/TextInput'
import { ContextMenuItem, ContextMenuDivider, ContextMenuView } from '../../core/components/ContextMenu'
import { GlobalStore } from '../TransactionCreator'
import * as styled from '../styles/styled-creator'


abstract class IO {
    abstract amount: number
    observance = {
        amount: observable,
        bitcoinsAmount: computed,
    }

    get bitcoinsAmount() {
        return toBitcoins(this.amount)
    }
}

interface IInput {
    txid: string,
    amount: number
}

interface IOutput {
    address: string,
    amount: number
}

export class Input extends IO implements IInput {
    constructor(public txid: string, public amount: number) {
        super()
        makeObservable(this, this.observance)
        this.txid = txid
        this.amount = amount
    }
}

export class Output extends IO implements IOutput {
    constructor(public address: string, public amount: number) {
        super()
        makeObservable(this, {
            ...this.observance,
            changeAmount: action
        })
        this.address = address
        this.amount = amount
    }
    changeAmount(value: number) {
        this.amount = value
    }
}

export class Creator {
    inps: Container<Input>
    outs: Container<Output>
    fee: number
    locktime: number
    version: number
    isSegwit: boolean

    constructor() {
        makeAutoObservable(this)
        this.inps = new Container('txid')
        this.outs = new Container('address')

        // default values
        this.fee = 0.0008  // fee by default
        this.locktime = 0
        this.version = 2
        this.isSegwit = true  // fixme
    }
    private iosum(io: Container<IO>) {
        return io.arr.reduce((p: number, n: IO) => p + n.amount, 0)
    }
    get totalIn() {
        return this.iosum(this.inps)
    }
    get totalOut() {
        return this.iosum(this.outs)
    }
    get remainder() {
        return this.totalIn - this.totalOut
    }
    setFee(value: number) {
        this.fee = value
    }
    setLocktime(value: number) {
        this.locktime = value
    }
    setVersion(value: number) {
        this.version = value
    }
}

const InputView = observer(({ txid, amount }: IInput) => {
    const { inps } = useContext(GlobalStore).creator
    return (
        <ContextMenuView items={
            <>
                <ContextMenuItem name='Remove input' onClick={ev => { inps.remove(txid) }} />
            </>
        }>
            <styled.Input>
                <styled.ioID as='div'>
                    <styled.ioID $label>ID: </styled.ioID>
                    <styled.ioID>{wrapString(txid)}</styled.ioID>
                </styled.ioID>
                <styled.ioAmount>{toBitcoins(amount)}</styled.ioAmount>
            </styled.Input>
        </ContextMenuView>
    )
})

const OutputView = observer(({ address, amount }: IOutput) => {
    const { modals: { newout }, creator: { outs } } = useContext(GlobalStore)

    return (
        <ContextMenuView items={
            <>
                <ContextMenuItem  name="Remove output" onClick={ ev => { outs.remove(address) } } />
                <ContextMenuDivider/>
                <ContextMenuItem  name="Add new output" onClick={ ev => { newout.show() } } />
            </>
        }>
            <styled.Output>
                <styled.ioID as='div'>
                    <styled.ioID $label>Address: </styled.ioID>
                    <styled.ioID>{wrapString(address)}</styled.ioID>
                </styled.ioID>
                <styled.ioAmount>{toBitcoins(amount)}</styled.ioAmount>
            </styled.Output>
        </ContextMenuView>
    )
})

const CreatorTop = observer(() => {
    const { modals: { newout }, creator: { inps, outs } } = useContext(GlobalStore)
    return (
        <styled.Top>
            <ContextMenuView items={
                <>
                    <ContextMenuItem name='Clear all' onClick={() => inps.clear()} />
                </>
            }>
                <styled.TopSide>
                    <styled.TopSideLabel>Inputs</styled.TopSideLabel>
                    <styled.ioItems>
                        {

                            inps.arr.map(inp => <InputView key={inp.txid} txid={inp.txid} amount={inp.amount} />)
                        }
                    </styled.ioItems>
                </styled.TopSide>
            </ContextMenuView>
            <styled.VerticalLine />
            <ContextMenuView items={
                <>
                    <ContextMenuItem  name="Add new output" onClick={ ev => { newout.show() } } />
                </>
            }>
                <styled.TopSide>
                    <styled.TopSideLabel>Outputs</styled.TopSideLabel>
                    <styled.ioItems>
                        {
                            outs.arr.map(out => <OutputView key={out.address} address={out.address} amount={out.amount} />)
                        }
                    </styled.ioItems>
                </styled.TopSide>
            </ContextMenuView>
        </styled.Top>
    )
})

const CreatorBot = observer(() => {
    const state = useContext(GlobalStore).creator
    const [fee] = useState(new FiltredTextInput((pos, value) => {return {pos, value}}, undefined, '0.0008'))

    const create = () => {
        fee.setInvalid(true)
    }

    return (
        <styled.BottomBlock>
            <styled.Bottom>
                <styled.BottomRow>
                    <styled.BottomItem>
                        <input type="number" defaultValue="0" placeholder='0' min="0" />
                        <styled.BottomLabel>Locktime</styled.BottomLabel>
                    </styled.BottomItem>
                    <styled.BottomItem>
                        <styled.BottomCentralValue>{toBitcoins(state.remainder)}</styled.BottomCentralValue>
                        <styled.BottomLabel>Remainder</styled.BottomLabel>
                    </styled.BottomItem>
                    <styled.BottomItem>
                        <BTCamountTextInputView inp={fee} />
                        <styled.BottomLabel>Fee</styled.BottomLabel>
                    </styled.BottomItem>
                </styled.BottomRow>
                <styled.BottomRow>
                    <styled.BottomItem>
                        <input type="number" defaultValue="2" placeholder="2" min="0" />
                        <styled.BottomLabel>Version</styled.BottomLabel>
                    </styled.BottomItem>
                    <styled.BottomItem>
                        <styled.BottomCentralValue>{toBitcoins(state.totalIn)}</styled.BottomCentralValue>
                        <styled.BottomLabel>Total</styled.BottomLabel>
                    </styled.BottomItem>
                    <styled.ContinueButton onClick={() => { create() }} $width='59px' $height='22px' $borderRadius='60px' $fontSize='10px' $text='Create' />
                </styled.BottomRow>
            </styled.Bottom>
        </styled.BottomBlock>
    )
})

export const CreatorView = () => {
    return (
        <styled.Creator>
            <CreatorTop />
            <styled.HorizontalLine />
            <CreatorBot />
        </styled.Creator>
    )
}