import {Dispatch, Reducer, ReducerAction, useEffect, useReducer} from 'react'
import reducer from './reducer'
import {useAuth0} from '@auth0/auth0-react'
import {BudgetEsService} from '../service/budgetEsService'
import {BudgetState} from './budgetState'

export default function useBudget(version: string): [BudgetState, Dispatch<ReducerAction<any>>] {
    const {user = {email: 'default'}, isAuthenticated, isLoading} = useAuth0()
    const [state, dispatch] = useReducer<Reducer<any, any>, undefined>(reducer, user.email, email => ({
        email,
        version,
        budget: {},
        isLoading: false,
        kpi: {expenses: 0},
        saving: false,
        service: new BudgetEsService(email)
    }))
    const {service, email, cmd}: BudgetState = state
    if (email !== user.email && !isLoading && isAuthenticated) dispatch({type: 'USER_AUTHED', payload: user.email})
    console.log('useBudgeting', email, version, state, service)
    useEffect(() => {
        console.log('useBudget.setting',cmd, version, isLoading, service)
        if (isLoading) return
        if (!cmd) return
        service.exec(cmd).then(payload => dispatch({type: 'FETCH_BUDGET_SUCCESS', payload}))
    }, [service, version, isLoading, email, cmd])
    useEffect(() => {
        console.log('useBudget.loading', version, isLoading, service)
        if (isLoading) return
        dispatch({type: 'FETCH_BUDGET_REQUEST'})
        service.getBudget(version).then(payload => dispatch({type: 'FETCH_BUDGET_SUCCESS', payload}))
    }, [service, version, isLoading, email])
    return [state, dispatch]
}
