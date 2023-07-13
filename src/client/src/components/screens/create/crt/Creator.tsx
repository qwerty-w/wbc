import './Creator.css'
import { useState } from 'react'
import { ITransaction } from '../txs/Transactions'

export { type ICreatorAddress, Creator }

interface ICreatorAddress {
    str: string,
    amount: number
}

function CreatorTop() {
    return (
        <div className="crt__top">
            <div className="crt__top-left">
                <span className="crt__io-label">Inputs</span>
                <div className="crt__ios">
                    <div className="crt__input crt__io">
                        <div className="transaction__id">
                            <span className="transaction__id-label">ID:</span>&nbsp;
                            <span className="transaction__id-value">4902-bf63</span>
                        </div>
                        <div className="crt__io-amount">0.03612443</div>
                    </div>
                </div>
            </div>
            <div className="crt__top-vline"></div>
            <div className="crt__top-right">
                <span className="crt__io-label">Outputs</span>
                <div className="crt__ios">
                    <div className="crt__output crt__io">
                        <div className="crt__output-address">
                            <span className="crt__output-address-label">Address:</span>&nbsp;
                            <span className="crt__output-address-value">bc1q-pemf</span>
                        </div>
                        <div className="crt__io-amount">0.03612443</div>
                    </div>
                </div>
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
    const [total, setTotal] = useState(0)
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
    return (
        <div className="crt">
            <CreatorTop />
            <div className="crt__hline"></div>
            <CreatorBot />
        </div>
    )
}