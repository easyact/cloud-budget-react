import {Dispatch, Reducer, ReducerAction, ReducerState, useEffect, useReducer} from 'react'
import reducer from '../reducer'
import {useAuth0} from '@auth0/auth0-react'
import {BudgetEsService} from '../service/budgetEsService'

interface BudgetState {
    service: BudgetEsService
    email: string
    authing: boolean
}

export default function useBudget(version: string): [ReducerState<any>, Dispatch<ReducerAction<any>>] {
    const {user = {email: 'default'}, isAuthenticated, isLoading} = useAuth0()
    const [state, dispatch] = useReducer<Reducer<any, any>, undefined>(reducer, user.email, email => (
        {
            email,
            budget: {},
            error: false,
            isLoading: false,
            kpi: {expenses: 0},
            saving: false,
            service: new BudgetEsService(email)
        }))
    const {service, email}: BudgetState = state
    if (email !== user.email && !isLoading && isAuthenticated) dispatch({type: 'USER_AUTHED', payload: user.email})
    console.log('useBudgeting', email, version, state)
    useEffect(() => {
        console.log('useBudget.loading', version, isLoading, service)
        if (isLoading) return
        dispatch({type: 'FETCH_BUDGET_REQUEST'})
        dispatch({
            type: 'FETCH_BUDGET_SUCCESS',
            payload: service.getBudget(version)
        })
    }, [service, version, isLoading])
    return [state, dispatch]
}
