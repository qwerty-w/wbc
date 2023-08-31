import './Creator.css'
import { useState, useContext } from 'react'
import { ContextMenuItem, ContextMenu, IContextMenuPos } from '../../common/context-menu/contextmenu'
import { InputsContext, OutputsContext } from './context'
import { wrapString, toBitcoins } from '../../../../utils'

export type { IInput, IOutput }
export { Creator }

interface IInput {
    txid: string,
    amount: number
}

interface IOutput {
    address: string,
    amount: number
}

function Input({ txid, amount }: IInput) {
    return (
        <div className="crt__ios">
            <div className="crt__input crt__io">
                <div className="transaction__id">
                    <span className="transaction__id-label">ID:</span>&nbsp;
                    <span className="transaction__id-value">{wrapString(txid)}</span>
                </div>
                <div className="crt__io-amount">{toBitcoins(amount)}</div>
            </div>
        </div>
    )
}

function Output({ address, amount }: IOutput) {
    return (
        <div className="crt__ios">
            <div className="crt__output crt__io">
                <div className="crt__output-address">
                    <span className="crt__output-address-label">Address:</span>&nbsp;
                    <span className="crt__output-address-value">{wrapString(address)}</span>
                </div>
                <div className="crt__io-amount">{toBitcoins(amount)}</div>
            </div>
        </div>
    )
}

interface ICreatorTopProps {
    inps: IInput[],
    outs: IOutput[]
}

function CreatorTop({ inps, outs }: ICreatorTopProps) {
    return (
        <div className="crt__top">
            <div className="crt__top-left">
                <span className="crt__io-label">Inputs</span>
                {inps.map(Input)}
            </div>
            <div className="crt__top-vline"></div>
            <div className="crt__top-right">
                <span className="crt__io-label">Outputs</span>
                {outs.map(Output)}
            </div>
        </div>
    )
}

function Fee() {
    const [fee, setFee] = useState('0.0008')
    return (
        <input
            type="text"
            value={fee}
            onBlur={e => {
                if (!e.target.value) {
                    return e.target.value
                }
                setFee(String(Number(e.target.value)))
            }}
            onChange={e => {
                let val = ''
                for (let letter of e.target.value) {
                    if ('0123456789'.includes(letter)) {
                        val += letter
                    }
                    else if ('.,'.includes(letter) && !val.includes('.')) {
                        val += '.'
                    }
                }

                setFee(val)
            }}
        />
    )
}

function CreatorBot() {
    return (
        <div className="crt__bot">
            <div className="crt__bot-block segwit-lock">
                <div className="crt__bot-row">
                    <div className="crt__bot-item">
                        <input name="crt__locktime" type="number" defaultValue="0" placeholder='0' min="0" />
                        <span className="crt__bot-label">Locktime</span>
                    </div>
                    <div className="crt__bot-item">
                        <span id="crt__remainder">0</span>
                        <span className="crt__bot-label">Remainder</span>
                    </div>
                    <div className="crt__bot-item">
                        <Fee />
                        <span className="crt__bot-label">Fee</span>
                    </div>
                </div>
                <div className="crt__bot-row">
                    <div className="crt__bot-item">
                        <input name="crt__version" type="number" defaultValue="2" placeholder="2" min="0" />
                        <span className="crt__bot-label">Version</span>
                    </div>
                    <div className="crt__bot-item">
                        <span id="crt__total">0.3612443</span>
                        <span className="crt__bot-label">Total available</span>
                    </div>
                    <div id="crt__create-btn">
                        <span>Create</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Creator() {
    const { inps } = useContext(InputsContext)
    const { outs } = useContext(OutputsContext)

    const [contextMenuIsShowed, setContextMenuIsShowed] = useState(false)
    const [contextMenuPos, setContextMenuPos] = useState<IContextMenuPos>({ top: 0, left: 0 })

    return (
        <div className="crt" onContextMenu={ev => {
            ev.preventDefault()
            setContextMenuPos({top: ev.clientY, left: ev.clientX})
            setContextMenuIsShowed(true)
        }}>
            <CreatorTop inps={inps} outs={outs} />
            <div className="crt__hline"></div>
            <CreatorBot />
            <ContextMenu isShowed={contextMenuIsShowed} setIsShowed={setContextMenuIsShowed} pos={contextMenuPos} >
                <ContextMenuItem  name="Add new output" onclick={ () => {} } />
            </ContextMenu>
        </div>
    )
}