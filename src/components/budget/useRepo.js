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
    // TODO 登录后走数据库
    // const {isAuthenticated} = useAuth0()

    const repo = useContext(RepoContext)

    if (!repo) {
        throw new Error('The repo is missing.')
    }

    return repo
}
