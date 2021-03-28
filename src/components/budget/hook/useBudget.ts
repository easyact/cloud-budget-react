import {Dispatch, Reducer, ReducerAction, ReducerState, useEffect, useReducer} from 'react'
import reducer from '../reducer'
import * as E from 'fp-ts/Either'
import {BudgetRepositoryLocalStorageV2} from '../repository/interpreter/BudgetRepositoryLocalStorageV2'
import {useAuth0} from '@auth0/auth0-react'

export default function useBudget(version: string): [ReducerState<any>, Dispatch<ReducerAction<any>>] {
    const {user = {email: 'default'}} = useAuth0()
    const [state, dispatch] = useReducer<Reducer<any, any>, undefined>(reducer, user.email, email => (
        {
            repo: new BudgetRepositoryLocalStorageV2(),
            budget: {},
            error: false,
            isLoading: false,
            kpi: {expenses: 0},
            saving: false,
            email
        }))
    const {repo, budget, saving, email} = state
    console.log('useBudgeting', email, version, state)
    useEffect(() => {
        // console.log('useBudget.useEffect1', repo, user, version)
        dispatch({type: 'FETCH_BUDGET_REQUEST'})
        repo.getBudget(email, version)().then(E.fold(
            e => dispatch({
                type: 'FETCH_BUDGET_ERROR',
                payload: e
            }),
            budget => dispatch({
                type: 'FETCH_BUDGET_SUCCESS',
                payload: budget
            })
        ))
    }, [repo, email, version])
    useEffect(() => {
        // console.log('useBudget.useEffect2', 'setBudget', saving, user, version, budget)
        if (!saving) return
        repo.setBudget(email, version, budget)().then(E.fold(
            e => dispatch({
                type: 'FETCH_BUDGET_ERROR',
                payload: e
            }),
            () => dispatch({type: 'SAVED_BUDGET'})
        ))
    }, [repo, email, version, budget, saving])
    return [state, dispatch]
}
