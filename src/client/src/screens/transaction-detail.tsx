import { useParams } from "react-router-dom";
import styled from 'styled-components'

import { toBitcoins } from "./common/utils";
import * as detail from "./common/detail";
import { Transaction } from "./components/create-transaction/transactions";


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

const InfoItemView = ({ label, value }: { label: string, value: string }) => {
    return (
        <detail.InfoItemView label={label} value={value} asStyledItem={StyledInfoItem} asStyledLabel={StyledInfoItemLabel} asStyledValue={StyledInfoItemValue} />
    )
}

const InfoView = ({ tx }: PropsWithTransaction) => {
    return (
        <StyledInfo>
            {
                [[
                    ['In', '0.18161861' ], ['Out', '0.18161861' ]
                ], [
                    ['Inps count', '12' ], ['Outs count', '24' ]
                ], [
                    ['Weight', '402' ], ['Size', '124' ]
                ], [
                    ['Fee', '0.74981032' ], ['Version', '2' ]
                ], [
                    ['Date', '09.03.2023 08:23:89']
                ]].map(container => <StyledInfoContainer>{ container.map(([label, value]) => <InfoItemView label={label} value={value} />) }</StyledInfoContainer>)
            }
        </StyledInfo>
    )
}

const IOitemView = ({ address, amount }: { address: string, amount: number }) => {
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

const InputsView = ({ tx }: PropsWithTransaction) => {
    return (
        <StyledIO>
            <IOitemView address="bc1f-jqnr" amount={ 56769103 } />
        </StyledIO>
    )
}

const OutputsView = () => {
    return (
        <StyledIO>
            <IOitemView address="bc1f-jqnr" amount={ 56769103 } />
        </StyledIO>
    )
}

const BottomView = ({ tx }: PropsWithTransaction) => {
    return (
        <StyledBottom>
            <InfoView tx={tx} />
            <InputsView tx={tx} />
            <OutputsView />
        </StyledBottom>
    )
}

function getTransaction(id: string): Transaction {
    return new Transaction('96f4f76166b6f368ac6a9901446db7b27c057cb441f01589fe32b0d5d95f7cf7', 4, 1694930749, 97261894, 8721)
}

export const TransactionDetailView = () => {
    const id = (useParams().txid as string)
    const tx = getTransaction(id)

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
        }} bottom={<BottomView tx={tx}/>}/>
    )
}