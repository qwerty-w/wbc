import './Creator.css'
import { useContext } from 'react'
import { ContextMenuItem, ContextMenuDivider, ContextMenu } from '../../common/context-menu/contextmenu'
import { InputsContext, OutputsContext } from './context'
import { wrapString, toBitcoins, BTCamountInput } from '../../../../utils'

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
    const {inps, setInps} = useContext(InputsContext)
    return (
        <ContextMenu items={
            <>
                <ContextMenuItem name='Remove input' onClick={ev => { setInps(inps.filter(inp => inp.txid != txid)) }} />
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
}

function Output({ address, amount }: IOutput) {
    const { outs, setOuts } = useContext(OutputsContext)
    return (
        <ContextMenu items={
            <>
                <ContextMenuItem  name="Remove output" onClick={ ev => { setOuts(outs.filter(out => out.address != address)) } } />
                <ContextMenuDivider/>
                <ContextMenuItem  name="Add new output" onClick={ ev => { } } />
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
                <div className="crt__ios">
                    {
                        inps.map(inp => <Input key={inp.txid} txid={inp.txid} amount={inp.amount} />)
                    }
                </div>
            </div>
            <div className="crt__top-vline"></div>
            <ContextMenu items={
                <>
                    <ContextMenuItem  name="Add new output" onClick={ ev => {} } />
                </>
            }>
                <div className="crt__top-right">
                    <span className="crt__io-label">Outputs</span>
                    <div className="crt__ios">
                        {
                            outs.map(out => <Output key={out.address} address={out.address} amount={out.amount} />)
                        }
                    </div>
                </div>
            </ContextMenu>
        </div>
    )
}

function Fee() {
    return <BTCamountInput defval='0.0008' />
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

    return (
        <div className="crt">
            <CreatorTop inps={inps} outs={outs} />
            <div className="crt__hline"></div>
            <CreatorBot />
        </div>
    )
}