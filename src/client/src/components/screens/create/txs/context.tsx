import { PropsWithChildren, createContext, useState } from 'react'

export { TransactionsContext, TransactionProvider }


interface ITransaction {
    id: string,
    amount: number
}

type TransactionsContextType = {
    txs: ITransaction[],
    setTxs: React.Dispatch<React.SetStateAction<ITransaction[]>>
}

const TransactionsContext = createContext<TransactionsContextType>({txs: [], setTxs: () => {}})

function TransactionProvider({ children }: PropsWithChildren) {
    const [txs, setTxs] = useState(Array<ITransaction>)

    return (
        <TransactionsContext.Provider value={{txs, setTxs}}>
            { children }
        </TransactionsContext.Provider>
    )
}