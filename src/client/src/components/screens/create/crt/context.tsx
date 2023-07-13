import { PropsWithChildren, createContext, useState } from 'react'
import { IInput, IOutput } from './Creator'

export { InputsContext, OutputsContext, IOProvider }

type InputsContextType = {
    inps: IInput[],
    setInps: React.Dispatch<React.SetStateAction<IInput[]>>
}

type OutputsContextType = {
    outs: IOutput[],
    setOuts: React.Dispatch<React.SetStateAction<IOutput[]>>
}

const InputsContext = createContext<InputsContextType>({inps: [], setInps: () => {}})
const OutputsContext = createContext<OutputsContextType>({outs: [], setOuts: () => {}})

function IOProvider({ children }: PropsWithChildren) {
    const [inps, setInps] = useState(Array<IInput>)
    const [outs, setOuts] = useState(Array<IOutput>)

    return (
        <InputsContext.Provider value={{inps, setInps}}>
            <OutputsContext.Provider value={{outs, setOuts}}>
                {children}
            </OutputsContext.Provider>
        </InputsContext.Provider>
    )
}
