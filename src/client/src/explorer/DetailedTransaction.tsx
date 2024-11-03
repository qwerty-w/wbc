import { ReactNode, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components"

import { toBitcoins } from "../core/utils/utils";
import * as detail from "./BaseDetail";
import { Transaction } from "../creator/components/Transactions";
import * as api from "../core/api/explorer"
import * as apitypes from '../core/api/types'
import { observer } from "mobx-react-lite";


const StyledBottom = styled.div`
    width: 100%;
    height: 100%;
    padding: 45px 27px;

    display: flex;
    justify-content: space-between;
    align-items: center;
`

const StyledInfo = styled.div`
    width: 382px;
    height: 392px;
    padding: 25px 15px;
    background-color: #f2f2f2;
    border-radius: 20px;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    gap: 18px;
`
const StyledInfoContainer = styled.div`
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: space-between;
    gap: 12px;
`
const StyledInfoItem = styled.div`
    border-radius: 13px;
    padding-top: 6px;
    padding-left: 13px;
`
const StyledInfoItemLabel = styled.span`
    font-size: 11px;
`
const StyledInfoItemValue = styled.span`
    font-size: 19px;
`

const StyledIO = styled.div`
    width: 265px;
    height: 392px;
    padding: 16px 20px;
    background-color: #f2f2f2;
    border-radius: 20px;;
`
const StyledItemIO = styled.div`
    width: 100%;
    height: 64px;
    padding: 10px 0px;
    border-radius: 20px;
    background-color: #FFF;

    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
`
const StyledAddressIO = styled.span`
    font-weight: 500;
    font-size: 16px;
`
const StyledAddressLabelIO = styled(StyledAddressIO)`
    color: #999;
`
const StyledAddressValueIO = styled(StyledAddressIO)`
    color: #ED9B60;
`
const StyledAmountIO = styled.div`
    font-weight: 500;
    font-size: 18px;
`


type PropsWithTransaction = {
    tx: Transaction
}

const InfoItemView = ({ label, value }: { label: ReactNode, value: ReactNode }) => {
    return <detail.InfoItemView label={label}
        value={value}
        asStyledItem={StyledInfoItem}
        asStyledLabel={StyledInfoItemLabel}
        asStyledValue={StyledInfoItemValue}
    />
}

const InfoView = ({ tx }: PropsWithTransaction) => {
    return (
        <StyledInfo>
            <StyledInfoContainer>
                <InfoItemView label="In" value={tx.inamount}/>
                <InfoItemView label="Out" value={tx.outamount}/>
            </StyledInfoContainer>
            <StyledInfoContainer>
                <InfoItemView label="Inputs count" value={tx.incount}/>
                <InfoItemView label="Outputs count" value={tx.outcount}/>
            </StyledInfoContainer>
            <StyledInfoContainer>
                <InfoItemView label="Weight" value={tx.weight}/>
                <InfoItemView label="Size" value={tx.size}/>
            </StyledInfoContainer>
            <StyledInfoContainer>
                <InfoItemView label="Fee" value={tx.formatted.fee}/>
                <InfoItemView label="Version" value={String(tx.version)}/>
            </StyledInfoContainer>
            <StyledInfoContainer>
                <InfoItemView label="Date" value="12 Thu 2024, 10:18.25"/>
            </StyledInfoContainer>
        </StyledInfo>
    )
}

const IoItemView = ({ address, amount }: { address: string, amount: number }) => {
    return (
        <StyledItemIO>
            <div>
                <StyledAddressLabelIO>Address: </StyledAddressLabelIO>
                <StyledAddressValueIO>{ address }</StyledAddressValueIO>
            </div>
            <StyledAmountIO>{ toBitcoins(amount) }</StyledAmountIO>
        </StyledItemIO>
    )
}

const InputsView = ({ inputs }: { inputs: Array<apitypes.ITransactionInput> }) => {
    return (
        <StyledIO>
            {
                inputs.map(i => <IoItemView address={i.txid} amount={i.amount}/>)
            }
        </StyledIO>
    )
}

const OutputsView = ({ outputs }: { outputs: Array<apitypes.ITransactionOutput> }) => {
    return (
        <StyledIO>
        {
            outputs.map(o => <IoItemView address={o.address ? o.address : '?'} amount={o.amount}/>)
        }
        </StyledIO>
    )
}

const BottomView = ({ tx }: PropsWithTransaction) => {
    return (
        <StyledBottom>
            <InfoView tx={tx}/>
            <InputsView inputs={tx.inputs}/>
            <OutputsView outputs={tx.outputs}/>
        </StyledBottom>
    )
}

export const DetailedTransactionView = observer(() => {
    const id = (useParams().txid as string)
    if (!id) {
        return <>not found</>
    }
    const [unloadedTransaction, _] = useState<Transaction>(
        new Transaction(
            'loading',
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            -1,
            false,
            false,
            -1,
            -1,
            [],
            []
        )
    )
    const [transaction, setTransaction] = useState<Transaction | null>()
    useEffect(() => {
        api.getTransaction(id).then(tx => setTransaction(Transaction.fromObject(tx)))
    }, [])

    return (
        <detail.DetailView string={id} stringFontSize="24px" options={{
            left: <>
                        <detail.QrButton data=""/>
                        <detail.CopyButton string={id} />
                  </>,
            right: <>
                        <detail.StyledOptionButton $width="40px" $height="31px" $borderRadius="9px">
                            <img src="/icons/raw-bin.svg" alt="raw" />
                        </detail.StyledOptionButton>
                   </>
        }} bottom={<BottomView tx={transaction ? transaction : unloadedTransaction}/>}/>
    )
})