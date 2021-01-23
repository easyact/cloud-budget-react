import {createContext} from 'react'
import {BudgetRepositoryLocalStorage} from './repository/interpreter/BudgetRepositoryLocalStorage'

const repo = new BudgetRepositoryLocalStorage()
const RepoContext = createContext(repo)

export function RepoProvider({children}) {
    return (
        <RepoContext.Provider value={repo}>
            {children}
        </RepoContext.Provider>
    )
}

