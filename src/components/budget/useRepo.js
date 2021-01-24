import {createContext, useContext} from 'react'
import repo from './repository/interpreter/BudgetRepositoryLocalStorage'

const RepoContext = createContext(repo)

export function RepoProvider({children}) {
    return (
        <RepoContext.Provider value={repo}>
            {children}
        </RepoContext.Provider>
    )
}

export function useRepo() {

    const repo = useContext(RepoContext)

    if (!repo) {
        throw new Error('The repo is missing.')
    }

    return repo
}
