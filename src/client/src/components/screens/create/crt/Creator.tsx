import './Creator.css'
import { useContext, useState } from 'react'
import { observer } from 'mobx-react-lite'
import { observable, action, computed, makeObservable, makeAutoObservable } from 'mobx'
import { ContextMenuItem, ContextMenuDivider, ContextMenu } from '../../common/context-menu/contextmenu'
import { Container, wrapString, toBitcoins, BTCamountInput, IFiltredInputStateInstance, IFiltredInputState } from '../../../../utils'
import { NewOutputContext } from '../new-output/NewOutput'
import { GlobalStateContext } from '../Create'

export { Input, Output, Creator, CreatorState }


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

class Input extends IO implements IInput {
    constructor(public txid: string, public amount: number) {
        super()
        makeObservable(this, this.observance)
        this.txid = txid
        this.amount = amount
    }
}

class Output extends IO implements IOutput {
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

class CreatorState {
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
    const { inps } = useContext(GlobalStateContext).creator
    return (
        <ContextMenu items={
            <>
                <ContextMenuItem name='Remove input' onClick={ev => { inps.remove(txid) }} />
            </>
        }>
            <div className="crt__ios">
                <div className="crt__input crt__io">
                    <div className="transaction__id">
                        <span className="transaction__id-label">ID:</span>&nbsp;
                        <span className="transaction__id-value">{wrapString(txid)}</span>
                    </div>
                    <div className="crt__io-amount">{toBitcoins(amount)}</div>
                </div>
            </div>
        </ContextMenu>
    )
})

const OutputView = observer(({ address, amount }: IOutput) => {
    const { outs } = useContext(GlobalStateContext).creator
    const { setIsShowed } = useContext(NewOutputContext)

    return (
        <ContextMenu items={
            <>
                <ContextMenuItem  name="Remove output" onClick={ ev => { outs.remove(address) } } />
                <ContextMenuDivider/>
                <ContextMenuItem  name="Add new output" onClick={ ev => { setIsShowed(true) } } />
            </>
        }>
            <div className="crt__output crt__io">
                <div className="crt__output-address">
                    <span className="crt__output-address-label">Address:</span>&nbsp;
                    <span className="crt__output-address-value">{ wrapString(address) }</span>
                </div>
                <div className="crt__io-amount">{toBitcoins(amount)}</div>
            </div>
        </ContextMenu>
    )
})

const CreatorTop = observer(() => {
    const { inps, outs } = useContext(GlobalStateContext).creator
    const setNewOutputIsShowed = useContext(NewOutputContext).setIsShowed
    return (
        <div className="crt__top">
            <div className="crt__top-left">
                <span className="crt__io-label">Inputs</span>
                <div className="crt__ios">
                    {

                        inps.arr.map(inp => <InputView key={inp.txid} txid={inp.txid} amount={inp.amount} />)
                    }
                </div>
            </div>
            <div className="crt__top-vline"></div>
            <ContextMenu items={
                <>
                    <ContextMenuItem  name="Add new output" onClick={ ev => { setNewOutputIsShowed(true) } } />
                </>
            }>
                <div className="crt__top-right">
                    <span className="crt__io-label">Outputs</span>
                    <div className="crt__ios">
                        {
                            outs.arr.map(out => <OutputView key={out.address} address={out.address} amount={out.amount} />)
                        }
                    </div>
                </div>
            </ContextMenu>
        </div>
    ) 
})

interface IFeeProps {
    state: IFiltredInputState
}

const Fee = ({ state }: IFeeProps) => {
    return <BTCamountInput state={state} defaultValue='0.0008'/>
}

const CreatorBot = observer(() => {
    const state = useContext(GlobalStateContext).creator
    const [feeState, setFeeState] = useState<IFiltredInputStateInstance>({ currentValue: String(), isInvalid: false })

    const create = () => {
        state.inps.add(new Input('saflafs', 21040))
        state.outs.add(new Output('saflafs', 31040))
        setFeeState({ ...feeState, isInvalid: true })
    }

    return (
        <div className="crt__bot">
            <div className="crt__bot-block segwit-lock">
                <div className="crt__bot-row">
                    <div className="crt__bot-item">
                        <input name="crt__locktime" type="number" defaultValue="0" placeholder='0' min="0" />
                        <span className="crt__bot-label">Locktime</span>
                    </div>
                    <div className="crt__bot-item">
                        <span id="crt__remainder">{toBitcoins(state.remainder)}</span>
                        <span className="crt__bot-label">Remainder</span>
                    </div>
                    <div className="crt__bot-item">
                        <Fee state={{ ins: feeState, set: setFeeState }}/>
                        <span className="crt__bot-label">Fee</span>
                    </div>
                </div>
                <div className="crt__bot-row">
                    <div className="crt__bot-item">
                        <input name="crt__version" type="number" defaultValue="2" placeholder="2" min="0" />
                        <span className="crt__bot-label">Version</span>
                    </div>
                    <div className="crt__bot-item">
                        <span id="crt__total">{toBitcoins(state.totalIn)}</span>
                        <span className="crt__bot-label">Total available</span>
                    </div>
                    <button id="crt__create-btn" onClick={() => { create() }}>
                        <span>Create</span>
                    </button>
                </div>
            </div>
        </div>
    )
})

const Creator = () => {
    return (
        <div className="crt">
            <CreatorTop />
            <div className="crt__hline"></div>
            <CreatorBot />
        </div>
    )
}