import {Dispatch, Reducer, ReducerAction, useEffect, useReducer} from 'react'
import reducer from './reducer'
import {useAuth0} from '@auth0/auth0-react'
import {BudgetEsService, exec, uploadEvents} from '../service/budgetEsService'
import {BudgetState} from './budgetState'
import * as E from 'fp-ts/Either'
import log from '../../log'

export default function useBudget(version: string): [BudgetState, Dispatch<ReducerAction<any>>] {
    const {user = {email: 'default'}, isAuthenticated, isLoading} = useAuth0()
    const [state, dispatch] = useReducer<Reducer<any, any>, undefined>(reducer, user.email, email => ({
        email,
        version,
        budget: {},
        isLoading: false,
        kpi: {expenses: 0},
        saving: false,
        service: new BudgetEsService(email),
        apiUrl: `https://grac2ocq56.execute-api.cn-northwest-1.amazonaws.com.cn/`
    }))
    const {service, email, cmd, apiUrl}: BudgetState = state
    if (email !== user.email && !isLoading && isAuthenticated) dispatch({type: 'USER_AUTHED', payload: user.email})
    console.log('useBudgeting', email, version, state, service)
    useEffect(function login() {
        if (!isAuthenticated) return
        uploadEvents(email, apiUrl)(service.eventStore)().then(E.fold(
            payload => dispatch({type: 'FETCH_BUDGET_ERROR', payload}),
            log('upload success!')))
    }, [apiUrl, email, isAuthenticated, service.eventStore])
    useEffect(function execCmd() {
        if (!cmd) return
        console.log('useBudget.setting', cmd, version, service)
        exec(email, cmd)(service.eventStore)()
            .then(payload => dispatch({type: 'FETCH_BUDGET_SUCCESS', payload}))
    }, [service, version, cmd, email])
    useEffect(function load() {
        if (isLoading) return
        console.log('useBudget.loading', version, isLoading, service)
        dispatch({type: 'FETCH_BUDGET_REQUEST'})
        service.getBudget(version).then(payload => dispatch({type: 'FETCH_BUDGET_SUCCESS', payload}))
    }, [service, version, isLoading, email])
    return [state, dispatch]
}
